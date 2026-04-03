# Finance Dashboard

This repository is a full-stack finance data processing and access control system. The Express and SQLite backend enforces JWT cookie authentication, Zod validation, role-based API guards, and Swagger documentation. The React (Vite) dashboard consumes those APIs with plain CSS, Recharts analytics for elevated roles, and inline admin workflows for users and transactions.

---

## Tech Stack (exact versions)

| Layer | Package | Version |
| --- | --- | --- |
| Runtime | Node.js | 18+ recommended (LTS) |
| Backend framework | express | 4.21.2 |
| Database driver | better-sqlite3 | 11.7.0 |
| Auth | jsonwebtoken | 9.0.2 |
| Password hashing | bcrypt | 5.1.1 |
| Cookies / CORS | cookie-parser, cors | 1.4.7, 2.8.5 |
| Env loading | dotenv | 16.4.7 |
| Validation | zod | 3.24.1 |
| Rate limiting | express-rate-limit | 7.5.0 |
| API docs | swagger-jsdoc, swagger-ui-express | 6.2.8, 5.0.1 |
| Testing | jest, supertest | 29.7.0, 7.0.0 |
| Frontend UI | react, react-dom | 18.3.1 |
| Routing | react-router-dom | 7.1.1 |
| HTTP client | axios | 1.7.9 |
| Charts | recharts | 2.15.0 |
| Build | vite, @vitejs/plugin-react | 6.0.6, 4.3.4 |

---

## Setup Instructions

1. **Clone or copy** this repository to your machine.

2. **Install dependencies**

   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**

   - Copy `backend/.env.example` to `backend/.env` and fill in values (see section below).
   - Optional: copy `frontend/.env.example` to `frontend/.env` if you need a non-default API base URL.

4. **Seed the database** (creates demo users, baseline rows if none exist, and fills up to `SEED_TARGET_FINANCIAL_RECORD_COUNT` financial records — see `backend/src/constants/index.js`, default 220)

   ```bash
   cd backend
   npm run seed
   ```

   Safe to run again: it tops up missing rows until the target count is reached (it does not wipe existing data).

   Default demo accounts (password from seed script): `admin@example.com`, `analyst@example.com`, `viewer@example.com` — use the password defined as `SEED_DEMO_PLAINTEXT_PASSWORD` in `backend/src/constants/index.js` (default `Password123!`).

5. **Run the development servers**

   - Terminal 1 — API:

     ```bash
     cd backend
     npm run dev
     ```

   - Terminal 2 — UI (proxies `/api` to `http://localhost:3000` by default):

     ```bash
     cd frontend
     npm run dev
     ```

   Open the URL printed by Vite (typically `http://localhost:5173`). Ensure `CLIENT_ORIGIN` in the backend `.env` matches the Vite origin when using cookies.

---

## Environment Variables

**Backend** — see `backend/.env.example`:

| Variable | Required | Description |
| --- | --- | --- |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `PORT` | No | API port (default `3000`) |
| `NODE_ENV` | No | `development` or `production` |
| `DATABASE_PATH` | No | SQLite file path (default `./finance.db`) |
| `CLIENT_ORIGIN` | No | Allowed CORS origin for the SPA (default `http://localhost:5173`) |

**Frontend** — see `frontend/.env.example`:

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | No | API origin; leave empty to use same-origin `/api` (Vite proxy in dev) |

---

## API Reference

| Method | Route | Auth Required | Allowed Roles | Description |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | No | — | Register user (defaults to `viewer`) |
| POST | `/api/auth/login` | No | — | Login; sets httpOnly JWT cookie |
| POST | `/api/auth/logout` | No | — | Clears auth cookie |
| GET | `/api/auth/me` | Yes | viewer, analyst, admin | Current user profile |
| GET | `/api/records` | Yes | viewer, analyst, admin | Paginated, filterable financial records (excludes soft-deleted) |
| GET | `/api/records/:id` | Yes | viewer, analyst, admin | Single record |
| POST | `/api/records` | Yes | admin | Create record |
| PATCH | `/api/records/:id` | Yes | admin | Update record |
| DELETE | `/api/records/:id` | Yes | admin | Soft-delete record |
| GET | `/api/dashboard/summary` | Yes | analyst, admin | Totals and recent activity |
| GET | `/api/dashboard/categories` | Yes | analyst, admin | Category totals by type |
| GET | `/api/dashboard/trends` | Yes | analyst, admin | Weekly or monthly income vs expenses trend |
| GET | `/api/users` | Yes | admin | Paginated users |
| GET | `/api/users/:id` | Yes | admin | Single user |
| POST | `/api/users` | Yes | admin | Create user with role |
| PATCH | `/api/users/:id` | Yes | admin | Update name, role, or status |
| DELETE | `/api/users/:id` | Yes | admin | Set user status to `inactive` |
| GET | `/api/docs` | No | — | Swagger UI |

---

## Assumptions During Development

- Dates for records are stored and compared as ISO `YYYY-MM-DD` strings in SQLite.
- The JWT is stored only in an httpOnly cookie named `access_token` (see `COOKIE_NAME` in backend constants).
- Viewers cannot call dashboard summary endpoints per integration tests; the dashboard computes viewer totals by aggregating all pages of `GET /api/records` on the client.
- Login and registration errors return generic shapes; validation errors use the `{ success: false, errors: [{ field, message }] }` contract.
- Seed script is idempotent for users with fixed emails and skips inserting sample records if any active data already exists.

---

## Known Tradeoffs and Limitations

- **Viewer dashboard cost**: aggregating all records on the client for viewers can mean multiple list requests for very large datasets.
- **SQLite**: single-file database suitable for development and small deployments; not horizontally scaled.
- **Rate limits**: in-memory rate limiting resets when the server process restarts.
- **Category filter options**: the transactions page discovers categories by scanning list endpoints, not a dedicated taxonomy API.
- **Supertest / dependency advisories**: pinned versions may report npm audit warnings; upgrades should retain compatibility with the assignment stack.

---

## How to Run Tests

From the backend package:

```bash
cd backend
npm test
```

Jest runs integration tests against a temporary SQLite file (`jest-finance.db` in the backend folder during the run), with fixtures applied in `beforeAll`. Ensure `JWT_SECRET` is not required to be in `.env` for tests (the test file sets env vars before loading the app).

---

## Project Structure

- `backend/` — Express app (`app.js`, `server.js`, `db.js`, `swagger.js`), layered `src/` (routes, controllers, services, models, middleware, validators, utils, tests).
- `frontend/` — Vite React app under `src/` (pages, components, api, context, hooks).
