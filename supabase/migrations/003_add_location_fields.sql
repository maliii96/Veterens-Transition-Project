-- Add city and state fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_state TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_state TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_annual_income NUMERIC;
