
-- Add points and completion_time columns to user_scores if they don't exist
DO $$
BEGIN
    -- Check if points column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_scores'
        AND column_name = 'points'
    ) THEN
        -- Add points column
        ALTER TABLE public.user_scores ADD COLUMN points integer DEFAULT 0;
    END IF;
    
    -- Check if completion_time column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_scores'
        AND column_name = 'completion_time'
    ) THEN
        -- Add completion_time column
        ALTER TABLE public.user_scores ADD COLUMN completion_time float DEFAULT 0;
    END IF;
    
    -- Check if avatar_url column exists in profiles table
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'avatar_url'
    ) THEN
        -- Add avatar_url column
        ALTER TABLE public.profiles ADD COLUMN avatar_url text;
    END IF;
    
    -- Check if updated_at column exists in profiles table
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'updated_at'
    ) THEN
        -- Add updated_at column
        ALTER TABLE public.profiles ADD COLUMN updated_at timestamp with time zone DEFAULT now();
    END IF;
END $$;

-- Create storage bucket for avatars if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM storage.buckets
        WHERE id = 'avatars'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('avatars', 'avatars', true);
    END IF;
END $$;

-- Create RLS policy for avatar storage bucket
DO $$
BEGIN
    -- Check if the policy already exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'objects'
        AND policyname = 'Avatar read access'
        AND schemaname = 'storage'
    ) THEN
        -- Allow anyone to read avatars
        CREATE POLICY "Avatar read access" ON storage.objects
        FOR SELECT USING (bucket_id = 'avatars');
    END IF;
    
    -- Check if the policy already exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'objects'
        AND policyname = 'Avatar insert access'
        AND schemaname = 'storage'
    ) THEN
        -- Allow authenticated users to upload their own avatars
        CREATE POLICY "Avatar insert access" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = 'avatars'
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
    
    -- Check if the policy already exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'objects'
        AND policyname = 'Avatar update access'
        AND schemaname = 'storage'
    ) THEN
        -- Allow authenticated users to update their own avatars
        CREATE POLICY "Avatar update access" ON storage.objects
        FOR UPDATE USING (
            bucket_id = 'avatars'
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
    
    -- Check if the policy already exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE tablename = 'objects'
        AND policyname = 'Avatar delete access'
        AND schemaname = 'storage'
    ) THEN
        -- Allow authenticated users to delete their own avatars
        CREATE POLICY "Avatar delete access" ON storage.objects
        FOR DELETE USING (
            bucket_id = 'avatars'
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
END $$;
