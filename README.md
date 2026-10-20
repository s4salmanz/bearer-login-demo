# Bearer Token Login Demo

This project includes:

- Angular frontend in `frontend/`
- Node.js + Express backend in `backend/`
- PostgreSQL user table for login

## 1. Install Node.js

Use Node.js LTS from https://nodejs.org/

## 2. Install backend dependencies

```bash
cd backend
npm install
```

Dependencies included:
- express
- pg
- bcrypt
- jsonwebtoken
- dotenv
- nodemon

## 3. PostgreSQL setup

Create a database and run:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 4. Environment configuration

Create `.env` from `.env.example` and update your values.

## 5. Run backend

```bash
cd backend
npm run dev
```

## 6. Run frontend

```bash
cd frontend
npm start
```

Then open:

- http://localhost:4200
- API: http://localhost:5000/api
