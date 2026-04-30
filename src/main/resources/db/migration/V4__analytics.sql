-- V4__analytics.sql
CREATE TABLE user_analytics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    period_date     DATE NOT NULL,
    sessions_count  INT DEFAULT 0,
    avg_score       DECIMAL(5,2),
    total_questions INT DEFAULT 0,
    strong_topics   TEXT[],
    weak_topics     TEXT[],
    UNIQUE(user_id, period_date)
);

CREATE TABLE topic_performance (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    topic           VARCHAR(100) NOT NULL,
    session_type    VARCHAR(50) NOT NULL,
    attempts        INT DEFAULT 0,
    avg_score       DECIMAL(5,2),
    last_attempted  TIMESTAMP,
    UNIQUE(user_id, topic, session_type)
);