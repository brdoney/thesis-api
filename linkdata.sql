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
    llm_type TEXT NOT NULL,

    -- Time to query vector database
    retrieval_time INTEGER DEFAULT 0,
    -- Time from sending LLM API request to receiving the last token
    generation_time INTEGER DEFAULT 0,

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
