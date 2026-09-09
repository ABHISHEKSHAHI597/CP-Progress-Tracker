# CP Progress Tracker

Tracks a group of Codeforces handles: ratings, solved problems, contest history,
and a 30-day form leaderboard. React and Vite on the front, Express and MongoDB
on the back.

**Live:** https://cp-progress-tracker-red.vercel.app

---

## Run it

```bash
git clone <repository-url>
cd cp-progress-tracker

cp backend/.env.example backend/.env   # then fill it in — see below
./script.sh                            # installs, starts both, opens the browser
```

`./script.sh` starts the API on port 5000 and the web app on port 3000, waits
for both to answer, and opens http://localhost:3000. Ctrl-C stops both.

| Command | What runs |
| --- | --- |
| `./script.sh` | Development. Hot reload on both sides. Web on `:3000` |
| `./script.sh prod` | Production. Built frontend served by Vite preview on `:4173`, API with `NODE_ENV=production` |

Set `NO_OPEN=1` to skip opening the browser.

Requires Node.js 20.19 or newer (Vite 8's floor) and a MongoDB connection string.

---

## Environment files

Four files, all local, none committed. Copy each `.env.example` next to it.

### `backend/.env` — secrets, shared by every mode

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/cpProgressTracker
JWT_SECRET=<a long random string>
ADMIN_USERNAME=<admin login name>
ADMIN_PASSWORD=<admin login password>
```

`MONGODB_URI` comes from MongoDB Atlas under Connect → Drivers. Generate
`JWT_SECRET` with `openssl rand -hex 32`. The admin pair is read only by
`npm run seed`, which creates or resets that account.

### `backend/.env.development` — loaded by `npm run dev`

```env
PORT=5000
FRONTEND_URL=http://localhost:3000,http://localhost:4173
```

### `backend/.env.production` — loaded by `npm run start:prod`

```env
PORT=5000
FRONTEND_URL=https://your-site.vercel.app
```

`FRONTEND_URL` is the CORS allowlist and accepts a comma-separated list, so one
file can cover the dev server and the deployed site at once.

### `frontend/.env.development` and `frontend/.env.production`

```env
VITE_API_URL=http://localhost:5000/api
```

Vite picks the file by mode: `npm run dev` reads the first, `npm run build`
reads the second. Point the production one at your deployed API. Values are
baked into the bundle at build time, so never put a secret in a `VITE_` variable.

Anything already exported in the shell, or set in a hosting dashboard, beats
every file. On Vercel and Railway, set the variables there and skip the files.

---

## Create the admin account

```bash
cd backend
npm run seed
```

Reads `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `backend/.env`. Running it
again resets the password for that account.

---

## Running the parts by hand

```bash
cd backend  && npm install && npm run dev        # API  → :5000
cd frontend && npm install && npm run dev        # web  → :3000
```

Production:

```bash
cd backend  && npm run start:prod
cd frontend && npm run build && npm run preview  # web → :4173
```

---

## Layout

```text
backend/
  server.js              entry point
  src/config/env.js      env loading and validation
  src/routes/            users, admin, contests, calendar
  src/services/          Codeforces, LeetCode, CodeChef, AtCoder clients
  src/cron/              scheduled refresh of tracked users
frontend/
  src/lib/rank.js        the Codeforces tier scale the UI is built on
  src/components/        nav, ladder, roster rows, figures
  src/pages/             Overview, Standings, Progress, Calendar, Admin
script.sh                starts everything
```

## How the data refreshes

Three jobs at three cadences, because the data moves at three speeds.

| Job | Every | Cost |
| --- | --- | --- |
| Profiles | 5 min | one request for the whole roster |
| Submissions | 30 min | one small page per handle, only what is new |
| Repair | hourly | a full rebuild of the two stalest handles |

Contest history is not on a timer. It is fetched only for handles whose rating
moved, which the profile job reports.

Every call goes through one queue that holds to the Codeforces limit of a
request every two seconds, and retries on 403 rather than dropping the handle.

Anyone can also refresh a single handle from the site, which is one request for
that person rather than a faster timer for everyone. It is capped by a one
minute per-handle cooldown and a per-address limit, and it joins a sync already
in progress instead of starting a second one.

Submissions sync against a stored watermark, so a handle with nothing new costs
one small request and no database write. The repair pass exists because a
watermark cannot notice a rejudge; rebuilding the oldest handles keeps the
incremental state honest. A handle with no watermark is rebuilt from scratch,
which is also how an existing database migrates itself after this is deployed.

## API

```http
GET    /health
GET    /api/users
POST   /api/users            admin token required
POST   /api/users/:id/refresh   rate limited, no token
DELETE /api/users/:id        admin token required
POST   /api/admin/login
GET    /api/calendar
GET    /api/contests/leaderboard
```

## Deployment

Frontend on Vercel, backend on Railway. Set the environment variables in each
dashboard rather than shipping the files, and add the deployed site's origin to
`FRONTEND_URL` so CORS lets it through.

## Licence

MIT. Built by Abhishek Shahi.
