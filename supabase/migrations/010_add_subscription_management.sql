-- Enhanced subscription management for Stripe integration
-- Replaces simple is_paid boolean with full subscription tracking

-- Drop old is_paid column if it exists
ALTER TABLE profiles DROP COLUMN IF EXISTS is_paid;

-- Add subscription tier (free or pro)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro'));

-- Add Stripe customer and subscription IDs
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE;

-- Add subscription status and metadata
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'inactive'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_current_period_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT false;

-- Ensure usage tracking columns exist (may already exist from 007 migration)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_assessments_month INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_chat_month INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_plan_count INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_resume_count INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_reset_date DATE DEFAULT CURRENT_DATE;

-- Create index for faster Stripe lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Function to get usage limits based on subscription tier
CREATE OR REPLACE FUNCTION get_usage_limits(tier TEXT)
RETURNS TABLE (
  assessments_limit INT,
  chat_limit INT,
  plans_limit INT,
  resumes_limit INT
) AS $$
BEGIN
  IF tier = 'pro' THEN
    RETURN QUERY SELECT 50, 500, 5, 5;
  ELSE -- free tier
    RETURN QUERY SELECT 3, 10, 1, 2;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has reached their limit for a feature
CREATE OR REPLACE FUNCTION check_usage_limit(
  user_id UUID,
  feature_type TEXT -- 'assessments', 'chat', 'plans', or 'resumes'
)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier TEXT;
  current_usage INT;
  limit_value INT;
  limits RECORD;
BEGIN
  -- Get user's tier and current usage
  SELECT
    subscription_tier,
    CASE feature_type
      WHEN 'assessments' THEN usage_assessments_month
      WHEN 'chat' THEN usage_chat_month
      WHEN 'plans' THEN usage_plan_count
      WHEN 'resumes' THEN usage_resume_count
      ELSE 0
    END
  INTO user_tier, current_usage
  FROM profiles
  WHERE id = user_id;

  -- Get limits for user's tier
  SELECT * INTO limits FROM get_usage_limits(user_tier);

  -- Get the specific limit for this feature
  limit_value := CASE feature_type
    WHEN 'assessments' THEN limits.assessments_limit
    WHEN 'chat' THEN limits.chat_limit
    WHEN 'plans' THEN limits.plans_limit
    WHEN 'resumes' THEN limits.resumes_limit
    ELSE 0
  END;

  -- Return true if under limit, false if at or over limit
  RETURN current_usage < limit_value;
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION increment_usage(
  user_id UUID,
  feature_type TEXT
)
RETURNS VOID AS $$
BEGIN
  CASE feature_type
    WHEN 'assessments' THEN
      UPDATE profiles SET usage_assessments_month = usage_assessments_month + 1 WHERE id = user_id;
    WHEN 'chat' THEN
      UPDATE profiles SET usage_chat_month = usage_chat_month + 1 WHERE id = user_id;
    WHEN 'plans' THEN
      UPDATE profiles SET usage_plan_count = usage_plan_count + 1 WHERE id = user_id;
    WHEN 'resumes' THEN
      UPDATE profiles SET usage_resume_count = usage_resume_count + 1 WHERE id = user_id;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to reset monthly usage (should be called via cron on 1st of each month)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET
    usage_assessments_month = 0,
    usage_chat_month = 0,
    usage_plan_count = 0,
    usage_resume_count = 0,
    usage_reset_date = CURRENT_DATE
  WHERE usage_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Comment explaining usage
COMMENT ON FUNCTION check_usage_limit IS 'Check if user can perform action based on their subscription tier limits';
COMMENT ON FUNCTION increment_usage IS 'Increment usage counter for a specific feature';
COMMENT ON FUNCTION reset_monthly_usage IS 'Reset usage counters on the 1st of each month (run via cron)';
