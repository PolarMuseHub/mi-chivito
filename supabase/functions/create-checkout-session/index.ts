import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_PRICE_ID = "price_1SjOxEPV6g1Ef54xjA0UZEvX";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (!STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not configured");
      return new Response(
        JSON.stringify({
          error: "Stripe no está configurado. Por favor contacta al administrador.",
          details: "STRIPE_SECRET_KEY environment variable is missing"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { successUrl, cancelUrl } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      console.log("Creating new Stripe customer for user:", user.id);
      const customerResponse = await fetch(
        "https://api.stripe.com/v1/customers",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            email: user.email!,
            metadata: JSON.stringify({ supabase_user_id: user.id }),
          }),
        }
      );

      if (!customerResponse.ok) {
        const errorText = await customerResponse.text();
        console.error("Stripe customer creation failed:", errorText);
        throw new Error(`Failed to create Stripe customer: ${errorText}`);
      }

      const customer = await customerResponse.json();

      if (customer.error) {
        console.error("Stripe API error:", customer.error);
        throw new Error(`Stripe error: ${customer.error.message}`);
      }

      customerId = customer.id;
      console.log("Created Stripe customer:", customerId);

      await supabaseAdmin
        .from("subscriptions")
        .upsert({
          id: user.id,
          stripe_customer_id: customerId,
        });
    }

    console.log("Creating checkout session for customer:", customerId);
    const checkoutSession = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          customer: customerId,
          "line_items[0][price]": STRIPE_PRICE_ID,
          "line_items[0][quantity]": "1",
          mode: "subscription",
          success_url: successUrl,
          cancel_url: cancelUrl,
          "subscription_data[metadata][supabase_user_id]": user.id,
        }),
      }
    );

    if (!checkoutSession.ok) {
      const errorText = await checkoutSession.text();
      console.error("Stripe checkout session creation failed:", errorText);
      throw new Error(`Failed to create checkout session: ${errorText}`);
    }

    const session = await checkoutSession.json();

    if (session.error) {
      console.error("Stripe API error:", session.error);
      throw new Error(`Stripe error: ${session.error.message}`);
    }

    if (!session.url) {
      console.error("No checkout URL in response:", session);
      throw new Error("No checkout URL returned from Stripe");
    }

    console.log("Checkout session created successfully:", session.id);
    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in create-checkout-session:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Error desconocido al crear sesión de pago",
        details: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});