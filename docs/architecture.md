# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep React components responsible for rendering and user interaction; use the shared API client for relative `/api` requests and show accessible loading, empty, and error states. Do not add authentication.
- Logic tier decision: Keep HTTP parsing, validation, status codes, and response shapes in Express routes, with calculations and recommendation rules in services. Convert malformed IDs and missing references into deliberate 4xx responses rather than Mongoose cast errors or 500s.
- Data tier decision: Enforce required fields and useful defaults in Mongoose schemas. Seed representative fixtures with repeatable upserts, preserving unrelated records and existing user/team relationships.
- Activity tracking approach: Accept valid existing user and team IDs, activity type, and positive minutes; calculate points from minutes using one point per minute and set `occurredAt` when creating the record. Return persisted records with their user and team IDs.
- Team management approach: Require a team name, preserve the submitted name and mascot, and store members as user references. List member IDs consistently with the API contract.
- Leaderboard approach: Sum persisted activity points per team, sort by total points descending, and assign 1-based ranks in the returned order.
- Workout suggestions approach: Find the user by email, then prioritize workouts whose focus matches the user's goal or recent activity. Include a human-readable reason for the top suggestion and return a deliberate 4xx when no user matches.

## Test plan

Run the narrowest tier contract first, then proceed upward. A failure in a lower-tier contract should be fixed before interpreting failures in dependent tiers.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — checks schema validation, defaults, and idempotent non-destructive seeding. Missing validation/default failures point to the models; seed failures point to seed behavior. Baseline: 4 failed, 1 passed (schema validation failures).
- API command: `npm run test:api --prefix octofit-tracker/backend` — checks request validation, persistence, response shapes, leaderboard ordering, and workout recommendations. Failures point to route/service behavior or its use of the data tier. Baseline: 4 failed (invalid requests returned 501 instead of 400, leaderboard was empty, and workout suggestions did not match the user's goal/activity).
- Frontend command: `npm test --prefix octofit-tracker/frontend` — checks API wiring, rendered data, loading/empty/error states, and accessibility. Failures point to presentation behavior or its API contract integration. Baseline: 15 failed; pages remained at “Implementation pending” rather than rendering the required states and data.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — checks TypeScript compilation. Fix type errors before proceeding; baseline: passed.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — checks frontend TypeScript and production bundling. Fix either type-check or bundler errors; baseline: passed.
