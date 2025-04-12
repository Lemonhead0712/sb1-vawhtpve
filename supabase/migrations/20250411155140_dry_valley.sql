/*
  # Create profiles table with preferences

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `birthdate` (date)
      - `location` (text)
      - `bio` (text)
      - `preferences` (jsonb)
      - `last_notification_sent` (timestamp with time zone)
      - `last_login_reminder` (timestamp with time zone)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `profiles` table
    - Add policies for authenticated users to read and update their own data
*/

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

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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