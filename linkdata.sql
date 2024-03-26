CREATE TABLE clicks (
    link TEXT NOT NULL,
    post_id INTEGER,
    user_id INTEGER
);

CREATE TABLE consent (
    pid TEXT NOT NULL UNIQUE,
    discord_id TEXT NOT NULL UNIQUE,
    consent BOOLEAN
);
