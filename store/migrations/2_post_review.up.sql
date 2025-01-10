DROP TABLE IF EXISTS post_scanning;
CREATE TABLE post_reviewed
(
    id              BIGSERIAL PRIMARY KEY,
    user_did        TEXT NOT NULL,
    content         TEXT NOT NULL,
    topic           TEXT NOT NULL,
    date            TEXT NOT NULL,
    validation      FLOAT,
    summary         TEXT NOT NULL,
    detailed_review TEXT NOT NULL,
    referencesJSON  TEXT
);
