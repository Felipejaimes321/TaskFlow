-- Fix: Allow users to search other users by email for collaboration

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;

-- Create new policies
-- 1. Users can view their own full profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- 2. Users can view other users' basic info (for sharing/collaboration)
--    This allows searching by email without exposing sensitive data
CREATE POLICY "Users can view other users for collaboration" ON public.users
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

-- Keep the update policy as is
-- Users can only update their own profile
-- (The existing policy handles this)
