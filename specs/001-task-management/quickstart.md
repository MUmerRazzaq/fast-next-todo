# Quickstart Guide: Fast Next Todo

**Feature Branch**: `001-task-management`
**Date**: 2025-12-14

This guide helps developers set up the Fast Next Todo application for local development.

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Python | 3.13+ | Backend runtime |
| Node.js | 20+ LTS | Frontend runtime |
| uv | latest | Python package manager |
| npm/pnpm | latest | Node package manager |
| Git | latest | Version control |
| Docker | latest | Local PostgreSQL (optional) |

### Accounts Needed

| Service | Purpose | Required |
|---------|---------|----------|
| Neon | PostgreSQL database | Yes |
| GitHub | Code repository | Yes |

---

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fast-next-todo
git checkout 001-task-management
```

### 2. Environment Configuration

Create environment files for both backend and frontend.

**Backend (.env in backend/):**

```bash
# Copy example and edit
cp backend/.env.example backend/.env
```

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require

# Authentication
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars

# Application
DEBUG=true
ENVIRONMENT=development
API_HOST=0.0.0.0
API_PORT=8000

# CORS
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local in frontend/):**

```bash
# Copy example and edit
cp frontend/.env.example frontend/.env.local
```

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Better Auth
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars
BETTER_AUTH_URL=http://localhost:3000
```

> **Important**: The `BETTER_AUTH_SECRET` must be identical in both frontend and backend for JWT verification to work.

---

## Backend Setup

### 1. Install Dependencies

```bash
cd backend

# Create virtual environment and install deps with uv
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv pip install -e ".[dev]"
```

### 2. Database Setup

**Option A: Using Neon (Recommended)**

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the pooled connection string (`-pooler` suffix)
3. Add to `backend/.env` as `DATABASE_URL`

**Option B: Local PostgreSQL with Docker**

```bash
docker run -d \
  --name fast-next-todo-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=fastnexttodo \
  -p 5432:5432 \
  postgres:16

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fastnexttodo
```

### 3. Run Migrations

```bash
# Initialize Alembic (if not already done)
alembic init alembic

# Generate initial migration
alembic revision --autogenerate -m "Initial tables"

# Apply migrations
alembic upgrade head
```

### 4. Start the Backend Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Docs (Swagger): http://localhost:8000/docs
- Docs (ReDoc): http://localhost:8000/redoc

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend

# Install dependencies
npm install
# or
pnpm install
```

### 2. Initialize shadcn/ui

```bash
# Initialize shadcn/ui (run once)
npx shadcn@latest init

# When prompted:
# - Style: Default
# - Base color: Neutral
# - CSS variables: Yes

# Add required components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add checkbox
npx shadcn@latest add badge
npx shadcn@latest add toast
npx shadcn@latest add skeleton
npx shadcn@latest add select
```

### 3. Start the Development Server

```bash
npm run dev
# or
pnpm dev
```

The frontend will be available at:
- App: http://localhost:3000

### 4. Theme Setup

The app supports dark and light mode. Theme is controlled via:
- CSS variables in `globals.css`
- ThemeProvider component
- Theme toggle in the header

```tsx
// Toggle theme in your component
import { useTheme } from '@/components/theme-provider';

const { theme, setTheme } = useTheme();
setTheme('dark'); // or 'light' or 'system'
```

---

## Verification Steps

### 1. Check Backend Health

```bash
curl http://localhost:8000/api/v1/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-14T12:00:00Z",
  "version": "1.0.0"
}
```

### 2. Check Database Connection

```bash
# In backend directory with venv activated
python -c "from app.database import engine; print('DB connection OK')"
```

### 3. Check Frontend Compiles

```bash
cd frontend
npm run build
```

---

## Development Workflow

### Running Tests

**Backend:**
```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/test_task_service.py

# Run with verbose output
pytest -v
```

**Frontend:**
```bash
cd frontend

# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Code Quality

