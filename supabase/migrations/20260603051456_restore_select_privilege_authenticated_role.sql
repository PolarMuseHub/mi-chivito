/*
  # Restore SELECT privilege for authenticated role

  1. Problem
    - A previous security migration incorrectly revoked SELECT from the
      authenticated role on several tables.
    - This broke any Supabase client call that chains .select() after
      INSERT/UPDATE, and any standalone SELECT query from the frontend.
    - RLS policies (not role-level REVOKEs) are the correct row-level guard.

  2. Changes
    - Restore GRANT SELECT on financial_goals, transactions, profiles,
      and subscriptions to the authenticated role.

  3. Security
    - RLS remains ENABLED on all four tables — no policies are modified.
    - Row-level access is still enforced by the existing auth.uid() policies.
*/

GRANT SELECT ON public.financial_goals TO authenticated;
GRANT SELECT ON public.transactions TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
