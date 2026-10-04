# Srinidhi Constructions

A production-oriented construction and real-estate website for a Bengaluru team. The frontend is a Vite React application with React Router, Framer Motion, SEO metadata and a responsive editorial UI. The backend is a plain PHP 8 REST API using PDO, MySQL and secure PHP sessions for admin authentication.

## Local setup

### Database

1. Create a MySQL 8 database by importing `database/schema.sql`.
2. Import `database/seed.sql`.
3. Copy `backend/.env.example` to `backend/.env` and set database credentials.
4. For production, set `APP_ORIGIN` to the exact deployed frontend origin and keep `.env` outside source control.

### Backend

```powershell
cd backend
php -S localhost:8000
```

The API entry point is `backend/index.php`. Public endpoints are `/api/services`, `/api/projects`, `/api/projects/{slug}` and `/api/enquiries`. Protected endpoints are `/api/auth/login`, `/api/auth/verify`, `/api/auth/logout`, `/api/dashboard/stats`, CRUD `/api/projects`, CRUD `/api/services`, and `/api/enquiries` list/status/delete. Every protected request revalidates the httpOnly session server-side.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` when the API is not at `http://localhost:8000/api`. The UI includes curated fallback data so public pages remain reviewable before MySQL is configured. Enquiry submission never treats fallback data as success: it requires the API response and surfaces the server/network error.

## Admin panel

The admin panel lives entirely under **`/admin`** on the same frontend origin (e.g. `http://localhost:5173/admin`), with its own layout, sidebar and login screen — it does not share the public site's navbar. `robots.txt` disallows `/admin/` and nothing on the public site links to it. `Admin.jsx` handles login, protected routing, dashboard, projects, services and enquiries as one self-contained app shell.

Email: `admin@srinidhiconstructions.in`  
Password: `password`

Change this seeded password before any deployment. Admin sessions use an httpOnly, SameSite=Strict cookie; production must also set `SESSION_SECURE=true` behind HTTPS.

## Fixing "A database error occurred"

This message means every DB-touching request is failing the same way — almost always because **`backend/.env` was never created**, MySQL isn't running, or `schema.sql`/`seed.sql` were never imported. A ready-to-edit `backend/.env` is already included with local defaults (`root` / empty password) — open it and set `DB_PASSWORD` to your actual MySQL root password if it isn't empty.

To pinpoint the exact cause without guessing, hit the built-in diagnostic endpoint after starting `php -S localhost:8000` from `backend/`:

```
GET http://localhost:8000/api/health
```

It reports, in order: whether `.env` exists, whether the DB connection succeeds, whether each table (`admins`, `services`, `projects`, `project_images`, `enquiries`) exists, and whether an admin row is seeded. Fix whichever check is `false`, then re-test login/enquiry submission. As of this build, the API's error responses also include the real database message during local debugging (visible in the browser network tab and in `error_log`) instead of only a generic 500 — tighten that back to a fully generic client-facing message before any public deployment, and remove or auth-protect `GET /api/health` before going live, since it currently reports setup state without requiring login.

## Delivery notes

- `postman/Srinidhi-Constructions.postman_collection.json` contains public and auth smoke tests.
- `frontend/public/robots.txt` disallows `/admin/`; `sitemap.xml` covers public routes.
- For end-to-end enquiry verification, start MySQL, import the schema/seed, configure `backend/.env`, run PHP on port 8000, submit `/contact`, then query `SELECT * FROM enquiries ORDER BY id DESC LIMIT 1;`.
- Uploaded project media should be stored outside the PHP execution path, checked by MIME and extension, size capped at 5MB and re-encoded before publishing. The public seed uses remote Unsplash images as realistic content references.
- Before launch, add a reverse proxy rate limiter for login/enquiry endpoints, HTTPS, transactional email delivery, backups, real map credentials and a production image CDN.
