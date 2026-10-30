# ENIGMA frontend

This is the Next.js App Router frontend for the Django application in the
adjacent backend directory.

The public landing page is at /. Member-facing routes are /login, /dashboard,
/profile, /skills, /members, and /membership.

## Local development

1. In this directory, create .env.local from .env.example.
2. Keep NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000 for the local Django
   server. Do not add a trailing slash.
3. Install dependencies with npm install and start the app with npm run dev.
4. In the backend directory, activate its existing virtual environment, ensure its
   PostgreSQL environment variables are configured, then run:

    python manage.py migrate
    python manage.py runserver 127.0.0.1:8000

The Django CORS configuration already accepts Next.js on
http://localhost:3000 and http://127.0.0.1:3000.

## API and authentication

All browser API calls go through src/lib/api.ts. The base URL comes from
NEXT_PUBLIC_API_BASE_URL and falls back to the local Django URL only when
that variable is absent. The client sends JWT access tokens as
Authorization: Bearer <token>.

The current login screen stores the access and refresh tokens in browser local
storage. For a public production deployment, move token handling to secure,
HTTP-only cookies and restrict Django's ALLOWED_HOSTS and
CORS_ALLOWED_ORIGINS to the deployed frontend origin.

## Checks

    npm run lint
    npm run build
