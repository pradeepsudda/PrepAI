-- V2__interview_sessions.sql
CREATE TABLE interview_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    session_type    VARCHAR(50) NOT NULL,  -- DSA, SYSTEM_DESIGN, BEHAVIORAL, MIXED
    difficulty      VARCHAR(20) NOT NULL,  -- EASY, MEDIUM, HARD
    topic           VARCHAR(100),
    status          VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, ABANDONED
    total_questions INT NOT NULL DEFAULT 0,
    started_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMP,
    overall_score   DECIMAL(5,2),
    metadata        JSONB DEFAULT '{}'
);

CREATE TABLE interview_questions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    question_text   TEXT NOT NULL,
    question_type   VARCHAR(50) NOT NULL,
    order_index     INT NOT NULL,
    time_limit_sec  INT DEFAULT 300,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE interview_answers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id     UUID NOT NULL REFERENCES interview_questions(id) ON DELETE CASCADE,
    session_id      UUID NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    answer_text     TEXT,
    audio_duration  INT,                   -- seconds of speech
    technical_score DECIMAL(5,2),
    clarity_score   DECIMAL(5,2),
    confidence_score DECIMAL(5,2),
    overall_score   DECIMAL(5,2),
    feedback_text   TEXT,
    strengths       TEXT[],
    improvements    TEXT[],
    answered_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON interview_sessions(user_id);
CREATE INDEX idx_questions_session ON interview_questions(session_id);
CREATE INDEX idx_answers_session ON interview_answers(session_id);