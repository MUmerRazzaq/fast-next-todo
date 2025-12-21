# Environment Variables on Vercel

## Overview

Vercel provides a robust environment variable system with support for different environments, encryption, and team-level sharing.

---

## Environment Types

| Environment | Trigger | Use Case |
|-------------|---------|----------|
| **Production** | Push to main branch | Live site |
| **Preview** | Push to any other branch | PR previews, staging |
| **Development** | `vercel dev` | Local development |

---

## Adding Environment Variables

### Via Dashboard

1. Project Settings → Environment Variables
2. Add key and value
3. Select target environments (Production, Preview, Development)
4. Click Save

### Via CLI

```bash
# Add to specific environment
vercel env add DATABASE_URL production

# Add to multiple environments
vercel env add API_KEY production preview

# Add to all environments
vercel env add DEBUG production preview development
```

### Via vercel.json (Not Recommended)

```json
// vercel.json - DON'T store secrets here!
{
  "env": {
    "MY_PUBLIC_VAR": "value"  // Only for non-sensitive values
  }
}
```

---

## Variable Types

### Plain Text

Standard variables, visible in logs and dashboard.

```bash
NODE_ENV=production
API_URL=https://api.example.com
```

### Encrypted (Sensitive)

Encrypted at rest, hidden in logs and dashboard.

```bash
DATABASE_URL=postgresql://user:pass@host/db
API_SECRET=sk_live_xxxxx
```

Mark as sensitive in dashboard or CLI:

```bash
vercel env add SECRET_KEY production --sensitive
```

### System Variables

Auto-injected by Vercel:

