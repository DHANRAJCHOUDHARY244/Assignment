# Socially Approved — Full Stack Assignment

Video carousel app (inspired by driptrip.in “Socially Approved”) with auth, social actions (like / share / comment), and an admin panel for users + chunked video uploads (up to 2 GB).

---

## Admin login (exposed)

Use the same login page as everyone else (`/login`). Admins are redirected to `/admin`.

| | |
|--|--|
| **URL** | http://localhost:3000/login |
| **Email** | `admin@admin.com` |
| **Password** | `Admin$#12345` |
| **Dashboard** | http://localhost:3000/admin |

Credentials come from backend env (`ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_FULL_NAME` in `.env.dev`). Defaults live in `backend/src/constants/admin.ts`. The login page also shows these values and has a **Fill admin credentials** button.

Admin is created automatically on server start / `pnpm run seed` **only when no admin exists**.

### After login, admin can

- Manage videos (`/admin` → Videos): create, edit, soft-delete, upload (direct ≤50 MB or chunked ≤2 GB)
- Manage users (`/admin` → Users): view stats, block / unblock (admins cannot be blocked)
- Call admin APIs with Bearer access token (`role: admin`)

---

## Tech stack

| Layer | Stack |
|--------|--------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Jest + jsdom |
| **Backend** | Express 5, TypeScript, Mongoose 9, Joi, JWT + httpOnly refresh cookies, bcryptjs, Winston, Helmet, CORS |
| **Database** | MongoDB 8 |
| **Uploads** | Multer (small files), raw `application/octet-stream` chunks (large), FFmpeg thumbnail |
| **Rate limit** | `express-rate-limit` — **login & signup only** |
| **Env** | `@dotenvx/dotenvx` + `envalid` (backend) |
| **Package manager** | pnpm |
| **Containers** | Docker + Compose (root) |

---

## Folder structure

```
ass/
├── docker-compose.yml          # mongo + backend + frontend
├── README.md                   # this file
│
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.dev / .env.prod
│   ├── package.json
│   ├── jest.config.ts
│   ├── src/
│   │   ├── app.ts              # Express app + bootstrap
│   │   ├── server.ts           # process entry
│   │   ├── config/             # env (envalid), database
│   │   ├── constants/          # admin, rateLimit, upload, routes, roles
│   │   ├── controllers/        # thin HTTP handlers
│   │   ├── services/           # business logic
│   │   ├── models/             # Mongoose (User, Video, Like, Share, Comment, RefreshToken)
│   │   ├── routes/             # auth, videos, admin/*
│   │   ├── middleware/         # auth, validate, authRateLimit
│   │   ├── validators/         # Joi schemas
│   │   ├── helpers/            # logger, bootstrapAdmin
│   │   ├── scripts/seed.ts     # videos + default admin
│   │   ├── data/videos.dummy.json
│   │   └── utils/
│   ├── tests/                  # unit tests only (no Mongo)
│   └── uploads/                # videos, thumbs, chunks (runtime)
│
└── front/
    ├── Dockerfile
    ├── .dockerignore
    ├── .env / .env.example
    ├── package.json
    ├── jest.config.ts
    ├── next.config.ts
    ├── src/
    │   ├── app/                # pages: /, /login, /signup, /admin
    │   ├── components/
    │   │   ├── carousel/       # outer strip + inner modal player
    │   │   ├── admin/          # videos + users panels
    │   │   ├── form/           # auth forms
    │   │   ├── layout/         # SiteHeader
    │   │   └── ui/
    │   ├── hooks/
    │   ├── lib/                # apiClient, auth, session, upload, media
    │   ├── constants/
    │   └── types/
    └── tests/                  # pure unit tests (carousel helpers, etc.)
```

---

## Run with Docker (full stack)

Everything runs from the **repo root** via `docker-compose.yml`: MongoDB + backend + frontend.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose v2)
- Free ports: **3000** (frontend), **5050** (backend)

### 1. Start all services

```bash
# from repo root: c:\Users\dhanr\Desktop\ass  (or your clone path)
cd ass

# build images and start (foreground — see logs)
docker compose up --build

# or run in background
docker compose up --build -d
```

First build can take a few minutes (pnpm install + Next/Express build).

### 2. Open the app

| What | URL |
|------|-----|
| Frontend | http://localhost:3000 |
| Login | http://localhost:3000/login |
| Admin dashboard | http://localhost:3000/admin |
| Backend health | http://localhost:5050/api/health |
| Backend API | http://localhost:5050/api/... |

### 3. Admin login (Docker)

| | |
|--|--|
| Email | `admin@admin.com` |
| Password | `Admin$#12345` |

Admin is created when the **backend container starts** if no admin exists yet (same bootstrap as local).

### 4. Useful Compose commands

