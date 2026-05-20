/*
  # Fix mutable search_path on trigger functions

  1. Changes
    - Recreate update_financial_goals_completed_at with SET search_path = ''
    - Recreate update_financial_goals_updated_at with SET search_path = ''

  2. Security
    - A mutable search_path allows a malicious user to inject a different schema
      into the search path and shadow pg built-ins or application objects.
    - Setting search_path = '' forces all object references to be fully qualified,
      eliminating the attack surface.
    - Both functions already use SECURITY INVOKER; this adds the search_path lock.
*/

CREATE OR REPLACE FUNCTION public.update_financial_goals_completed_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NEW.is_active = false AND OLD.is_active = true AND NEW.completed_at IS NULL THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_financial_goals_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
