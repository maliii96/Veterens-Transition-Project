-- Usage tracking for API rate limiting
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_assessments_month INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_chat_month INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_plan_count INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_resume_month INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_reset_date DATE DEFAULT CURRENT_DATE;