```bash
# status
docker compose ps

# follow logs (all / one service)
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongo

# stop (keep volumes / data)
docker compose stop

# stop and remove containers (volumes kept)
docker compose down

# wipe DB + uploads too (destructive)
docker compose down -v

# rebuild one service after code change
docker compose up --build -d backend
docker compose up --build -d frontend
```

### 5. What Compose starts

| Service | Image / build | Host port | Role |
|---------|---------------|-----------|------|
| `mongo` | `mongo:8` | (internal only) | Database `ass` |
| `backend` | `./backend/Dockerfile` | `5050 → 5050` | Express API + `/uploads` |
| `frontend` | `./front/Dockerfile` | `3000 → 3000` | Next.js standalone |

**Volumes**
- `mongo-data` — MongoDB persistence  
- `backend-uploads` — uploaded videos / thumbs / chunks  

**Network:** `appnet` (bridge). Backend reaches Mongo as `mongodb://mongo:27017/ass`.

### 6. Dockerfiles (where they live)

```
ass/
├── docker-compose.yml          # orchestration (repo root)
├── backend/Dockerfile          # multi-stage: pnpm → tsc → node dist/server.js
└── front/Dockerfile            # multi-stage: pnpm → next build → standalone server.js
```

- Backend healthcheck: `GET http://127.0.0.1:5050/api/health`  
- Frontend healthcheck: `GET http://127.0.0.1:3000`  
- Frontend bake-time API URL: build-arg `NEXT_PUBLIC_API_URL=http://localhost:5050` (browser calls host port 5050)

### 7. Env inside Docker

Set in `docker-compose.yml` under `backend.environment` (not `.env.dev`). Important keys:

| Variable | Docker value (default) |
|----------|-------------------------|
| `DATABASE_URL` | `mongodb://mongo:27017/ass` |
| `CORS_ORIGINS` | `http://localhost:3000` |
| `PORT` | `5050` |
| `ADMIN_EMAIL` | `admin@admin.com` |
| `ADMIN_PASSWORD` | `Admin$#12345` |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | placeholders — **change for real prod** |

Frontend:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5050` (build arg + runtime) |

To change admin or secrets, edit `docker-compose.yml` and rebuild/restart:

```bash
docker compose up --build -d
```

### 8. Seed dummy videos in Docker (optional)

Compose does **not** auto-seed the sample video list. Admin is created on backend boot. To load dummy videos:

**Option A — Admin UI**  
Log in → http://localhost:3000/admin → add / upload videos.

**Option B — Seed from host**  
Expose Mongo in `docker-compose.yml`:

```yaml
  mongo:
    ports:
      - "27017:27017"
```

Then:

```bash
docker compose up --build -d
cd backend
# temporarily use Docker DB name
DATABASE_URL=mongodb://localhost:27017/ass pnpm run seed
```

**Option C — Exec seed inside container** (if `src` / seed script is in the image; production image only has `dist`):

Prefer Options A or B. For force re-seed of videos only, use host Option B with `pnpm run seed:force`.

### 9. Troubleshooting

| Issue | Fix |
|-------|-----|
| Port already in use | Stop local `pnpm run dev` / free 3000 & 5050 |
| Frontend can’t reach API | Ensure backend healthy: `curl http://localhost:5050/api/health` |
| Admin login fails | Check logs: `docker compose logs backend` — confirm bootstrap message; wipe volume if needed: `docker compose down -v && docker compose up --build` |
| Stale frontend API URL | Rebuild frontend: `docker compose up --build -d frontend` |
| Build fails on lockfile | Keep `pnpm-lock.yaml` committed; Docker uses `pnpm install --frozen-lockfile` |

### 10. Stop everything

```bash
docker compose down          # keep data
docker compose down -v       # also delete mongo + uploads volumes
```

---

## Quick start (local, without Docker)

### Prerequisites
- Node.js ≥ 22  
- pnpm  
- MongoDB running locally (or use Docker Compose below)

### 1. Backend

```bash
cd backend
pnpm install
# Edit .env.dev if needed (DATABASE_URL, JWT, ADMIN_*)
pnpm run seed          # optional: dummy videos + ensure admin
pnpm run dev           # http://localhost:5050
```

Default admin (created **only if no admin exists**):

| Field | Value |
|--------|--------|
| Email | `admin@admin.com` |
| Password | `Admin$#12345` |
| Login | http://localhost:3000/login |
| Dashboard | http://localhost:3000/admin |

Override with `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_FULL_NAME`.

### 2. Frontend

```bash
cd front
pnpm install
cp .env.example .env   # NEXT_PUBLIC_API_URL=http://localhost:5050
pnpm run dev           # http://localhost:3000
```

---

## Environment

