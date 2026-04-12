-- ==============================================================================
-- TEA SPILL ☕ — Storage Bucket RLS Fix
-- Run this in your Supabase SQL Editor.
-- ==============================================================================

-- 1. Ensure the bucket actually exists and is private
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification_ids', 'verification_ids', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 2. Drop any old, broken policies on the objects table
DROP POLICY IF EXISTS "Users can upload IDs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload IDs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload IDs" ON storage.objects;

-- 3. Create a strict, bulletproof policy allowing authenticated users to upload their ID images
CREATE POLICY "Authenticated users can upload IDs" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'verification_ids' );

-- 4. Ensure ONLY administrators can VIEW the images (so you can see them in your Admin Portal)
CREATE POLICY "Only admins can view IDs" 
ON storage.objects FOR SELECT
TO authenticated
USING ( 
    bucket_id = 'verification_ids' 
    AND EXISTS (
        SELECT 1 FROM public.users 
        WHERE public.users.auth_id = auth.uid() AND public.users.is_admin = true
    )
);
