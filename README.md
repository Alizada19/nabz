# Blood Donation & Emergency Blood Request API

A production-ready **NestJS** REST API powering a blood donation platform: donor
registration, emergency blood requests, automatic compatible-donor matching by
blood type + geographic proximity, and push-notification-ready alerts. Built to be
consumed by a Flutter mobile application.

## Tech Stack

- **NestJS 10** on **Node.js 24 LTS** (TypeScript)
- **PostgreSQL** + **Prisma ORM**
- **JWT** authentication (access + refresh tokens) via Passport
- **bcrypt** password hashing
- **class-validator** / **class-transformer** for DTO validation
- **Swagger / OpenAPI** documentation
- **Helmet**, **CORS**, and **@nestjs/throttler** rate limiting
- **Firebase Cloud Messaging**-ready notification provider
- **Docker** + **docker-compose**
- **Jest** unit and e2e tests

## Architecture

```
src/
  auth/               # Registration, login, JWT/refresh strategies, guards
  users/               # User profile management
  blood-types/         # Reference blood type data (A+, A-, B+, ...)
  donor-profiles/       # Donor-specific profile (blood type, availability)
  blood-requests/       # Emergency blood request lifecycle
  matching/             # BloodCompatibilityService + DonorMatchingService (Haversine)
  notifications/        # Notification persistence + FCM-ready push provider
  common/                # Filters, interceptors, guards, decorators, pagination, GeoService
  config/                # Typed environment configuration
  database/              # PrismaService / PrismaModule
  main.ts
  app.module.ts
prisma/
  schema.prisma
  seed.ts
test/
  app.e2e-spec.ts
```

Each feature module follows the same shape: `controller` → `service` → Prisma
(acting as the repository layer), with `dto/` for validated input and
`interfaces/` for typed contracts. Cross-cutting concerns (auth guards, response
envelope, exception handling, pagination, geolocation) live in `common/` and are
injected wherever needed — no code duplication across modules.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# edit .env with your DATABASE_URL, JWT secrets, etc.
```

### 3. Set up the database

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

This creates all tables, seeds the 8 reference blood types (A+, A-, B+, B-, AB+,
AB-, O+, O-), and creates a demo admin user (`admin@blooddonation.local` /
`Admin@12345`).

### 4. Run the app

```bash
# development (watch mode)
npm run start:dev

# production
npm run build
npm run start:prod
```

The API is served under the `/api` prefix, e.g. `http://localhost:3000/api/auth/login`.

### 5. Swagger documentation

Once running, open:

```
http://localhost:3000/api/docs
```

Every endpoint is documented with request/response examples, auth requirements,
and error responses. Click **Authorize** and paste an access token to test
protected routes directly from the UI.

## Docker

Spin up PostgreSQL, run migrations + seed, and start the API in one command:

```bash
docker compose up
```

This starts three services: `postgres` (database), `migrate` (runs
`prisma migrate deploy` + `prisma db seed` once, then exits), and `api` (the
NestJS server), all wired together with health checks so migrations only run
once the database is ready. Update the environment variables in
`docker-compose.yml` (especially `JWT_SECRET` / `REFRESH_SECRET`) before
deploying anywhere beyond local development.

## Testing

```bash
# unit tests
npm run test

# unit tests with coverage
npm run test:cov

# e2e tests (requires a running, migrated & seeded database)
npm run test:e2e
```

Unit tests cover: blood compatibility rules, Haversine distance calculation,
donor matching (radius filtering, sorting, privacy masking, pagination), JWT/role
guards, auth register/login/refresh flows, blood-request status transitions, and
notification fan-out. E2E tests exercise the real HTTP surface: registration,
login, JWT-protected routes, and the nearby-donors endpoint.

## Core Concepts

### Blood Compatibility Engine

`BloodCompatibilityService` encodes standard transfusion-compatibility rules in a
single reusable lookup map (recipient blood type → compatible donor types):

| Recipient | Compatible donors |
|---|---|
| O- | O- |
| O+ | O+, O- |
| A- | A-, O- |
| A+ | A+, A-, O+, O- |
| B- | B-, O- |
| B+ | B+, B-, O+, O- |
| AB- | AB-, A-, B-, O- |
| AB+ | AB+, AB-, A+, A-, B+, B-, O+, O- (universal recipient) |

### Donor Matching Workflow

When a `POST /api/blood-requests` is created:

1. Resolve the compatible donor blood types for the requested type.
2. Query available donors of those blood types with a known location.
3. Compute distance from the hospital using the **Haversine formula**.
4. Filter to donors within the search radius (default **50 km**, configurable
   via `DEFAULT_RADIUS`).
5. Sort by nearest first.
6. Persist and push a notification to each matched donor
   ("Emergency Blood Request — A patient requires A+ blood near Kuala Lumpur.").

The same matching engine powers `GET /api/donors/nearby` for on-demand donor
search from the mobile app.

