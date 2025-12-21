# Monorepo Configuration for Vercel

## Overview

Vercel supports deploying multiple applications from a single Git repository. This guide covers all monorepo patterns.

---

## Core Concept: Root Directory

The **Root Directory** setting tells Vercel which folder contains the application to deploy.

```
my-monorepo/                    # Git repository root
├── frontend/                   # Root Directory for Project #1
│   ├── package.json
│   └── vercel.json
├── backend/                    # Root Directory for Project #2
│   ├── requirements.txt
│   └── vercel.json
└── README.md
```

Each Vercel project points to a different Root Directory.

---

## Setup: Multiple Vercel Projects

### Step 1: Create First Project (Frontend)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. Configure:
   - **Project Name**: `myapp-frontend`
   - **Root Directory**: `frontend`
   - **Framework**: Auto-detected (Next.js, React, etc.)
4. Add environment variables
5. Deploy

### Step 2: Create Second Project (Backend)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the **same** repository
3. Configure:
   - **Project Name**: `myapp-backend`
   - **Root Directory**: `backend`
   - **Framework**: Other (or auto-detected)
4. Add environment variables
5. Deploy

### Step 3: Link Projects (Optional)

```bash
cd my-monorepo
vercel link --repo
```

This links all projects in the monorepo to the same Git repository.

---

## Directory Structures

### Pattern 1: Flat Structure

```
monorepo/
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vercel.json
├── backend/
│   ├── api/
│   ├── requirements.txt
│   └── vercel.json
└── README.md
```

### Pattern 2: Apps Folder

```
monorepo/
├── apps/
│   ├── web/              # Frontend
│   ├── docs/             # Documentation site
│   └── api/              # Backend API
├── packages/             # Shared code
│   ├── ui/
│   └── utils/
└── package.json
```

### Pattern 3: Turborepo Structure

```
monorepo/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── ui/
│   ├── config/
│   └── tsconfig/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## vercel.json for Monorepos

### Frontend vercel.json

```json
// frontend/vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs"
}
```

### Backend vercel.json (Python)

```json
// backend/vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "functions": {
    "api/**/*.py": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "rewrites": [
    { "source": "/(.*)", "destination": "/api/index.py" }
  ]
}
```

### Backend vercel.json (Node.js)

```json
// backend/vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

---

## Importing from Parent Directories

If your app imports code from outside its Root Directory:

```
monorepo/
├── packages/
│   └── shared/           # Shared utilities
│       └── utils.ts
└── apps/
    └── web/              # Root Directory
        └── src/
            └── app.ts    # imports from ../../packages/shared
```

### Solution: Enable sourceFilesOutsideRootDirectory

```json
// apps/web/vercel.json
{
  "sourceFilesOutsideRootDirectory": true
}
```

Or via Vercel Dashboard:
1. Project Settings → General
2. Enable "Include source files outside of the Root Directory"

---

## Turborepo Integration

### turbo.json Configuration

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [
        ".next/**",
        "!.next/cache/**",
        "dist/**",
        ".vercel/output/**"
      ],
      "env": ["NEXT_PUBLIC_*"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Vercel + Turborepo

1. **Enable Remote Caching**:
   ```bash
   npx turbo login
   npx turbo link
   ```

2. **Override Build Command** (optional):
   ```json
   // apps/web/vercel.json
   {
     "buildCommand": "cd ../.. && npx turbo build --filter=web"
   }
   ```

### Affected Projects Deployments

Skip deploying projects that haven't changed:

Enable in Vercel Dashboard:
- Project Settings → Git → Ignored Build Step

Or use `vercel.json`:

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "feat/*": true
    }
  }
}
```

---

## Environment Variables in Monorepos

### Isolation

Each Vercel project has its own environment variables. They don't share.

```
Frontend Project:
├── NEXT_PUBLIC_API_URL=https://api.example.com
├── DATABASE_URL=postgresql://...
└── AUTH_SECRET=xxx

