# Vercel Deployment Strategies

## Overview

Vercel supports multiple deployment strategies. Choose the right one based on your project structure.

---

## Strategy 1: Single Project Deployment

**Best for**: Standalone applications (most common)

### How It Works

```
GitHub Repository
       │
       ▼
   Vercel Project
       │
       ▼
   https://your-app.vercel.app
```

### Configuration

1. Connect Git repository to Vercel
2. Vercel auto-detects framework
3. Every push triggers deployment

### Example: Next.js App

```
my-nextjs-app/
├── app/
├── public/
├── package.json
└── next.config.js
```

**Vercel Settings**:
- Root Directory: `/` (default)
- Framework: Next.js (auto-detected)
- Build Command: `next build` (auto)
- Output Directory: `.next` (auto)

---

## Strategy 2: Monorepo with Multiple Projects

**Best for**: Frontend + Backend in same repository

### How It Works

```
GitHub Repository (one repo)
       │
       ├──────────────────────┐
       ▼                      ▼
Vercel Project #1       Vercel Project #2
(Root: /frontend)       (Root: /backend)
       │                      │
       ▼                      ▼
app.example.com        api.example.com
```

### Configuration

Each subdirectory becomes a **separate Vercel project** with its own:
- Root Directory setting
- Environment variables
- Domain
- Build configuration

### Example: React + FastAPI Monorepo

```
monorepo/
├── frontend/           # Vercel Project #1
│   ├── src/
│   ├── package.json
│   └── vercel.json
├── backend/            # Vercel Project #2
│   ├── api/
│   │   └── index.py
│   ├── requirements.txt
│   └── vercel.json
└── README.md
```

**Project #1 Settings** (Frontend):
- Root Directory: `frontend`
- Framework: React/Next.js

**Project #2 Settings** (Backend):
- Root Directory: `backend`
- Framework: Other (Python)

### Linking Projects

```bash
# Link all projects in a monorepo to the same repo
vercel link --repo
```

---

## Strategy 3: Turborepo/Nx Monorepo

**Best for**: Large-scale monorepos with shared packages

### How It Works

```
monorepo/
├── apps/
│   ├── web/            # Vercel Project
│   ├── docs/           # Vercel Project
│   └── api/            # Vercel Project
├── packages/
│   ├── ui/             # Shared (not deployed)
│   └── utils/          # Shared (not deployed)
├── turbo.json
└── package.json
```

### Configuration

1. **Enable Remote Caching** (optional but recommended):
   ```bash
   npx turbo login
   npx turbo link
   ```

2. **Create separate Vercel projects** for each app
3. **Set Root Directory** to `apps/web`, `apps/api`, etc.
4. **Enable `sourceFilesOutsideRootDirectory`** if importing from `packages/`

### turbo.json for Vercel

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
        "dist/**"
      ]
    }
  }
}
```

### Edge Case: Importing from Parent Directories

If your app imports from `packages/` (outside root directory):

```json
// apps/web/vercel.json
{
  "sourceFilesOutsideRootDirectory": true
}
```

---

## Strategy 4: Static Site Deployment

**Best for**: HTML/CSS/JS sites, documentation, landing pages

### How It Works

Vercel serves static files directly from the repository.

### Example

```
static-site/
├── index.html
├── about.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── images/
```

**No configuration needed**. Vercel auto-detects and serves static files.

### With Build Step (e.g., Hugo, Jekyll)

```json
// vercel.json
{
  "buildCommand": "hugo",
  "outputDirectory": "public"
}
```

---

## Strategy 5: Serverless API Only

**Best for**: Backend APIs without frontend

### Supported Runtimes

| Runtime | File Extension | Builder |
|---------|---------------|---------|
| Node.js | `.js`, `.ts` | `@vercel/node` |
| Python | `.py` | `@vercel/python` |
| Go | `.go` | `@vercel/go` |
| Ruby | `.rb` | `@vercel/ruby` |

### Example: Express API

```
api-project/
├── api/
│   ├── index.js        # Main endpoint
│   ├── users.js        # /api/users
│   └── posts/
│       └── [id].js     # /api/posts/:id
└── package.json
```

### Example: FastAPI

```
api-project/
├── api/
│   └── index.py        # FastAPI app
├── requirements.txt
└── vercel.json
```

---

## Strategy 6: Edge Functions

**Best for**: Low-latency, globally distributed compute

### Characteristics

- Run at the edge (CDN nodes)
- Sub-millisecond cold starts
- Limited runtime (lighter than serverless)
- No file system access

### Configuration

```typescript
// api/edge-function.ts
export const config = {
  runtime: 'edge',
};

export default function handler(request: Request) {
  return new Response('Hello from the Edge!');
}
```

### Use Cases

- A/B testing
- Geolocation-based routing
- Authentication checks
- Request/response transformation

---

## Comparison Table

| Strategy | Use Case | Complexity | Cost |
|----------|----------|------------|------|
| Single Project | Most apps | Low | $ |
| Monorepo Multi-Project | Frontend + Backend | Medium | $$ |
| Turborepo | Large teams | High | $$$ |
| Static Site | Docs, landing pages | Very Low | Free |
| Serverless API | Backend only | Low | $ |
| Edge Functions | Low-latency | Medium | $$ |

---

## Decision Flowchart

```
START
  │
  ├─► Single deployable app?
  │     └─► YES → Strategy 1: Single Project
  │
  ├─► Multiple apps in one repo?
  │     ├─► With shared packages? → Strategy 3: Turborepo
  │     └─► Independent apps? → Strategy 2: Multi-Project
  │
  ├─► Just static files?
  │     └─► YES → Strategy 4: Static Site
  │
  ├─► API only (no frontend)?
  │     └─► YES → Strategy 5: Serverless API
  │
  └─► Need global low-latency?
        └─► YES → Strategy 6: Edge Functions
```

---

## Common Mistakes

### Mistake 1: Using Single Project for Monorepo

**Wrong**: Deploying a monorepo as a single project
**Right**: Create separate Vercel projects with different Root Directories

### Mistake 2: Not Setting Root Directory

**Wrong**: Leaving Root Directory empty for monorepo
**Right**: Set Root Directory to `frontend/` or `backend/`

### Mistake 3: Hardcoding API URLs

**Wrong**: `const API = "https://api.example.com"`
**Right**: `const API = process.env.NEXT_PUBLIC_API_URL`

### Mistake 4: Same Environment Variables for All Projects

**Wrong**: Using identical env vars across frontend/backend
**Right**: Each project has its own isolated env vars
