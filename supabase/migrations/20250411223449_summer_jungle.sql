/*
  # Create auth sessions table and management functions

  1. New Tables
    - `auth_sessions`
      - Tracks user authentication sessions
      - Stores device info and metadata
      - Manages session expiration

  2. Changes
    - Add last_session column to profiles table
    - Add functions for session management
    - Add triggers for activity tracking

  3. Security
    - Enable RLS on auth_sessions table
    - Add policies for authenticated users
*/

-- Create auth_sessions table
CREATE TABLE IF NOT EXISTS auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  last_activity_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  device_info text,
  ip_address inet,
  is_valid boolean DEFAULT true
);

-- Add session tracking to profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_session'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_session timestamptz;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;

-- Safely create policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'auth_sessions' 
    AND policyname = 'Users can manage own sessions'
  ) THEN
    CREATE POLICY "Users can manage own sessions"
      ON auth_sessions
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_last_activity ON auth_sessions(last_activity_at);

-- Create function to update last activity
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = now();
  
  -- Update profile's last session
  UPDATE profiles 
  SET last_session = now()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for session activity
CREATE TRIGGER update_session_activity_trigger
  BEFORE UPDATE ON auth_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_activity();

-- Create function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM auth_sessions
  WHERE expires_at < now()
  OR is_valid = false;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to clean expired sessions on activity
CREATE TRIGGER clean_expired_sessions_trigger
  AFTER INSERT OR UPDATE ON auth_sessions
  FOR EACH STATEMENT
  EXECUTE FUNCTION clean_expired_sessions();