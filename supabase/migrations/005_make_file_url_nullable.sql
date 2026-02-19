-- Make file_url nullable since we store resume text directly, not files
ALTER TABLE resumes
ALTER COLUMN file_url DROP NOT NULL;
