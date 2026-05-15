
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS bio                  VARCHAR(300),
    ADD COLUMN IF NOT EXISTS location             VARCHAR(100),
    ADD COLUMN IF NOT EXISTS github_url           VARCHAR(255),
    ADD COLUMN IF NOT EXISTS linkedin_url         VARCHAR(255),
    ADD COLUMN IF NOT EXISTS leetcode_url         VARCHAR(255),
    ADD COLUMN IF NOT EXISTS hackerrank_url       VARCHAR(255),
    ADD COLUMN IF NOT EXISTS codeforces_url       VARCHAR(255),
    ADD COLUMN IF NOT EXISTS website_url          VARCHAR(255),
    ADD COLUMN IF NOT EXISTS default_difficulty   VARCHAR(10)  NOT NULL DEFAULT 'MEDIUM',
    ADD COLUMN IF NOT EXISTS preferred_language   VARCHAR(50)  NOT NULL DEFAULT 'python',
    ADD COLUMN IF NOT EXISTS email_notifications  BOOLEAN      NOT NULL DEFAULT true;