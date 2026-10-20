const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env.local') });

const dataDir = path.join(__dirname, '..', 'data');
const usersFile = path.join(dataDir, 'users.json');

function ensureLocalDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
  }
}

function readUsers() {
  ensureLocalDataFile();

  try {
    const content = fs.readFileSync(usersFile, 'utf8');
    const users = JSON.parse(content);
    return Array.isArray(users) ? users : [];
  } catch (error) {
    return [];
  }
}

function writeUsers(users) {
  ensureLocalDataFile();
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

const fallbackPool = {
  async query(sql, params = []) {
    const normalizedSql = String(sql).trim();
    const users = readUsers();

    if (normalizedSql.startsWith('SELECT id FROM users WHERE username = $1 OR email = $2')) {
      const [username, email] = params;
      const rows = users
        .filter((user) => user.username === username || user.email === email)
        .map((user) => ({ id: user.id }));
      return { rows };
    }

    if (normalizedSql.startsWith('INSERT INTO users')) {
      const [username, passwordHash, fullName, email] = params;
      const existing = users.find((user) => user.username === username || user.email === email);

      if (existing) {
        return { rows: [{ id: existing.id, username: existing.username, full_name: existing.full_name, email: existing.email }] };
      }

      const newUser = {
        id: users.length ? Math.max(...users.map((user) => Number(user.id))) + 1 : 1,
        username,
        password_hash: passwordHash,
        full_name: fullName,
        email,
      };

      users.push(newUser);
      writeUsers(users);

      return {
        rows: [{ id: newUser.id, username: newUser.username, full_name: newUser.full_name, email: newUser.email }],
      };
    }

    if (normalizedSql.startsWith('SELECT * FROM users WHERE username = $1')) {
      const [username] = params;
      const matchingUsers = users.filter((user) => user.username === username);
      return { rows: matchingUsers };
    }

    if (normalizedSql.startsWith('SELECT id, username, full_name, email FROM users WHERE id = $1')) {
      const [id] = params;
      const matchingUsers = users
        .filter((user) => Number(user.id) === Number(id))
        .map((user) => ({
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          email: user.email,
        }));
      return { rows: matchingUsers };
    }

    throw new Error(`Unsupported fallback SQL query: ${normalizedSql}`);
  },
};

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL || (
    process.env.DB_HOST || process.env.DB_USER || process.env.DB_PASSWORD || process.env.DB_NAME
      ? `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'bearer_login_db'}`
      : undefined
  ),
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : undefined,
});

module.exports = {
  async query(sql, params = []) {
    try {
      return await pgPool.query(sql, params);
    } catch (error) {
      console.warn('PostgreSQL unavailable, using local JSON fallback store.');
      return fallbackPool.query(sql, params);
    }
  },
};
