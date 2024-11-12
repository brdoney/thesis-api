CREATE TABLE clicks (
    link TEXT NOT NULL,
    post_id INTEGER,  -- Will be null if the post is anonymous
    user_id INTEGER,

    FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY, -- Explicit alias for rowid

    -- Don't access the following together with ID b/c of IRB
    pid TEXT NOT NULL UNIQUE,
    discord_id TEXT NOT NULL UNIQUE,

    -- Don't access together with pid or discord_id b/c of IRB
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

    FOREIGN KEY (author) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE llm_reviews (
    post_id INTEGER,  -- foreign key to post
    author INTEGER,  -- foreign key to author

    relevance INTEGER,
    helpfulness INTEGER,
    correctness INTEGER,

    FOREIGN KEY (post_id) REFERENCES posts (id),
    FOREIGN KEY (author) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE (post_id, author)
);

CREATE TABLE retrieval_reviews (
    post_id INTEGER,  -- foreign key to post
    author INTEGER,  -- foreign key to author

    relevance INTEGER,
    helpfulness INTEGER,

    FOREIGN KEY (post_id) REFERENCES posts (id),
    FOREIGN KEY (author) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE (post_id, author)
);

-- Only exists b/c we don't want to store any data for users who haven't stored
-- consent b/c of IRB
CREATE TABLE grading (
    pid TEXT NOT NULL UNIQUE,
    llm_reviews INTEGER DEFAULT 0,
    retrieval_reviews INTEGER DEFAULT 0
)