### Backend (`backend/.env.dev` / `.env.prod`)

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default `5050`) |
| `NODE_ENV` | `development` / `production` |
| `DATABASE_URL` | MongoDB URI |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `JWT_SECRET` | Access token signing |
| `JWT_REFRESH_SECRET` | Reserved for refresh config / future use |
| `JWT_EXPIRES_IN` | e.g. `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh lifetime config |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_FULL_NAME` | Bootstrap admin if none exists |
| `BCRYPT_ROUNDS` | Password hashing cost |
| `EMAIL_*` | SMTP placeholders (validated at boot) |
| `APP_NAME`, `BASE_URL`, `LOG_LEVEL` | App metadata / logging |

### Frontend (`front/.env`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend base URL (e.g. `http://localhost:5050`) |

---

## Rate limiting

**Only** these routes are rate-limited:

- `POST /api/auth/login`
- `POST /api/auth/signup`

| Setting | Value |
|---------|-------|
| Library | `express-rate-limit` |
| Window | 30 minutes |
| Max | 10 requests per IP |
| Constants | `backend/src/constants/rateLimit.ts` |
| Middleware | `backend/src/middleware/authRateLimit.ts` |

**No** global API limit and **no** limits on videos, likes, shares, comments, admin, or uploads.

---

## Streaming & video upload

Admin-only upload API under `/api/admin/uploads` (Bearer JWT + `role: admin`).

### Limits (`backend/src/constants/upload.ts`)

| Mode | Limit | Transport |
|------|-------|-----------|
| **Direct** | ≤ 50 MB | `multipart/form-data` via Multer (`POST /direct`) |
| **Chunked** | ≤ **2 GB** | Binary patches (`application/octet-stream`) |

Chunk size: **5 MB** per request.

### Chunked flow

1. `POST /api/admin/uploads/init` — create upload session (filename, size, mime)  
2. `PATCH /api/admin/uploads/:uploadId` — append chunk body (`raw` stream) with `Upload-Offset`  
3. `POST /api/admin/uploads/:uploadId/complete` — assemble file, optional FFmpeg thumbnail, create video record  

Frontend helper: `front/src/lib/uploadVideo.ts` (chunked `fetch` + progress).

### Playback / carousel

- Public videos: `GET /api/videos`  
- Static files: `/uploads/...` served by Express  
- Frontend: outer horizontal carousel + fullscreen inner modal; lazy load via IntersectionObserver; hover preview; deep link `?v={videoId}`

---

## Auth model

- Signup / login → access token (memory/sessionStorage) + httpOnly refresh cookie  
- `POST /api/auth/refresh` rotates access token  
- `POST /api/auth/logout` revokes refresh  
- Roles: `user` | `admin`  
- User status: `active` | `blocked` (blocked users cannot login)

---

## Main API routes

| Area | Paths |
|------|--------|
| Health | `GET /api/health` |
| Auth | `/api/auth/signup`, `login`, `refresh`, `logout`, `me` |
| Videos | `/api/videos`, `/:id`, `/:id/like`, `/:id/share`, `/:id/comments` |
| Admin videos | `/api/admin/videos` CRUD |
| Admin uploads | `/api/admin/uploads/*` |
| Admin users | `/api/admin/users`, `/:id`, `/:id/status` |

---

## Testing (Jest)

### Policy
- **Unit tests only** — no MongoDB connection, no `deleteMany`, no shared DB mutation  
- `backend/tests/setup.ts` is a no-op on purpose (does not connect)

### Backend

```bash
cd backend
pnpm test
```

Covers pure helpers (e.g. dayjs) and non-DB AuthService bits (hash / bad JWT).  
Does **not** wipe `DATABASE_URL` data.

### Frontend

```bash
cd front
pnpm test
```

Covers pure helpers (e.g. carousel window math).

---

## Scripts cheat sheet

**Backend**

| Script | Action |
|--------|--------|
| `pnpm run dev` | Dev server + hot reload (`.env.dev`) |
| `pnpm run build` / `start` | Production build / run (`.env.prod`) |
| `pnpm test` | Unit tests + coverage |
| `pnpm run seed` | Seed videos (skip if present) + ensure admin |
| `pnpm run seed:force` | Re-seed videos |
| `pnpm run lint` | ESLint |

**Frontend**

| Script | Action |
|--------|--------|
| `pnpm run dev` | Next.js dev |
| `pnpm run build` / `start` | Production |
| `pnpm test` | Jest |
| `pnpm run lint` | ESLint |

---

## Architecture (short)

```
Browser (Next.js)
    │  REST + Bearer / cookies
    ▼
Express routes → controllers → services → Mongoose → MongoDB
                      │
                      └─ uploads/ (videos + thumbs + chunk metadata)
```

Layering is intentional: routes stay thin; Joi validates I/O; services own business rules; models expose safe DTOs (`toPublicUser`, `toPublicVideo`, …).

---

## Security notes

- Helmet + CORS + trusted proxy  
- Passwords hashed with bcrypt  
- Refresh tokens stored hashed; admin can block users  
- Rate limit only on auth entry points to reduce credential stuffing without throttling media traffic  
- Change default JWT secrets and admin password before real production deploy