| Variable | Description |
|----------|-------------|
| `VERCEL` | Always "1" on Vercel |
| `VERCEL_ENV` | "production", "preview", or "development" |
| `VERCEL_URL` | Deployment URL (without https://) |
| `VERCEL_BRANCH_URL` | Branch-specific URL |
| `VERCEL_GIT_COMMIT_SHA` | Git commit hash |
| `VERCEL_GIT_COMMIT_MESSAGE` | Git commit message |
| `VERCEL_GIT_REPO_SLUG` | Repository name |

---

## Framework-Specific Prefixes

### Next.js

```bash
# Server-side only (secure)
DATABASE_URL=...
API_SECRET=...

# Client-side exposed (use NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_GA_ID=G-XXXXXX
```

### React (CRA)

```bash
# Must use REACT_APP_ prefix
REACT_APP_API_URL=https://api.example.com
```

### Vite

```bash
# Must use VITE_ prefix
VITE_API_URL=https://api.example.com
```

### Vue

```bash
# Must use VUE_APP_ prefix (Vue CLI)
VUE_APP_API_URL=https://api.example.com

# Or VITE_ for Vite-based Vue
VITE_API_URL=https://api.example.com
```

---

## Accessing Variables

### Node.js / JavaScript

```javascript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const dbUrl = process.env.DATABASE_URL;
```

### Python

```python
import os

database_url = os.environ.get("DATABASE_URL")
secret_key = os.environ["SECRET_KEY"]  # Raises if missing
```

### With Validation (Python)

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    debug: bool = False

settings = Settings()  # Raises ValidationError if missing
```

---

## Per-Environment Configuration

### Different Values per Environment

| Variable | Production | Preview | Development |
|----------|------------|---------|-------------|
| `DATABASE_URL` | prod-db-url | staging-db-url | localhost |
| `API_URL` | https://api.example.com | https://staging-api.example.com | http://localhost:8000 |
| `DEBUG` | false | true | true |

### Using VERCEL_ENV

```javascript
const config = {
  production: {
    apiUrl: 'https://api.example.com',
    debug: false,
  },
  preview: {
    apiUrl: 'https://staging-api.example.com',
    debug: true,
  },
  development: {
    apiUrl: 'http://localhost:8000',
    debug: true,
  },
}[process.env.VERCEL_ENV || 'development'];
```

---

## Local Development

### Pull Environment Variables

```bash
# Pull to .env.local
vercel env pull

# Pull specific environment
vercel env pull .env.production --environment=production
```

### .env Files

```bash
.env                 # Default, lowest priority
.env.local           # Local overrides, gitignored
.env.development     # Development only
.env.production      # Production only
```

**Priority** (highest to lowest):
1. Shell environment
2. `.env.local`
3. `.env.[environment]`
4. `.env`

---

## Shared Environment Variables

### Team-Level Variables (Pro/Enterprise)

1. Team Settings → Environment Variables
2. Add variable
3. Link to projects

### Cross-Project References

For projects that reference each other:

```bash
# Frontend project
NEXT_PUBLIC_API_URL=https://myapp-api.vercel.app/api/v1

# Backend project
FRONTEND_URL=https://myapp-web.vercel.app
ALLOWED_ORIGINS=https://myapp-web.vercel.app,https://preview-myapp-web.vercel.app
```

---

## CI/CD with Environment Variables

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
    steps:
      - uses: actions/checkout@v4
      - run: npm i -g vercel
      - run: vercel pull --yes --environment=production
      - run: vercel build --prod
      - run: vercel deploy --prebuilt --prod
```

### Using vercel CLI with Token

```bash
VERCEL_TOKEN=xxx vercel --prod
```

---

## Security Best Practices

### DO

```bash
# Use encrypted/sensitive for secrets
vercel env add API_SECRET production --sensitive

# Use specific environments
vercel env add DEBUG development  # Only in development

# Rotate secrets regularly
vercel env rm OLD_SECRET production
vercel env add NEW_SECRET production
```

### DON'T

```bash
# Don't commit secrets
echo "API_SECRET=xxx" >> .env  # Never commit this!

# Don't expose secrets to client
NEXT_PUBLIC_DATABASE_URL=xxx  # WRONG! Client-side exposed

# Don't hardcode in vercel.json
{
  "env": {
    "API_SECRET": "xxx"  # WRONG! Committed to Git
  }
}
```

---

## Edge Cases

### Edge Case 1: Variable Not Available at Build Time

**Problem**: `process.env.MY_VAR` is undefined during build

**Cause**: Build-time vs runtime distinction

**Solution**: Ensure variable is set before build:

```bash
vercel env add MY_VAR production
vercel --prod  # Redeploy
```

### Edge Case 2: Variable Works Locally, Not in Production

**Problem**: Works with `vercel dev`, fails in production

**Cause**: Not added to production environment

**Solution**: Check environment targets:

```bash
vercel env ls
# Verify MY_VAR has "Production" checked
```

### Edge Case 3: Client Can't Access Variable

**Problem**: `undefined` in browser console

**Cause**: Missing public prefix

**Solution**: Use framework-specific prefix:

```bash
# Next.js
NEXT_PUBLIC_API_URL=...

# React CRA
REACT_APP_API_URL=...

# Vite
VITE_API_URL=...
```

### Edge Case 4: Preview Deployments Using Production Database

**Problem**: Preview deploys connect to production database

**Solution**: Use different DATABASE_URL per environment:

```bash
# Production
DATABASE_URL=postgresql://prod-host/prod-db

# Preview
DATABASE_URL=postgresql://staging-host/staging-db
```

### Edge Case 5: Variables Changed but Not Applied

**Problem**: Changed variable, but deployment uses old value

**Cause**: Need to redeploy

**Solution**:

```bash
vercel --prod  # Trigger new deployment
```

### Edge Case 6: Large Environment Variable

**Problem**: Variable exceeds size limit

**Limit**: 64KB per variable, 64KB total per project

**Solution**: Use external secrets manager (AWS Secrets Manager, HashiCorp Vault)

---

## Debugging

### List All Variables

```bash
vercel env ls
```

### Check Variable Value

```bash
vercel env pull
cat .env.local | grep MY_VAR
```

### Verify in Deployment

Add a debug endpoint (remove in production):

```javascript
// pages/api/debug.js - REMOVE AFTER DEBUGGING
export default function handler(req, res) {
  res.json({
    hasDbUrl: !!process.env.DATABASE_URL,
    env: process.env.VERCEL_ENV,
  });
}
```

---

## Complete Example

### Frontend Environment Variables

```bash
# Production
NEXT_PUBLIC_API_URL=https://api.myapp.com/v1
NEXT_PUBLIC_GA_ID=G-XXXXXX
DATABASE_URL=postgresql://prod-user:pass@prod-host/db
BETTER_AUTH_SECRET=super-secret-32-chars-minimum
BETTER_AUTH_URL=https://myapp.com

# Preview
NEXT_PUBLIC_API_URL=https://staging-api.myapp.com/v1
DATABASE_URL=postgresql://staging-user:pass@staging-host/db
BETTER_AUTH_URL=https://staging.myapp.com

# Development
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
DATABASE_URL=postgresql://dev:dev@localhost/dev_db
BETTER_AUTH_URL=http://localhost:3000
```

### Backend Environment Variables

```bash
# Production
DATABASE_URL=postgresql://prod-user:pass@prod-host/db
BETTER_AUTH_SECRET=super-secret-32-chars-minimum
FRONTEND_URL=https://myapp.com
ENVIRONMENT=production
DEBUG=false

# Preview
DATABASE_URL=postgresql://staging-user:pass@staging-host/db
FRONTEND_URL=https://staging.myapp.com
ENVIRONMENT=preview
DEBUG=true

# Development
DATABASE_URL=postgresql://dev:dev@localhost/dev_db
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development
DEBUG=true
```
