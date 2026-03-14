-- Add usage tracking columns for new AI features
-- Zero Callback Diagnostic, Target Role Clarity, Application Strategy Builder

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS usage_diagnostic_month INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS usage_role_clarity_month INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS usage_strategy_month INTEGER DEFAULT 0;
