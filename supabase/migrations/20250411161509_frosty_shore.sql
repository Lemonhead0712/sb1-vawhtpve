/*
  # Create Analysis Data Tables

  1. New Tables
    - `analysis_results`
      - Stores individual analysis results for each user
      - Links to profiles table
      - Includes scores, comparisons, and insights
    
    - `gottman_analyses`
      - Stores Gottman's Four Horsemen analysis results
      - Links to profiles table
      - Tracks presence levels and recommendations

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
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

-- Policies for analysis_results
CREATE POLICY "Users can manage own analysis results"
  ON analysis_results
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for gottman_analyses
CREATE POLICY "Users can manage own gottman analyses"
  ON gottman_analyses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);