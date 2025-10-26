# APHRDI Backend

This repository contains the APHRDI backend (Express + MongoDB). The project includes authentication, modules, quizzes, translation, adaptive recommendations, and gamification endpoints.

## Quick overview

- Server: Express
- DB: MongoDB (Mongoose)
- Auth: JWT
- AI: OpenAI (optional, via `OPENAI_API_KEY`)

## Files of interest

- `server.js` - app entry and route wiring
- `config/db.js` - MongoDB connection helper
- `controllers/` - route handlers
- `routes/` - Express routes (mounted under `/api`)
- `models/` - Mongoose models
- `middleware/auth.js` - `protect` middleware that checks `Authorization: Bearer <token>`
- `utils/aiService.js` - small wrapper for OpenAI (requires `OPENAI_API_KEY`)
- `postman_collection_aphrdi.json` - Postman collection for quick testing
- `postman_environment_aphrdi.json` - Postman environment with `baseUrl` and `token` variables

## Environment variables

Create a `.env` file in the project root (already present in this repo). Required keys:

```
MONGO_URI=<your mongodb connection string>
JWT_SECRET=<your jwt secret>
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=<optional OpenAI key>
```

Note: Example connection string used during setup (replace with your own or keep the current Atlas user you provided):

```
MONGO_URI=mongodb+srv://charankopallecreator_db_user:...@cluster0.qtl0x6t.mongodb.net/
```

## Install

Open PowerShell in repository root and run:

```powershell
npm install
```

## Run (development)

```powershell
npm run dev
```

This runs `nodemon server.js`. Server listens on `http://localhost:5000` by default.

## Health check

Visit:

```
GET http://localhost:5000/
```

Response: `APHRDI API is running` (plain text). Useful to confirm server is up.

## Important API endpoints (copy into Postman/Hoppscotch)

Base URL: `http://localhost:5000`

Auth (returns a JWT on success):
- POST `/api/auth/register`
  - Body JSON: { "username": "user", "email": "a@b.com", "password": "pass" }
- POST `/api/auth/login`
  - Body JSON: { "email": "a@b.com", "password": "pass" }

Protected endpoints (add header `Authorization: Bearer <JWT>`):

Modules:
- GET `/api/modules` (list)
- GET `/api/modules/:id`
- POST `/api/modules` (create)

Quizzes:
- GET `/api/quizzes/module/:moduleId`
- POST `/api/quizzes/:quizId/submit` (body: `{ "answers": [0,1,2] }`)

Translation:
- POST `/api/translate/translate` (body: `{ "text": "Hello", "targetLanguage": "es" }`)

Adaptive:
- GET `/api/adaptive/recommendations`

Gamification:
- POST `/api/gamification/points` (body: `{ "points": 10, "activity": "quiz_complete" }`)

## Postman / Hoppscotch

You can import `postman_collection_aphrdi.json` and `postman_environment_aphrdi.json`. The collection contains requests for register/login and automatically stores the returned `token` into the Postman environment variable `token`.

In Hoppscotch you can import the collection (Hoppscotch supports Postman collections) but you may need to manually set the environment variable `token` after login.

## Example PowerShell test

Register and call a protected route (copy-paste):

```powershell
# Register
$body = @{ username = 'temp'; email = 'temp+test@example.com'; password = 'TempPass123!' } | ConvertTo-Json
$res = Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/auth/register -ContentType 'application/json' -Body $body
$token = $res.token

# Use token for protected endpoint
Invoke-RestMethod -Method Get -Uri http://localhost:5000/api/modules -Headers @{ Authorization = "Bearer $token" }
```

## Troubleshooting

- 404 on `/` or `/api/...`:
  - Confirm the server is running and port matches (default `5000`).
  - Ensure the request URL has no stray characters (e.g., `%0A` — trailing newline). Copy-paste carefully.

- `Not authorized, no token`:
  - You hit a protected route without `Authorization: Bearer <token>` header. Register or login to get a token and include it.

- Database errors:
  - Make sure `MONGO_URI` is valid and network/Atlas IP access is allowed.

## Cleanup

If you created test users in your DB during testing and want to remove them, remove the corresponding documents from the `users` collection in MongoDB (via MongoDB Atlas UI, Compass, or mongo CLI).

## Next steps (suggestions)

- Add more tests (unit/integration) and CI.
- Add request validation (e.g., `express-validator`).
- Add role-based access to admin routes if needed.

---

If you'd like, I can also add a small `seed` script to precreate a test user/module/quiz and output a token for automated testing — say "add seed script" and I'll implement it.
