-- Career goals fields for personalized plan generation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS desired_job TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS desired_industry TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work_type TEXT; -- 'remote', 'hybrid', 'onsite', 'flexible'
