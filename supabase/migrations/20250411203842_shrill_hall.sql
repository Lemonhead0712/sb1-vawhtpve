/*
  # Create analysis_results table with enhanced fields

  1. New Table
    - analysis_results
      - id (uuid, primary key)
      - user_id (uuid, references profiles)
      - raw_text (text)
      - ocr_confidence (float)
      - analysis_results (jsonb)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Add indexes for performance
*/

-- Create analysis_results table
CREATE TABLE IF NOT EXISTS analysis_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  raw_text text NOT NULL,
  ocr_confidence float,
  analysis_results jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- Safely create policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analysis_results' 
    AND policyname = 'Users can read own analysis results'
  ) THEN
    CREATE POLICY "Users can read own analysis results"
      ON analysis_results
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analysis_results' 
    AND policyname = 'Users can insert own analysis results'
  ) THEN
    CREATE POLICY "Users can insert own analysis results"
      ON analysis_results
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analysis_results' 
    AND policyname = 'Users can update own analysis results'
  ) THEN
    CREATE POLICY "Users can update own analysis results"
      ON analysis_results
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analysis_results' 
    AND policyname = 'Users can delete own analysis results'
  ) THEN
    CREATE POLICY "Users can delete own analysis results"
      ON analysis_results
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_analysis_results_updated_at
  BEFORE UPDATE ON analysis_results
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_analysis_results_user_id ON analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_created_at ON analysis_results(created_at);