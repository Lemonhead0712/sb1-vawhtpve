/*
  # Create Analysis Tables and Policies

  1. New Tables
    - analysis_results
      - Stores relationship analysis data
      - Includes scores, insights, and message patterns
    - gottman_analyses
      - Stores Gottman's Four Horsemen analysis
      - Tracks relationship warning signs and recommendations

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data

  3. Changes
    - Safe creation of tables with existence checks
    - Safe policy creation with existence checks
*/

-- Analysis Results Table
CREATE TABLE IF NOT EXISTS analysis_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  subject_a_score integer CHECK (subject_a_score >= 0 AND subject_a_score <= 100),
  subject_b_score integer CHECK (subject_b_score >= 0 AND subject_b_score <= 100),
  comparison text,
  subject_a_insights text[],
  subject_b_insights text[],
  message_patterns jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gottman Analysis Table
CREATE TABLE IF NOT EXISTS gottman_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  horseman text NOT NULL,
  description text,
  presence text CHECK (presence IN ('low', 'moderate', 'high')),
  examples text[],
  recommendations text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE gottman_analyses ENABLE ROW LEVEL SECURITY;

-- Safely create policies
DO $$ 
BEGIN
    -- Check if the analysis_results policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'analysis_results' 
        AND policyname = 'Users can manage own analysis results'
    ) THEN
        CREATE POLICY "Users can manage own analysis results"
            ON analysis_results
            FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Check if the gottman_analyses policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'gottman_analyses' 
        AND policyname = 'Users can manage own gottman analyses'
    ) THEN
        CREATE POLICY "Users can manage own gottman analyses"
            ON gottman_analyses
            FOR ALL
            TO authenticated
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END
$$;