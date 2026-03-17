-- ============================================================
--  MP Citizen Request Management System
--  PostgreSQL Schema
-- ============================================================

-- Drop existing tables (for re-runs during development)
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS posts      CASCADE;
DROP TABLE IF EXISTS statuses   CASCADE;
DROP TABLE IF EXISTS people     CASCADE;
DROP TABLE IF EXISTS users      CASCADE;

-- 1. Users (Staff & Admins)
CREATE TABLE users (
    id          SERIAL          PRIMARY KEY,
    username    VARCHAR(100)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    phone       VARCHAR(20),
    national_id VARCHAR(20)     UNIQUE,
    role        VARCHAR(20)     NOT NULL DEFAULT 'moderator'
                                CHECK (role IN ('admin', 'moderator')),
    is_active   BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- 2. People (Citizens)
CREATE TABLE people (
    id          SERIAL          PRIMARY KEY,
    national_id VARCHAR(20)     NOT NULL UNIQUE,
    first_name  VARCHAR(100)    NOT NULL,
    last_name   VARCHAR(100)    NOT NULL,
    phone       VARCHAR(20),
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- 3. Statuses (Lookup)
CREATE TABLE statuses (
    id   SERIAL       PRIMARY KEY,
    name VARCHAR(50)  NOT NULL UNIQUE
);

-- 4. Posts (Requests / Complaints)
CREATE TABLE posts (
    id                  SERIAL          PRIMARY KEY,
    person_id           INT             NOT NULL,
    assigned_to         INT,
    status_id           INT             NOT NULL,
    problem_type        VARCHAR(100)    NOT NULL,
    problem_description TEXT            NOT NULL,
    city                VARCHAR(100)    NOT NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_posts_person
        FOREIGN KEY (person_id)   REFERENCES people(id)   ON DELETE CASCADE,
    CONSTRAINT fk_posts_assigned
        FOREIGN KEY (assigned_to) REFERENCES users(id)    ON DELETE SET NULL,
    CONSTRAINT fk_posts_status
        FOREIGN KEY (status_id)   REFERENCES statuses(id) ON DELETE RESTRICT
);

-- 5. Attachments
CREATE TABLE attachments (
    id          SERIAL          PRIMARY KEY,
    post_id     INT             NOT NULL,
    file_url    VARCHAR(500)    NOT NULL,
    file_key    VARCHAR(500),           -- S3 object key for deletion
    file_type   VARCHAR(50),
    uploaded_at TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_attachments_post
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- ─── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_posts_person_id   ON posts(person_id);
CREATE INDEX idx_posts_status_id   ON posts(status_id);
CREATE INDEX idx_posts_assigned_to ON posts(assigned_to);
CREATE INDEX idx_posts_created_at  ON posts(created_at DESC);
CREATE INDEX idx_posts_city        ON posts(city);
CREATE INDEX idx_attachments_post  ON attachments(post_id);
CREATE INDEX idx_people_national   ON people(national_id);

-- 6. News Articles
DROP TABLE IF EXISTS news CASCADE;
CREATE TABLE news (
    id           SERIAL          PRIMARY KEY,
    title        VARCHAR(255)    NOT NULL,
    content      TEXT            NOT NULL,
    tag          VARCHAR(100),
    image_url    VARCHAR(500),
    is_published BOOLEAN         NOT NULL DEFAULT FALSE,
    is_featured  BOOLEAN         NOT NULL DEFAULT FALSE,
    created_by   INT             REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_news_is_published ON news(is_published);
CREATE INDEX idx_news_created_at   ON news(created_at DESC);

-- 7. Old Requests (Archive — manually entered by staff)
DROP TABLE IF EXISTS old_request_attachments CASCADE;
DROP TABLE IF EXISTS old_requests CASCADE;
CREATE TABLE old_requests (
    id             SERIAL          PRIMARY KEY,
    citizen_name   VARCHAR(200)    NOT NULL,
    national_id    VARCHAR(20)     NOT NULL,
    phone          VARCHAR(20),
    problem_type   VARCHAR(100)    NOT NULL,
    ministry       VARCHAR(200),
    city           VARCHAR(100)    NOT NULL,
    notes          TEXT,
    status_id      INT             REFERENCES statuses(id) ON DELETE SET NULL,
    request_date   DATE,
    created_by     INT             REFERENCES users(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE old_request_attachments (
    id          SERIAL          PRIMARY KEY,
    request_id  INT             NOT NULL
                                REFERENCES old_requests(id) ON DELETE CASCADE,
    file_url    VARCHAR(500)    NOT NULL,
    file_key    VARCHAR(500),
    file_type   VARCHAR(50),
    uploaded_at TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_old_requests_national_id ON old_requests(national_id);
CREATE INDEX idx_old_requests_status_id   ON old_requests(status_id);
CREATE INDEX idx_old_requests_created_at  ON old_requests(created_at DESC);
CREATE INDEX idx_old_req_att_req_id       ON old_request_attachments(request_id);
