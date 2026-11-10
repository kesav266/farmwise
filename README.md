# Smart Urea Management System

## Admin account setup

Admin accounts are not created through public registration. To set up the first
admin account, run this command from the project root:

```powershell
.\.venv\Scripts\python.exe -m scripts.bootstrap_admin
```

The script can promote an already registered active account (including an
account created earlier from the registration page), or create a new admin
account if none exists. Promoting a specified existing account is allowed even
if another admin account is already present. Sign in at `frontend/login.html`
using the Admin role and the account's email and password.

Public registration supports farmer and dealer accounts.

## Deploy to Render

The application can run as one Render web service. The FastAPI service serves
both the API and the files in `frontend/`, so the deployed UI uses same-origin
API requests. The included `render.yaml` provisions the web service and a
managed PostgreSQL database.

1. Push the project to a Git provider and create a Render Blueprint from the
   repository.
2. Deploy the services described by `render.yaml`.
3. Render generates `SECRET_KEY` and injects `DATABASE_URL`. Do not commit
   production secrets or the local `.env` file.
4. After the first deploy, create an administrator from the service shell:

   ```powershell
   python -m scripts.bootstrap_admin
   ```

5. Open the service URL and sign in through `frontend/login.html` (or the
   service root).

For local development, copy `.env.example` to `.env`, install
`requirements.txt`, initialize the database with
`python -m scripts.init_db`, and run:

```powershell
uvicorn backend.main:app --reload --port 8001
```

## Deploy the complete application to Vercel

The repository includes a Vercel Python entrypoint and route configuration.
FastAPI serves the API and the existing frontend from the same deployment.
Vercel's filesystem is ephemeral, so configure a managed PostgreSQL database;
do not use the local SQLite URL in production.

Set these Vercel project environment variables for Production:

- `SECRET_KEY`: a long random secret
- `DATABASE_URL`: a PostgreSQL connection string
- `ACCESS_TOKEN_EXPIRE_MINUTES`: `30`
- `ALLOWED_ORIGINS`: the deployed Vercel origin, for example
  `https://your-project.vercel.app`

Import the repository into Vercel, keep the project root at the repository
root, and deploy. The `vercel.json` file routes all requests through
`api/index.py`, allowing both `/health` and the frontend pages to work.

## Deploy the frontend to GitHub Pages

GitHub Pages hosts only the static frontend. It cannot run the FastAPI backend
or provide persistent database storage, so login and data-management features
require a separately deployed backend.

The workflow at `.github/workflows/deploy-pages.yml` publishes `frontend/` at
the Pages site root whenever `main` is updated. Enable Pages in the repository
settings using **GitHub Actions** as the source, then push the repository to
GitHub. If the backend is hosted separately, set `window.API_BASE_URL` before
the frontend scripts load or update `frontend/js/api.js` and
`frontend/js/farmer-config.js` to use that HTTPS API URL.