/*
  # Grant anonymous SELECT permission on profiles table

  1. Permissions
    - Grant SELECT permission on `profiles` table to `anon` role
    - This allows the Supabase client connection test to succeed
    - RLS policies will continue to enforce row-level access restrictions

  2. Security
    - Existing RLS policies remain in place
    - Anonymous users can only see what RLS policies allow
    - This only enables the table endpoint, not actual data access
*/

-- Grant SELECT permission on profiles table to anonymous role
GRANT SELECT ON public.profiles TO anon;