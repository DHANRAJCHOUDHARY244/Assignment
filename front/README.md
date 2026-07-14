# Frontend

Next.js App Router UI for the Socially Approved carousel, auth, and admin panel.

## Run

```bash
pnpm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:5050
pnpm dev                     # http://localhost:3000
pnpm test
```

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend base URL (no trailing slash) |

## Features

- **Home** — outer carousel + inner modal player (lazy video, swipe, keyboard)
- **Auth** — `/login`, `/signup`, session refresh via httpOnly cookie
- **Admin** — `/admin` video list, create, edit, deactivate (admin role only)

## Carousel behaviour

- Fetches videos from `GET /api/videos` (never hard-coded URLs)
- Loads video `src` only for slides near the viewport (1 behind, 2 ahead)
- Unloads `src` when slides leave the active window
- Respects `prefers-reduced-motion` for scroll and animations

## Tests

```bash
pnpm test
```

Smoke tests cover carousel window math and local liked-video storage.
