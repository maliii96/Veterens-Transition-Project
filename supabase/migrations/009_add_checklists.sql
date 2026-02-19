-- Checklist state stored as JSONB — keys are item IDs, values are booleans
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS document_checklist JSONB DEFAULT '{}'::jsonb;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS benefits_checklist JSONB DEFAULT '{}'::jsonb;
