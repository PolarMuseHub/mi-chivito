/*
  # Fix security definer views

  1. Changes
    - Recreate all 9 public analytics views with SECURITY INVOKER instead of SECURITY DEFINER
    - Affected views: v_surplus_behavior, v_archetype_distribution, v_goal_type,
      v_monthly_registrations, v_income_frequency, v_savings_method,
      v_emergency_fund, v_onboarding_summary, v_leak_category
  2. Security
    - SECURITY INVOKER ensures queries run with the calling user's permissions,
      respecting RLS policies on the underlying tables
*/

CREATE OR REPLACE VIEW public.v_archetype_distribution
WITH (security_invoker = true)
AS
SELECT archetype_id,
    count(*) AS total_users,
    round(((count(*)::numeric * 100.0) / sum(count(*)) OVER ()), 1) AS percentage
FROM onboarding_responses
WHERE archetype_id IS NOT NULL
GROUP BY archetype_id
ORDER BY count(*) DESC;

CREATE OR REPLACE VIEW public.v_emergency_fund
WITH (security_invoker = true)
AS
SELECT q5_emergency_fund AS value,
    count(*) AS total
FROM onboarding_responses
GROUP BY q5_emergency_fund
ORDER BY count(*) DESC;

CREATE OR REPLACE VIEW public.v_goal_type
WITH (security_invoker = true)
AS
SELECT goal_type AS value,
    count(*) AS total
FROM onboarding_responses
WHERE goal_type IS NOT NULL
GROUP BY goal_type
ORDER BY count(*) DESC;

CREATE OR REPLACE VIEW public.v_income_frequency
WITH (security_invoker = true)
AS
SELECT q1_income_frequency AS value,
    count(*) AS total
FROM onboarding_responses
GROUP BY q1_income_frequency
ORDER BY count(*) DESC;

CREATE OR REPLACE VIEW public.v_leak_category
WITH (security_invoker = true)
AS
SELECT q4_leak_category AS value,
    count(*) AS total
FROM onboarding_responses
GROUP BY q4_leak_category
ORDER BY count(*) DESC;

CREATE OR REPLACE VIEW public.v_monthly_registrations
WITH (security_invoker = true)
AS
SELECT date_trunc('month', created_at) AS month,
    archetype_id,
    count(*) AS new_users
FROM onboarding_responses
GROUP BY date_trunc('month', created_at), archetype_id
ORDER BY date_trunc('month', created_at) DESC;

CREATE OR REPLACE VIEW public.v_onboarding_summary
WITH (security_invoker = true)
AS
SELECT count(DISTINCT user_id) AS total_users,
    count(*) AS total_completions,
    max(created_at) AS last_completion,
    min(created_at) AS first_completion
FROM onboarding_responses;

CREATE OR REPLACE VIEW public.v_savings_method
WITH (security_invoker = true)
AS
SELECT q2_savings_method AS value,
    count(*) AS total
FROM onboarding_responses
GROUP BY q2_savings_method
ORDER BY count(*) DESC;

CREATE OR REPLACE VIEW public.v_surplus_behavior
WITH (security_invoker = true)
AS
SELECT q3_surplus_behavior AS value,
    count(*) AS total
FROM onboarding_responses
GROUP BY q3_surplus_behavior
ORDER BY count(*) DESC;