**Backend:**
```bash
cd backend

# Run linter
ruff check .

# Run formatter
ruff format .

# Type checking
mypy app/
```

**Frontend:**
```bash
cd frontend

# Run linter
npm run lint

# Fix lint issues
npm run lint:fix

# Type checking
npm run type-check
```

### Database Migrations

```bash
cd backend

# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# View migration history
alembic history
```

---

## Project Structure

```
fast-next-todo/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application
│   │   ├── config.py         # Environment config
│   │   ├── database.py       # DB connection
│   │   ├── models/           # SQLModel models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Data access
│   │   ├── api/              # Route handlers
│   │   └── middleware/       # Auth middleware
│   ├── tests/
│   ├── alembic/              # Migrations
│   └── pyproject.toml
│
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities
│   │   ├── hooks/            # Custom hooks
│   │   └── types/            # TypeScript types
│   ├── tests/
│   └── package.json
│
├── specs/                    # Feature specifications
│   └── 001-task-management/
│       ├── spec.md
│       ├── plan.md
│       ├── research.md
│       ├── data-model.md
│       ├── quickstart.md
│       └── contracts/
│           └── openapi.yaml
│
├── docker-compose.yml        # Docker Compose config
├── vercel.json               # Vercel deployment config
└── .specify/                 # SpecKit Plus templates
```

---

## Docker Local Testing

Before deploying to Vercel, test the application locally in Docker containers.

### Prerequisites

- Docker Desktop or Docker Engine installed
- Docker Compose v2+

### Quick Start

```bash
# Start all services (postgres, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### First-Time Setup

```bash
# 1. Build and start containers
docker-compose up -d --build

# 2. Run database migrations
docker-compose exec backend alembic upgrade head

# 3. Verify services are running
docker-compose ps
```

### Running Tests in Docker

```bash
# Run backend tests
docker-compose exec backend pytest

# Run backend tests with coverage
docker-compose exec backend pytest --cov=app --cov-report=html

# Run frontend tests
docker-compose exec frontend npm test

# Run E2E tests
docker-compose exec frontend npm run test:e2e
```

### Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js application |
| Backend API | http://localhost:8000 | FastAPI server |
| API Docs | http://localhost:8000/docs | Swagger UI |
| PostgreSQL | localhost:5432 | Database (user: postgres, pass: postgres) |

### Production Build Testing

Test production builds before deploying:

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Run production containers
docker-compose -f docker-compose.prod.yml up -d

# Verify production build
curl http://localhost:8000/api/v1/health
```

### Useful Docker Commands

```bash
# Rebuild a specific service
docker-compose build backend

# View logs for specific service
docker-compose logs -f backend

# Execute command in running container
docker-compose exec backend bash

# Remove all containers and volumes (clean slate)
docker-compose down -v

# Check container resource usage
docker stats
```

### Pre-Deployment Checklist

Before deploying to Vercel, ensure:

- [ ] `docker-compose up` starts all services without errors
- [ ] Database migrations complete successfully
- [ ] All backend tests pass (`docker-compose exec backend pytest`)
- [ ] All frontend tests pass (`docker-compose exec frontend npm test`)
- [ ] API health endpoint responds (`curl localhost:8000/api/v1/health`)
- [ ] Frontend loads correctly at localhost:3000
- [ ] Authentication flow works end-to-end
- [ ] Production build completes without errors

---

## Deployment to Vercel

### Prerequisites

