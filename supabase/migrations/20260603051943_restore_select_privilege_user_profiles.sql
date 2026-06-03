/*
  # Restore SELECT privilege for authenticated role on user_profiles

  1. Problem
    - The same security migration that broke financial_goals, transactions,
      profiles, and subscriptions also revoked SELECT from user_profiles for
      the authenticated role.
    - PostgREST requires SELECT on a table to evaluate the USING clause of
      an UPDATE RLS policy. Without it, any UPDATE call (including the goal
      info save during onboarding) returns a permission error.
    - GoalSetup.tsx calls updateGoalInfo(), which runs an UPDATE on
      user_profiles. That UPDATE fails silently, returning false, which
      triggers the "Error al guardar. Intenta de nuevo." message before
      createFinancialGoal() is even reached.

  2. Changes
    - Restore GRANT SELECT on user_profiles to the authenticated role.

  3. Security
    - RLS remains ENABLED on user_profiles — no policies are modified.
    - Row-level access is still enforced by the existing auth.uid() policies.
*/

GRANT SELECT ON public.user_profiles TO authenticated;
