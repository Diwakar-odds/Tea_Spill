-- ==============================================================================
-- TEA SPILL ☕ — Secure Admin Email Viewer RPC
-- Run this in your Supabase SQL Editor.
-- ==============================================================================

CREATE OR REPLACE FUNCTION get_admin_users(p_status TEXT DEFAULT NULL)
RETURNS TABLE (
    id UUID, 
    auth_id UUID, 
    username TEXT, 
    real_name TEXT, 
    college_name TEXT, 
    department TEXT, 
    section TEXT, 
    dob DATE, 
    id_url TEXT, 
    tea_points INTEGER, 
    verification_status TEXT, 
    is_admin BOOLEAN, 
    created_at TIMESTAMPTZ, 
    email TEXT
)
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Security Check: Ensure the person calling this function is an Admin.
    -- We verify that the user's auth matches a profile with 'is_admin = true'.
    IF NOT EXISTS (
        SELECT 1 FROM public.users 
        WHERE public.users.auth_id = auth.uid() AND public.users.is_admin = true
    ) THEN
        RAISE EXCEPTION 'Access denied: Requires admin privileges';
    END IF;

    -- 2. Secure Data Fetch: Join public profile with hidden Auth bucket email.
    RETURN QUERY
    SELECT u.id, u.auth_id, u.username, u.real_name, u.college_name, 
           u.department, u.section, u.dob, u.id_url, u.tea_points, 
           u.verification_status, u.is_admin, u.created_at, a.email::TEXT
    FROM public.users u
    JOIN auth.users a ON u.auth_id = a.id
    WHERE (p_status IS NULL OR u.verification_status = p_status)
    ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql;
