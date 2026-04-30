
CREATE TABLE interview_rooms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id         UUID NOT NULL REFERENCES users(id),
    room_code       VARCHAR(10) NOT NULL UNIQUE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    participants    TEXT[] DEFAULT '{}',
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rooms_code   ON interview_rooms(room_code);
CREATE INDEX idx_rooms_active ON interview_rooms(active);