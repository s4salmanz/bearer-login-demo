CREATE DATABASE bearer_login_db;

\c bearer_login_db;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Example seed user (password: admin123)
-- Use a bcrypt hash generated with Node.js before running this insert.
-- INSERT INTO users (username, password_hash, full_name, email)
-- VALUES ('admin', '$2b$10$YOUR_BCRYPT_HASH_HERE', 'System Admin', 'admin@example.com');