### Privacy & Security

- Passwords are hashed with **bcrypt** and never returned in any response.
- Refresh tokens are hashed at rest and rotated on each refresh.
- Donor phone numbers and email addresses are **never** exposed to seekers.
- Exact GPS coordinates are **never** exposed in any API response — only
  approximate distance (km) and a human-readable location string.
- Donor display names are masked (`"Ahmad Zulkifli"` → `"Ahmad Z."`) in matching
  results.
- Every route requires a valid JWT by default; only `@Public()`-decorated routes
  (register, login, refresh, blood-types list) are open.
- `@Roles()` + `RolesGuard` enforce role-based access (admin / donor / seeker).
- Global `ValidationPipe` rejects unknown/invalid fields on every request.
- `helmet`, CORS, and `@nestjs/throttler` rate limiting are enabled globally.

## API Response Format

All responses share a consistent envelope, enforced by a global
`ResponseInterceptor` and `HttpExceptionFilter`:

**Success**
```json
{
  "success": true,
  "message": "Blood request created successfully",
  "data": { "id": "...", "status": "pending", "...": "..." }
}
```

**Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": { "details": ["latitude must be a valid latitude"] },
  "timestamp": "2026-07-31T12:00:00.000Z",
  "path": "/api/blood-requests"
}
```

## Key Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register as donor/seeker/admin | Public |
| POST | `/api/auth/login` | Login, returns access + refresh token | Public |
| POST | `/api/auth/refresh` | Exchange refresh token for new token pair | Refresh token |
| POST | `/api/auth/logout` | Revoke the refresh token | JWT |
| GET | `/api/auth/profile` | Current user profile | JWT |
| GET | `/api/users/me` / `PATCH /api/users/me` | View/update profile | JWT |
| GET | `/api/blood-types` | List reference blood types | Public |
| POST | `/api/donor-profiles` | Create donor profile | JWT (donor) |
| PATCH | `/api/donor-profiles/me` | Update blood type / availability | JWT (donor) |
| PATCH | `/api/donor-profiles/me/location` | Update donor GPS location | JWT (donor) |
| POST | `/api/blood-requests` | Create an emergency blood request (triggers matching) | JWT (seeker) |
| GET | `/api/blood-requests/my` | List my requests (paginated, filterable by status) | JWT (seeker) |
| GET | `/api/blood-requests/:id` | Get a single request | JWT |
| PATCH | `/api/blood-requests/:id/status` | Update request status | JWT (seeker) |
| GET | `/api/donors/nearby?bloodType=A+&latitude=..&longitude=..&radius=20` | Find nearby compatible donors | JWT |
| GET | `/api/notifications` | List my notifications (paginated) | JWT |
| PATCH | `/api/notifications/:id/read` | Mark a notification as read | JWT |

Full request/response schemas and example payloads are available in Swagger at
`/api/docs`.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | Access-token signing secret | — |
| `JWT_EXPIRES_IN` | Access-token lifetime | `15m` |
| `REFRESH_SECRET` | Refresh-token signing secret | — |
| `REFRESH_EXPIRES_IN` | Refresh-token lifetime | `7d` |
| `FCM_SERVER_KEY` | Firebase Cloud Messaging server key (optional) | — |
| `DEFAULT_RADIUS` | Default donor-matching radius in km | `50` |
| `THROTTLE_TTL` / `THROTTLE_LIMIT` | Rate-limit window (s) / max requests | `60` / `20` |
| `APP_URL` / `PORT` | App base URL / listen port | `http://localhost:3000` / `3000` |

## Flutter Integration Notes

- All list endpoints (`/blood-requests/my`, `/donors/nearby`, `/notifications`)
  support `page`, `limit`, `sortBy`, `sortOrder`, and `search` query parameters
  and return a `{ items, meta: { total, page, limit, totalPages } }` shape.
- Store the `accessToken` for `Authorization: Bearer <token>` headers and the
  `refreshToken` securely (e.g. `flutter_secure_storage`) to silently refresh
  sessions via `POST /api/auth/refresh`.
- Push notifications: once FCM device tokens are collected client-side, wire
  them into `NotificationsService` / `FcmProvider` (`src/notifications/`) — the
  provider interface is already in place, only the `firebase-admin` call needs
  to be added.

## Extending FCM

`src/notifications/fcm.provider.ts` currently logs a message when no
`FCM_SERVER_KEY` is configured. To go live:

1. `npm install firebase-admin`
2. Initialize `admin.initializeApp()` with your service account credentials.
3. Replace the `// TODO` in `FcmProvider.send()` with
   `admin.messaging().send({ token, notification: { title, body } })`.
4. Add a `deviceToken` field to the `User` model (via a Prisma migration) and
   populate it when the Flutter app registers for push notifications.

No other module needs to change — `NotificationsService` and the donor-matching
fan-out already call through this single abstraction.
