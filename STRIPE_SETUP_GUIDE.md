# Stripe Subscription Setup Guide

This guide will help you complete the Stripe integration for the 30-day free trial and subscription system.

## Overview

The application now includes:
- 30-day free trial for new users
- Trial countdown banner showing days remaining
- Automatic trial expiration tracking
- Stripe checkout integration
- Subscription status management
- Access control based on subscription status

## Setup Steps

### 1. Database Migration

Run the following SQL in your Supabase SQL Editor to create the subscriptions table:

```sql
/*
  # Add Subscription System with 30-Day Free Trial

  Creates the subscriptions table and related functions for managing
  user subscriptions with Stripe integration.
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'trial',
  trial_start timestamptz NOT NULL DEFAULT now(),
  trial_end timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own subscription
CREATE POLICY "Users can read own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Policy: Users can insert their initial subscription (trial)
CREATE POLICY "Users can create own subscription"
  ON subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Policy: Users can update their own subscription (for cancellation requests)
CREATE POLICY "Users can update own subscription"
  ON subscriptions
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
DROP TRIGGER IF EXISTS set_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Function to check if user has active access (trial or paid)
CREATE OR REPLACE FUNCTION has_active_subscription(check_user_id uuid)
RETURNS boolean AS $$
DECLARE
  sub_status text;
  sub_trial_end timestamptz;
BEGIN
  SELECT status, trial_end INTO sub_status, sub_trial_end
  FROM subscriptions
  WHERE user_id = check_user_id;

  -- No subscription record means no access
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Check if trial is still valid
  IF sub_status = 'trial' AND sub_trial_end > now() THEN
    RETURN true;
  END IF;

  -- Check if subscription is active
  IF sub_status = 'active' THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Configure Stripe Secret Keys

You need to add your Stripe keys to Supabase Edge Functions:

1. Go to your Stripe Dashboard: https://dashboard.stripe.com/apikeys
2. Copy your **Secret key** (starts with `sk_`)
3. Get your **Webhook signing secret** (we'll set this up in step 4)

Add these as secrets to your Supabase project:

```bash
# Using Supabase CLI (if available)
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_secret_key_here
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

Or add them through the Supabase Dashboard:
- Go to Project Settings > Edge Functions > Secrets
- Add `STRIPE_SECRET_KEY` with your Stripe secret key
- Add `STRIPE_WEBHOOK_SECRET` with your webhook signing secret (after step 4)

### 3. Deploy Edge Functions

Deploy the two edge functions that were created:

#### create-checkout-session
This function creates Stripe checkout sessions for new subscriptions.

Location: `supabase/functions/create-checkout-session/index.ts`

#### stripe-webhook
This function handles Stripe webhook events to update subscription status.

Location: `supabase/functions/stripe-webhook/index.ts`

Deploy using Supabase CLI:
```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

### 4. Configure Stripe Webhooks

1. Go to Stripe Dashboard: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add this as `STRIPE_WEBHOOK_SECRET` in Supabase (see step 2)

### 5. Update Stripe Price ID (if needed)

The application is configured to use price ID: `price_1SjOxEPV6g1Ef54xjA0UZEvX`

If you need to use a different price:
1. Create a product and price in Stripe Dashboard
2. Copy the price ID
3. Update it in: `supabase/functions/create-checkout-session/index.ts`
   - Look for: `const STRIPE_PRICE_ID = "price_1SjOxEPV6g1Ef54xjA0UZEvX";`

## How It Works

### New User Flow
1. User signs up
2. A subscription record is automatically created with:
   - Status: `trial`
   - Trial start: Current date
   - Trial end: 30 days from now
3. User has full access during trial period
4. Banner shows days remaining in trial

### Trial Expiration
1. When trial ends, user is shown a subscription required screen
2. User clicks "Subscribe Now"
3. Redirected to Stripe checkout
4. After successful payment:
   - Webhook updates subscription status to `active`
   - User regains access

### Subscription Statuses

- **trial**: User is in 30-day free trial
- **active**: User has paid subscription
- **past_due**: Payment failed, retry in progress
- **canceled**: User canceled subscription
- **expired**: Trial ended without payment

### Access Control

Users have access when:
- Status is `trial` AND trial_end > current date
- Status is `active`

All other cases block access and show subscription prompt.

## Testing

### Test Mode
Use Stripe test mode with test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Test Webhooks
Use Stripe CLI to test webhooks locally:
```bash
stripe listen --forward-to https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
```

## Troubleshooting

### Users not seeing trial
- Check if subscription record was created in database
- Verify RLS policies allow users to read their subscription

### Checkout not working
- Verify `STRIPE_SECRET_KEY` is set correctly
- Check browser console for errors
- Verify edge function is deployed

### Webhooks not working
- Verify `STRIPE_WEBHOOK_SECRET` is set
- Check webhook endpoint is reachable
- Review Stripe Dashboard webhook logs

## UI Components

### SubscriptionBanner
Shows at top of app when:
- Trial is active (shows days remaining)
- Trial ending soon (orange warning at 7 days)
- Trial expired (red alert)
- Payment past due (yellow warning)

### SubscriptionGate
Blocks app access when subscription is not active, showing:
- Lock icon
- Feature list
- Subscribe button

### Payment Success
After successful payment, user is redirected to: `/?payment=success`
You can detect this and show a success message if desired.

## Security Notes

- All RLS policies are in place to protect subscription data
- Webhook signatures are verified before processing
- Service role key is only used in edge functions, never exposed to client
- Customer IDs stored securely in database
