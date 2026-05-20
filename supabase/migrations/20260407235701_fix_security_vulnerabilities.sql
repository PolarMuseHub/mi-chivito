/*
  # Fix Critical Security Vulnerabilities

  This migration addresses security issues identified in the production audit:

  1. **RLS Policy for usage_logs**
     - Problem: Currently allows anonymous (unauthenticated) users to insert logs
     - Fix: Restrict INSERT policy to authenticated users only
     - Impact: Only logged-in users can create usage logs

  2. **Function Search Path Mutable**
     - Problem: Financial goals functions don't explicitly set search_path
     - Fix: Add SECURITY DEFINER SET search_path = public to both functions
     - Impact: Prevents search path manipulation attacks
     - Functions affected:
       * update_financial_goals_updated_at()
       * update_financial_goals_completed_at()

  3. **Edge Function JWT Protection**
     - Note: process-receipt Edge Function already uses verify_jwt: true
     - No migration needed, protection is at the Edge Function level

  ## Security Notes
  - These changes are critical for production deployment
  - All existing functionality preserved
  - Only security posture is improved
*/

-- ============================================================================
-- 1. FIX USAGE_LOGS RLS POLICY
-- ============================================================================

-- Drop the overly permissive anonymous insert policy
DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.usage_logs;

-- Create new policy that only allows authenticated users to insert logs
CREATE POLICY "Authenticated users can insert logs"
  ON public.usage_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- 2. FIX FUNCTION SEARCH PATH FOR FINANCIAL GOALS
-- ============================================================================

-- Recreate update_financial_goals_updated_at with secure search_path
CREATE OR REPLACE FUNCTION update_financial_goals_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate update_financial_goals_completed_at with secure search_path
CREATE OR REPLACE FUNCTION update_financial_goals_completed_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_active = false AND OLD.is_active = true AND NEW.completed_at IS NULL THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$;
