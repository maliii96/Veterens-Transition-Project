-- Fix 1: Auto-create profile when a new user signs up
-- The signup code expects a trigger but none existed, causing new users
-- to have no profile row and immediately hit "usage limit reached"

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    email,
    branch,
    mos,
    separation_date,
    subscription_tier,
    usage_assessments_month,
    usage_chat_month,
    usage_plan_count,
    usage_resume_month,
    usage_job_parse_month,
    usage_diagnostic_month,
    usage_role_clarity_month,
    usage_strategy_month,
    usage_reset_date
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'branch',
    NEW.raw_user_meta_data->>'mos',
    CASE
      WHEN NEW.raw_user_meta_data->>'separation_date' IS NOT NULL
        AND NEW.raw_user_meta_data->>'separation_date' != ''
      THEN (NEW.raw_user_meta_data->>'separation_date')::DATE
      ELSE NULL
    END,
    'free',
    0, 0, 0, 0, 0, 0, 0, 0,
    CURRENT_DATE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists (safe re-run)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- Fix 2: Set any existing NULL usage values to 0
-- NULL values cause PostgreSQL comparisons to fail silently
UPDATE profiles SET
  usage_assessments_month = COALESCE(usage_assessments_month, 0),
  usage_chat_month = COALESCE(usage_chat_month, 0),
  usage_plan_count = COALESCE(usage_plan_count, 0),
  usage_resume_month = COALESCE(usage_resume_month, 0),
  usage_job_parse_month = COALESCE(usage_job_parse_month, 0),
  usage_diagnostic_month = COALESCE(usage_diagnostic_month, 0),
  usage_role_clarity_month = COALESCE(usage_role_clarity_month, 0),
  usage_strategy_month = COALESCE(usage_strategy_month, 0),
  subscription_tier = COALESCE(subscription_tier, 'free'),
  usage_reset_date = COALESCE(usage_reset_date, CURRENT_DATE)
WHERE
  usage_assessments_month IS NULL
  OR usage_chat_month IS NULL
  OR usage_plan_count IS NULL
  OR usage_resume_month IS NULL
  OR usage_job_parse_month IS NULL
  OR usage_diagnostic_month IS NULL
  OR usage_role_clarity_month IS NULL
  OR usage_strategy_month IS NULL
  OR subscription_tier IS NULL
  OR usage_reset_date IS NULL;