Backend Project:
├── DATABASE_URL=postgresql://...  # Same or different
├── AUTH_SECRET=xxx                # Should match frontend
└── FRONTEND_URL=https://example.com
```

### Shared Environment Variables (Team Feature)

For Pro/Enterprise teams:
1. Go to Team Settings → Environment Variables
2. Add shared variables
3. Link to multiple projects

### Cross-Project References

Frontend needs to know backend URL and vice versa:

**Frontend**:
```
NEXT_PUBLIC_API_URL=https://myapp-backend.vercel.app/api/v1
```

**Backend**:
```
FRONTEND_URL=https://myapp-frontend.vercel.app
ALLOWED_ORIGINS=https://myapp-frontend.vercel.app
```

---

## Build Optimization

### 1. Affected Builds Only

Only rebuild when relevant files change:

```json
// apps/web/vercel.json
{
  "ignoreCommand": "npx turbo-ignore"
}
```

### 2. Caching

Turborepo caches build outputs:

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "outputs": [".next/**", "!.next/cache/**"]
    }
  }
}
```

### 3. Parallel Builds

Enable on Pro/Enterprise:
- Project Settings → General → Concurrent Builds

---

## Edge Cases

### Edge Case 1: Wrong Project Deploys

**Problem**: Pushing to frontend/ triggers backend deployment

**Solution**: Use Ignored Build Step

```bash
# .vercel/ignore-build.sh
#!/bin/bash
git diff --quiet HEAD^ HEAD -- frontend/
```

### Edge Case 2: Shared Package Changes Not Detected

**Problem**: Changes to `packages/shared` don't trigger rebuild

**Solution**: Configure Turborepo properly

```json
// apps/web/package.json
{
  "dependencies": {
    "@myapp/shared": "workspace:*"
  }
}
```

### Edge Case 3: Build Order Issues

**Problem**: Frontend builds before backend, fails on API check

**Solution**: Don't validate API at build time, or use relatedProjects

```json
// apps/web/vercel.json
{
  "relatedProjects": ["prj_backend123"]
}
```

### Edge Case 4: Different Node Versions

**Problem**: Frontend needs Node 20, backend needs Node 18

**Solution**: Set per-project in package.json

```json
// apps/web/package.json
{
  "engines": { "node": "20.x" }
}

// apps/api/package.json
{
  "engines": { "node": "18.x" }
}
```

### Edge Case 5: Deployment URLs Unknown at Build

**Problem**: Need backend URL in frontend, but it's not deployed yet

**Solution**: Use environment variables, update after first deploy

```bash
# After backend deploys:
vercel env add NEXT_PUBLIC_API_URL production
# Value: https://myapp-backend.vercel.app/api/v1
```

---

## CLI Commands for Monorepos

```bash
# Link all projects in monorepo
vercel link --repo

# Deploy specific project
cd apps/web && vercel

# Deploy with specific root
vercel --cwd apps/web

# List all linked projects
vercel project ls

# Pull env vars for specific project
cd apps/web && vercel env pull
```

---

## Complete Example

### Repository Structure

```
my-saas/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   ├── package.json
│   │   └── vercel.json
│   └── api/                    # FastAPI backend
│       ├── api/
│       │   └── index.py
│       ├── app/
│       ├── requirements.txt
│       └── vercel.json
├── packages/
│   └── shared/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### apps/web/vercel.json

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "sourceFilesOutsideRootDirectory": true
}
```

### apps/api/vercel.json

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "functions": {
    "api/**/*.py": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "rewrites": [
    { "source": "/(.*)", "destination": "/api/index.py" }
  ]
}
```

### Vercel Dashboard Setup

**Project 1: my-saas-web**
- Root Directory: `apps/web`
- Framework: Next.js
- Env: `NEXT_PUBLIC_API_URL=https://my-saas-api.vercel.app/api/v1`

**Project 2: my-saas-api**
- Root Directory: `apps/api`
- Framework: Other
- Env: `DATABASE_URL`, `FRONTEND_URL=https://my-saas-web.vercel.app`
