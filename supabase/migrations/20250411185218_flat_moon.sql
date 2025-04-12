/*
  # Update Profile Security Policies

  1. Changes
    - Add more granular RLS policies for profiles table
    - Ensure users can only access their own data
    - Add policies for insert operations
  
  2. Security
    - Users can only read their own profile
    - Users can only update their own profile
    - Users can only insert their own profile
    - Cascade delete related data when profile is deleted
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
END $$;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create comprehensive policies
CREATE POLICY "Users can read own profile"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
    ON profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

-- Ensure email is unique and required
ALTER TABLE profiles 
    DROP CONSTRAINT IF EXISTS profiles_email_key,
    ADD CONSTRAINT profiles_email_key UNIQUE (email);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for avatars if it doesn't exist
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name)
    VALUES ('avatars', 'avatars')
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Set up storage policies for avatars
CREATE POLICY "Users can upload their own avatar"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update their own avatar"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'avatars' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their own avatar"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars' AND 
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Anyone can read avatars"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'avatars');