CREATE TABLE clicks (
    link TEXT NOT NULL,
    post_id INTEGER,
    user_id INTEGER,

    FOREIGN KEY (post_id) REFERENCES posts (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY, -- Explicit alias for rowid

    pid TEXT NOT NULL UNIQUE,
    discord_id TEXT NOT NULL UNIQUE,

    consent BOOLEAN
);

CREATE TABLE posts (
    id INTEGER PRIMARY KEY, -- Explicit alias for rowid

    post_id TEXT NOT NULL UNIQUE,
    author INTEGER,
    use_llm BOOLEAN,

    FOREIGN KEY (author) REFERENCES users (id)
);

CREATE TABLE llm_reviews (
    post_id INTEGER,  -- foreign key to post
    author INTEGER,  -- foreign key to author

    relevance INTEGER,
    helpfulness INTEGER,
    correctness INTEGER,

    FOREIGN KEY (post_id) REFERENCES posts (id),
    FOREIGN KEY (author) REFERENCES users (id),
    UNIQUE (post_id, author)
);

CREATE TABLE retrieval_reviews (
    post_id INTEGER,  -- foreign key to post
    author INTEGER,  -- foreign key to author

    relevance INTEGER,
    helpfulness INTEGER,

    FOREIGN KEY (post_id) REFERENCES posts (id),
    FOREIGN KEY (author) REFERENCES users (id),
    UNIQUE (post_id, author)
);
