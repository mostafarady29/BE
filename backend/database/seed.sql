-- ============================================================
--  Seed Data
-- ============================================================

-- Statuses
INSERT INTO statuses (name) VALUES
    ('Pending'),
    ('In Progress'),
    ('Resolved'),
    ('Rejected')
ON CONFLICT (name) DO NOTHING;

-- Default Admin User
-- Password: Admin@1234  (bcrypt hash generated with cost=10)
INSERT INTO users (username, password, phone, role) VALUES (
    'admin',
    '$2a$10$aZ.CSwvIubql.juqGKP1OObgG85QijFsP.Z8nSw6bpYjA4hn2cg12',
    '01000000000',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- NOTE: Change the admin password immediately after first login!
-- The hash above corresponds to: Admin@1234
