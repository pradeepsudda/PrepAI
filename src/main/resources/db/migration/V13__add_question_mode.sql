
ALTER TABLE interview_questions
    ADD COLUMN IF NOT EXISTS question_mode     VARCHAR(10) NOT NULL DEFAULT 'VOICE',
    ADD COLUMN IF NOT EXISTS suggested_language VARCHAR(50);

