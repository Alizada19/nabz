# Nabz — Blood Donation & Emergency Blood Request Platform

Nabz is a **hub** that connects people who need blood, individual donors,
hospitals, blood banks, and blood-donation NGOs. This repository contains the
two applications that power the platform:

| Directory   | Application                              | Stack                                  |
| ----------- | ---------------------------------------- | -------------------------------------- |
| `api/`      | Nabz REST API (backend)                  | NestJS, Prisma, PostgreSQL, JWT        |
| `frontend/` | Nabz web application (frontend)          | Next.js 15, React 19, TypeScript       |

---

## Two Independent Applications — NOT a pnpm Workspace

`api/` and `frontend/` are **completely independent pnpm projects** that happen
to live in one Git repository.

- There is **no `pnpm-workspace.yaml`** and **no pnpm workspace**.
- There is **no root `package.json`** and **no root `pnpm-lock.yaml`**.
- Each application has its own `package.json`, `pnpm-lock.yaml`,
  `node_modules`, environment configuration, and dependency lifecycle.
- The two applications never share installed dependencies or lockfiles.
- Root-level configuration is limited to what Docker and Git need
  (`docker-compose.yml`, `.gitignore`, `AGENTS.md`, this README).

---

## API (Backend)

Everything lives inside `api/`:

```bash
cd api
pnpm install
cp .env.example .env      # configure DATABASE_URL, JWT secrets, etc.
pnpm prisma migrate dev   # apply migrations + seed reference data
pnpm start:dev
```

Useful commands (run from `api/`):

```bash
pnpm prisma generate     # regenerate the Prisma client
pnpm prisma migrate deploy
pnpm build               # production build -> api/dist
pnpm start:prod          # run the compiled build
pnpm test                # unit tests
pnpm test:e2e            # e2e tests (requires a migrated database)
```

The API serves under the `/api` prefix (e.g. `http://localhost:3000/api/v1`),
with Swagger documentation at `http://localhost:3000/api/docs`.

Environment configuration: `api/.env` (see `api/.env.example` for the template).

## Frontend (Next.js)

Everything lives inside `frontend/`:

```bash
cd frontend
pnpm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
pnpm dev
```

Useful commands (run from `frontend/`):

```bash
pnpm build     # production build
pnpm start     # serve the production build
```

Environment configuration: `frontend/.env.local` (see
`frontend/.env.example` for the template). Only the public
`NEXT_PUBLIC_API_URL` variable is exposed to the browser — never put secrets in
`NEXT_PUBLIC_*` variables.

---

## Docker

Docker builds each application independently from its own directory and
orchestrates everything from the root:

```bash
docker compose up --build
```

This starts:

1. `postgres` — PostgreSQL 16 database
2. `migrate` — runs `prisma migrate deploy` + `prisma db seed` once, then exits
3. `api` — the NestJS API on `http://localhost:3000`
4. `frontend` — the Next.js app on `http://localhost:3001`

Both Dockerfiles use pnpm with `--frozen-lockfile` and their own
`pnpm-lock.yaml`. No root-level `package.json` or workspace file is needed.

Update the API environment (especially `JWT_SECRET` / `REFRESH_SECRET`) in
`docker-compose.yml` before deploying anywhere beyond local development.

---

## Repository Layout

```
blood-donation-api/
├── api/                 # independent NestJS application
│   ├── src/             # application source
│   ├── prisma/          # Prisma schema, migrations, seed
│   ├── test/            # e2e tests
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── .env / .env.example
│   ├── Dockerfile
│   └── ...
├── frontend/            # independent Next.js application
│   ├── src/             # app routes, components, API client
│   ├── public/
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── .env.local / .env.example
│   ├── Dockerfile
│   └── ...
├── docker-compose.yml
├── .gitignore
├── README.md
└── AGENTS.md
```
