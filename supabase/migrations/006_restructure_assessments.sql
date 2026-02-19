-- Restructure assessments table to support resume/job-based assessments
-- Drop old assessments table and recreate with new schema

DROP TABLE IF EXISTS job_fit_analyses CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;

CREATE TABLE assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,

  -- Scores (0-100)
  overall_fit_score INTEGER,
  skills_match_score INTEGER,
  experience_match_score INTEGER,
  stability_score INTEGER,
  culture_fit_score INTEGER,

  -- Full assessment JSON from Claude
  assessment_data JSONB,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own assessments"
  ON assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments"
  ON assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments"
  ON assessments FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_resume_id ON assessments(resume_id);
CREATE INDEX idx_assessments_job_id ON assessments(job_id);
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);

-- Ensure the trigger function exists (in case it wasn't created earlier)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at
CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
