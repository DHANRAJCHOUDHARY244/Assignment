# Backend API

Express + MongoDB/Mongoose service for auth, videos, and admin CRUD.

## Run

```bash
pnpm install
pnpm run seed
pnpm run dev    # http://localhost:5050
pnpm test
```

## Environment

Copy `.env.dev` and set `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGINS`.

## Dummy video data

Source file: `src/data/videos.dummy.json` (9 default clips from local uploads).  
Loaded **only** when you run `pnpm run seed` or `pnpm run seed:force` — not on `GET /api/videos`.
Use `seed:force` to replace existing video documents with this default set.

## API

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/health` | — | Health check |
| POST | `/api/auth/signup` | — | Register |
| POST | `/api/auth/login` | — | Login (`rememberMe` optional) |
| POST | `/api/auth/refresh` | Cookie | Rotate access token |
| POST | `/api/auth/logout` | Cookie | Revoke refresh |
| GET | `/api/auth/me` | Bearer | Current user (safe DTO) |
| GET | `/api/videos` | — | List active videos (paginated) |
| GET | `/api/videos/:id` | — | Single video |
| POST | `/api/videos/:id/like` | Optional | Like (user or IP, deduped) |
| POST | `/api/videos/:id/share` | Optional | Track share by platform |
| GET | `/api/videos/:id/comments` | — | List comments |
| POST | `/api/videos/:id/comments` | Bearer | Add comment |
| GET | `/api/admin/videos` | Admin | List all videos |
| POST | `/api/admin/videos` | Admin | Create video |
| PATCH | `/api/admin/videos/:id` | Admin | Update video |
| DELETE | `/api/admin/videos/:id` | Admin | Soft-deactivate video |

Default admin (`admin@admin.com` / `Admin$#12345`) is created automatically on server start or `pnpm run seed` **only when no admin exists** in the database. Override via `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_FULL_NAME` in `.env.dev`.
