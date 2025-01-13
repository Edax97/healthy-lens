DROP TABLE IF EXISTS user_scanning;
CREATE TABLE user_reviewed
(
    did          TEXT PRIMARY KEY,
    handle       TEXT NOT NULL,
    name         TEXT NOT NULL,
    avatar       TEXT NOT NULL,
    reliability  FLOAT,
    topic_list   TEXT NOT NULL,
    last_scanned TEXT NOT NULL
);
