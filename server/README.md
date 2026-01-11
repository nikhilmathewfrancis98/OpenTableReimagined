Server skeleton for OpenTableReimagined

Quick start

1. Install dependencies

```bash
cd server
npm install
```

2. Provide Admin credentials

Create a Firebase service account JSON and set `GOOGLE_APPLICATION_CREDENTIALS` to its path:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/full/path/to/service-account.json
```

On Windows cmd:

```cmd
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\service-account.json
```

3. Run

```bash
npm start
```

Endpoints
- `GET /health` — health check
- `GET /api/protected/profile` — protected endpoint; requires `Authorization: Bearer <idToken>` header

Notes
- Do not commit service account JSON to source control.
- Use HTTPS in production and secure cookie/session flows for web clients.
