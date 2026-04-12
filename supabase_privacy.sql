-- ==============================================================================
-- TEA SPILL ☕ — Privacy Lockdown execution
-- Run this in your Supabase SQL Editor.
-- ==============================================================================

-- This completely annihilates the ability for any student/user to query the users table 
-- to see other people's data. 
DROP POLICY IF EXISTS "Users can view all verified profiles" ON public.users;

-- Note: The following policies will remain natively active to ensure the app functions:
-- 1. "Users can view their own profile" (So a student can see their own status)
-- 2. "Admins can view all profiles" (So you can still moderate)
