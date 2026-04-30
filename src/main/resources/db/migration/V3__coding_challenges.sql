-- V3__coding_challenges.sql
CREATE TABLE coding_challenges (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID REFERENCES interview_sessions(id),
    title           VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    examples        JSONB DEFAULT '[]',
    constraints     TEXT[],
    starter_code    JSONB DEFAULT '{}',  -- {"javascript": "...", "python": "...", "java": "..."}
    test_cases      JSONB DEFAULT '[]',  -- hidden test cases
    time_limit_sec  INT DEFAULT 1800,    -- 30 min
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE code_submissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id    UUID REFERENCES coding_challenges(id),
    user_id         UUID REFERENCES users(id),
    language        VARCHAR(50) NOT NULL,
    source_code     TEXT NOT NULL,
    status          VARCHAR(50),         -- Accepted, Wrong Answer, TLE, etc.
    runtime_ms      INT,
    memory_kb       INT,
    test_results    JSONB DEFAULT '[]',
    ai_feedback     TEXT,
    submitted_at    TIMESTAMP DEFAULT NOW()
);