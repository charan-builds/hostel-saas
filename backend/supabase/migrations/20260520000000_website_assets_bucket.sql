-- Supabase Storage Bucket for Public Website Assets
-- Enables multi-tenant dynamic imagery

INSERT INTO storage.buckets (id, name, public)
VALUES ('website-assets', 'website-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for 'website-assets'

-- Allow public read access to all assets
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'website-assets');

-- Allow admins and superadmins to insert assets
CREATE POLICY "Admin Insert Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'website-assets' 
    AND (
        (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')
    )
);

-- Allow admins and superadmins to update their own assets
CREATE POLICY "Admin Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'website-assets' 
    AND (
        (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')
    )
);

-- Allow admins and superadmins to delete assets
CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'website-assets' 
    AND (
        (SELECT role FROM public.user_profiles WHERE id = auth.uid()) IN ('admin', 'superadmin')
    )
);
