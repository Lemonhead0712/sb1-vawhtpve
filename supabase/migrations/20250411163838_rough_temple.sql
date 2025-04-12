/*
  # Update profiles table and policies

  1. Changes
    - Creates profiles table if it doesn't exist
    - Safely adds RLS policies with existence checks
  
  2. Security
    - Enables RLS on profiles table
    - Adds policies for authenticated users to:
      - Read their own profile data
      - Update their own profile data
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text UNIQUE NOT NULL,
  phone text,
  birthdate date,
  location text,
  bio text,
  preferences jsonb DEFAULT '{"theme": "light", "privacy": "friends", "notifications": true, "emailFrequency": "weekly", "loginReminders": true}'::jsonb,
  last_notification_sent timestamptz,
  last_login_reminder timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Safely create policies
DO $$ 
BEGIN
    -- Check if the read policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can read own profile'
    ) THEN
        CREATE POLICY "Users can read own profile"
            ON profiles
            FOR SELECT
            TO authenticated
            USING (auth.uid() = id);
    END IF;

    -- Check if the update policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
            ON profiles
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = id)
            WITH CHECK (auth.uid() = id);
    END IF;
END
$$;