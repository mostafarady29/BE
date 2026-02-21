# 🏛️ MP Citizen Request Management System

A full-stack web application for an MP's office to receive, manage, and track citizen requests and complaints.

## Tech Stack
- **Backend**: Node.js + Express + PostgreSQL + AWS S3
- **Frontend**: Vanilla HTML / CSS / JavaScript

---

## Project Structure

```
mp-system/
├── backend/
│   ├── config/          db.js · s3.js
│   ├── controllers/     auth · users · citizens · posts · attachments
│   ├── database/        schema.sql · seed.sql
│   ├── middleware/       auth · role · errorHandler
│   ├── routes/          auth · users · citizens · statuses · posts · attachments · dashboard
│   ├── .env.example
│   ├── server.js
│   └── package.json
└── frontend/
    ├── assets/css/      main.css
    ├── assets/js/       api.js · auth.js
    ├── index.html       →  Citizen: Submit Request
    ├── track.html       →  Citizen: Track Request
    ├── login.html       →  Staff Login
    ├── dashboard.html   →  Admin Dashboard + Charts
    ├── posts.html       →  Posts List (filtered/paginated)
    ├── post-detail.html →  Post Detail + Actions
    └── users.html       →  Staff Management (admin only)
```

---

## Setup

### 1. Database
```bash
# Create the database
createdb mp_system

# Run schema & seed
psql mp_system -f backend/database/schema.sql
psql mp_system -f backend/database/seed.sql
```

### 2. Environment Variables
```bash
cp backend/.env.example backend/.env
# Fill in your values: DATABASE_URL, JWT_SECRET, AWS credentials, S3_BUCKET_NAME
```

### 3. Start the Backend
```bash
cd backend
npm run dev
# API runs at http://localhost:5000
```

### 4. Open the Frontend
```bash
# Option A: open directly in browser
open frontend/index.html

# Option B: serve with a local server (avoids CORS issues)
npx serve frontend
```

---

## Default Admin Account
| Field    | Value        |
|----------|-------------|
| Username | `admin`     |
| Password | `Admin@1234`|

> ⚠️ **Change this password immediately after first login!**

---

## API Base URL
All endpoints are prefixed with `/api`:

| Endpoint | Access |
|----------|--------|
| `POST /api/auth/login` | Public |
| `POST /api/posts` | Public (citizen submit) |
| `GET /api/posts` | Staff |
| `PATCH /api/posts/:id/status` | Staff |
| `PATCH /api/posts/:id/assign` | Admin |
| `GET /api/dashboard/stats` | Staff |
| `GET /api/users` | Admin |

---

## File Upload Flow (AWS S3 Presigned URLs)
1. Client calls `POST /api/posts/:id/attachments/presign` with `{ content_type }`
2. Server returns a **presigned PUT URL** valid for 5 minutes
3. Client uploads file **directly to S3** via HTTP PUT
4. File URL is already registered in the DB — no server bandwidth used