1. Vercel account (https://vercel.com)
2. Vercel CLI installed: `npm i -g vercel`
3. GitHub repository connected to Vercel

### Initial Setup

**1. Install Vercel CLI and login:**

```bash
npm i -g vercel
vercel login
```

**2. Link project to Vercel:**

```bash
vercel link
```

**3. Set up Neon integration:**

1. Go to Vercel Dashboard → Your Project → Integrations
2. Search for "Neon" and click "Add Integration"
3. Authorize and connect to your Neon project
4. `DATABASE_URL` will be automatically set

**4. Configure environment variables:**

```bash
# Set production secrets
vercel env add BETTER_AUTH_SECRET production
vercel env add FRONTEND_URL production  # e.g., https://yourdomain.com

# Set preview secrets (same values usually work)
vercel env add BETTER_AUTH_SECRET preview
vercel env add FRONTEND_URL preview
```

### Deploy

**Preview deployment (automatic on PR):**
```bash
vercel
```

**Production deployment:**
```bash
vercel --prod
```

### Vercel Configuration

Create `vercel.json` in the repository root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "backend/app/main.py",
      "use": "@vercel/python",
      "config": {
        "maxLambdaSize": "15mb"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/v1/(.*)",
      "dest": "backend/app/main.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

### Backend Adaptation for Serverless

Add Mangum adapter to `backend/app/main.py`:

```python
from mangum import Mangum

# ... existing FastAPI app code ...

# Add at the end of main.py
handler = Mangum(app, lifespan="off")
```

Add Mangum to dependencies in `backend/pyproject.toml`:

```toml
dependencies = [
    # ... existing deps ...
    "mangum>=0.17.0",
]
```

### Verify Deployment

After deployment, verify:

```bash
# Check health endpoint
curl https://your-app.vercel.app/api/v1/health

# Expected response
{"status": "healthy", "timestamp": "...", "version": "1.0.0"}
```

### Monitoring

- **Vercel Dashboard**: View deployments, logs, and analytics
- **Function Logs**: Vercel Dashboard → Your Project → Logs
- **Neon Console**: Monitor database connections and queries

---

## Common Issues

### Database Connection Errors

**Error**: `connection refused`
- Check if PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Ensure the `-pooler` suffix for Neon

**Error**: `SSL required`
- Add `?sslmode=require` to connection string

### Authentication Errors

**Error**: `401 Unauthorized` on all requests
- Verify `BETTER_AUTH_SECRET` matches in both envs
- Check JWT token is being sent in Authorization header
- Ensure token hasn't expired

### Frontend API Connection

**Error**: `Network Error` or `CORS error`
- Verify `FRONTEND_URL` in backend .env
- Check `NEXT_PUBLIC_API_URL` in frontend .env.local
- Ensure backend is running on the expected port

### Vercel Deployment Errors

**Error**: `Function size too large`
- Check `maxLambdaSize` in vercel.json (max 50mb)
- Remove unnecessary dependencies
- Use lazy imports for heavy modules

**Error**: `Cold start timeout`
- Reduce Python dependencies
- Use Neon pooled connection string
- Consider Vercel's "Always On" feature

**Error**: `Module not found` in Python function
- Ensure `requirements.txt` is in backend/ directory
- Check dependency versions are compatible
- Verify imports are correct

**Error**: `500 Internal Server Error` on API routes
- Check Vercel function logs for details
- Verify environment variables are set
- Ensure DATABASE_URL uses pooler suffix

---

## Useful Commands

```bash
# Start both backend and frontend (from repo root)
# Option 1: Two terminals
cd backend && uvicorn app.main:app --reload
cd frontend && npm run dev

# Option 2: Using concurrently (if configured)
npm run dev

# Generate OpenAPI client (if using code generation)
cd frontend
npx openapi-typescript ../specs/001-task-management/contracts/openapi.yaml -o src/types/api.generated.ts

# Reset database (CAUTION: destroys all data)
cd backend
alembic downgrade base
alembic upgrade head

# Vercel commands
vercel                    # Deploy preview
vercel --prod             # Deploy production
vercel logs               # View function logs
vercel env ls             # List environment variables
vercel env pull           # Pull env vars to .env.local
```

---

## Next Steps

1. **Read the specification**: `specs/001-task-management/spec.md`
2. **Review the data model**: `specs/001-task-management/data-model.md`
3. **Check API contracts**: `specs/001-task-management/contracts/openapi.yaml`
4. **Run `/sp.tasks`** to generate the implementation task list
