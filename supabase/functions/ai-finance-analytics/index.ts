import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  question: string;
  transactions: any[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { question, transactions }: RequestBody = await req.json();

    if (!question || !transactions) {
      return new Response(
        JSON.stringify({ error: "Missing question or transactions data" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("MiChivito");
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Prepare transaction summary for AI
    const transactionSummary = transactions.map((t: any) => ({
      type: t.type,
      amount: t.amount,
      category: t.category,
      subcategory: t.subcategoryId,
      frequency: t.frequency,
      date: t.date,
    }));

    // Calculate totals
    const totals = transactions.reduce(
      (acc: any, t: any) => {
        if (t.type === "ingreso") acc.ingresos += t.amount;
        if (t.type === "gasto") acc.gastos += t.amount;
        if (t.type === "deuda") acc.deudas += t.amount;
        if (t.type === "ahorro") acc.ahorros += t.amount;
        return acc;
      },
      { ingresos: 0, gastos: 0, deudas: 0, ahorros: 0 }
    );

    const prompt = `Eres un asistente financiero personal experto. Analiza los siguientes datos financieros del usuario y responde su pregunta en español.

Resumen de transacciones:
- Total de ingresos: $${totals.ingresos.toFixed(2)} MXN
- Total de gastos: $${totals.gastos.toFixed(2)} MXN
- Total de deudas: $${totals.deudas.toFixed(2)} MXN
- Total de ahorros: $${totals.ahorros.toFixed(2)} MXN
- Balance neto: $${(totals.ingresos - totals.gastos).toFixed(2)} MXN
- Total de transacciones: ${transactions.length}

Detalle de transacciones (últimas 100):
${JSON.stringify(transactionSummary.slice(0, 100), null, 2)}

Pregunta del usuario: ${question}

Por favor proporciona un análisis detallado, práctico y accionable. Usa formato markdown para mejor legibilidad. Incluye números específicos cuando sea relevante.`;

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);

      let errorMessage = "Failed to get AI response";
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = `Gemini API error: ${errorData.error.message}`;
        }
      } catch (e) {
        errorMessage = `Gemini API error (${geminiResponse.status}): ${errorText.substring(0, 200)}`;
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const geminiData = await geminiResponse.json();
    const aiResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
