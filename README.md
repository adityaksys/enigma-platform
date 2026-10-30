# ENIGMA Platform

ENIGMA Platform is a full-stack web application for a coding club or student community. It combines a Django REST API for backend services with a Next.js frontend for member-facing pages, authentication, profile management, skill discovery, and membership workflows.

## Overview

The platform is designed around a club ecosystem:

- User authentication and registration
- Member profiles with academic and social details
- Skills directory and profile matching
- Membership application and review workflow
- Member listing and dashboard views

## Tech stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Django, Django REST Framework, JWT authentication
- Database: PostgreSQL
- CORS: django-cors-headers

## Repository structure

```text
.
├── backend/                 # Django API and app logic
│   ├── config/              # Django project settings and URLs
│   ├── membership/          # Membership application and club membership models
│   ├── profiles/            # Profile APIs and data models
│   ├── skills/              # Skill catalog and related APIs
│   ├── users/               # Authentication and custom user model
│   ├── manage.py            # Django command entrypoint
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Local environment variables (not committed)
├── frontend/                # Next.js app
│   ├── src/                 # App pages and client logic
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies and scripts
│   ├── .env.example         # Example frontend env file
│   └── README.md            # Frontend-specific docs
├── docs/                    # Supporting project documentation
├── infrastructure/          # Infra-related project assets
├── .github/                 # GitHub automation and repository config
├── package.json             # Root package metadata (if used by workspace tooling)
├── .gitignore               # Git ignore rules
└── README.md                # Project-wide documentation
```

## Core backend modules

### Users

- Custom Django user model
- Registration and login flow
- JWT token issuance and refresh support

### Profiles

- Personal profile retrieval and update functionality
- Academic details such as college, course, branch, and year
- Social links and profile metadata

### Skills

- Skill catalog with category and description
- Skill associations with member profiles

### Membership

- Membership application submission
- Status tracking: pending, approved, or rejected
- Admin review workflow and approved member record

## Frontend experience

The frontend app provides a member-facing interface with pages such as:

- `/` landing page
- `/login` authentication
- `/dashboard` member dashboard
- `/profile` profile management
- `/skills` skill listing
- `/members` public member directory
- `/membership` membership flow

## Local development setup

### Prerequisites

- Node.js 18+ or newer
- Python 3.11+ recommended
- PostgreSQL database instance running locally or in a managed environment
- Git

### 1. Backend setup

From the repository root:

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Create a local backend environment file:

```bash
copy .env.example .env
```

If `.env.example` is not present in the backend, create a `.env` file manually with the required Django and database variables, for example:

```env
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=true
DB_NAME=enigma
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=127.0.0.1
DB_PORT=5432
```

Then run the database setup and API server:

```bash
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

### 2. Frontend setup

From the repository root:

```bash
cd frontend
npm install
```

Create a local frontend environment file:

```bash
copy .env.example .env.local
```

Check the frontend example file and ensure the API base URL matches the running backend:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Then start the app:

```bash
npm run dev
```

The frontend will usually run on:

- http://localhost:3000

## Default runtime flow

1. Start PostgreSQL.
2. Start the Django API server on port 8000.
3. Start the Next.js frontend on port 3000.
4. Use the app to register or sign in, then visit the dashboard and profile flows.

## Useful commands

### Backend

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
python manage.py shell
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

## Notes

- The Django backend enforces JWT authentication for protected routes.
- The frontend stores access and refresh tokens in browser local storage in the current implementation.
- CORS is configured for the local frontend origin (`http://localhost:3000` and `http://127.0.0.1:3000`).
- For deployment, tighten security settings such as allowed hosts, CORS origins, secret keys, and token handling.

## Contributing

1. Create a feature branch.
2. Make the change in the relevant backend or frontend area.
3. Validate the relevant app behavior.
4. Open a pull request with a clear summary of the change.

## License

This project does not currently declare a repository-wide license in the codebase. If needed, add one before public or commercial distribution.
