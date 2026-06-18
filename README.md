# CurbCall

A smart curb access management platform for professional drivers in Paris, France.

## Project Structure

- `backend/` - Express REST API with JWT auth and in-memory data store
- `frontend/` - React + Leaflet mobile-first web interface (Driver + Admin routes)
- `database/schema.sql` - PostgreSQL schema for users, zones, and sessions

## API Endpoints

- `POST /auth/register`
- `GET /zones`
- `POST /sessions/start`
- `POST /sessions/end`
- `GET /sessions/:userId`
- `GET /admin/zones`
- `POST /admin/zones`
- `GET /admin/analytics`

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend calls `/api` by default.
In local Vite development, `/api` is proxied to `http://localhost:4000`.
Set `VITE_API_BASE_URL` to override.

### Netlify (all-in-one deployment)

```bash
npx netlify dev
```

- React app is built from `frontend/` and published from `frontend/dist`
- Express API is served as Netlify Function from `backend/functions/api.js`
- `/api/*` rewrites to `/.netlify/functions/api/:splat`
