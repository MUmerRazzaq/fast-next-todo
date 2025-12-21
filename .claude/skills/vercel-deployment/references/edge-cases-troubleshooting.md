# Edge Cases & Troubleshooting

## Overview

This comprehensive guide covers all common Vercel deployment issues, edge cases, and their solutions.

---

## Build Errors

### Error: "No Output Directory Detected"

**Symptom**:
```
Error: No Output Directory named "public" found after the Build completed.
```

**Causes & Solutions**:

| Cause | Solution |
|-------|----------|
| Wrong output directory | Set correct `outputDirectory` in vercel.json |
| Build failed silently | Check build logs for errors |
| Framework not detected | Set `framework` in vercel.json |

```json
// vercel.json
{
  "outputDirectory": "dist",  // or "build", ".next", "out"
  "buildCommand": "npm run build"
}
```

### Error: "Build Failed"

**Symptom**:
```
Error: Command "npm run build" exited with 1
```

**Debug Steps**:

1. **Check build logs** in Vercel dashboard
2. **Run locally**: `npm run build`
3. **Check Node version**:
   ```json
   // package.json
   { "engines": { "node": "20.x" } }
   ```
4. **Check dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

### Error: "Module Not Found"

**Symptom**:
```
Error: Cannot find module 'some-package'
```

**Solutions**:

```bash
# 1. Check if it's in dependencies (not devDependencies for runtime)
npm install some-package --save

# 2. For monorepos, check workspace resolution
npm install

# 3. Clear Vercel cache
vercel --force
```

### Error: "Out of Memory"

**Symptom**:
```
FATAL ERROR: Reached heap limit Allocation failed
```

**Solutions**:

```json
// vercel.json
{
  "functions": {
    "api/**/*.js": {
      "memory": 3008  // Max 3008MB
    }
  }
}
```

Or set Node options:
```json
// package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

---

## Runtime Errors

### Error: 500 Internal Server Error

**Debug Steps**:

1. **Check function logs**:
   ```bash
   vercel logs https://your-deployment.vercel.app
   ```

2. **Check environment variables**:
   ```bash
   vercel env ls
   ```

3. **Add error handling**:
   ```javascript
   export default async function handler(req, res) {
     try {
       // Your code
     } catch (error) {
       console.error('Error:', error);
       res.status(500).json({ error: error.message });
     }
   }
   ```

### Error: 504 Gateway Timeout

**Symptom**: Function execution exceeded time limit

**Solutions**:

```json
// vercel.json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 60  // Max 60s on Pro, 10s on Hobby
    }
  }
}
```

**Optimize**:
- Break into smaller functions
- Use background jobs for heavy tasks
- Add caching

### Error: Function Size Too Large

**Symptom**:
```
Error: The Serverless Function is too large
```

**Limit**: 50MB (compressed)

**Solutions**:

```json
// vercel.json
{
  "functions": {
    "api/**/*.py": {
      "excludeFiles": "{.venv/**,tests/**,**/*.test.py,docs/**}"
    }
  }
}
```

```
// .vercelignore
node_modules
.git
tests
docs
*.md
```

---

## Python-Specific Errors

### Error: "ModuleNotFoundError"

**Symptom**:
```
ModuleNotFoundError: No module named 'app'
```

**Solution**:

```python
# api/index.py
import sys
from pathlib import Path

# Add project root to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app
```

### Error: "No module named 'pkg_resources'"

**Symptom**: setuptools issue

**Solution**:

```txt
# requirements.txt
setuptools>=65.0.0
```

### Error: Python Version Mismatch

**Symptom**:
```
Python 3.9 is not supported
```

**Solution**:

```toml
# pyproject.toml
[project]
requires-python = ">=3.11"
```

---

## CORS Errors

### Error: "Access-Control-Allow-Origin"

**Symptom**:
```
Access to fetch has been blocked by CORS policy
```

**Solutions**:

**Next.js API Routes**:
```javascript
// pages/api/endpoint.js
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Handle request
}
```

**FastAPI**:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**vercel.json**:
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,OPTIONS" }
      ]
    }
  ]
}
```

---

## Routing Errors

### Error: 404 on Refresh (SPA)

**Symptom**: Direct URL access returns 404

**Cause**: SPA routing not configured

**Solution**:

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Error: API Route Returns 404

**Symptom**: `/api/users` returns 404

**Check**:
1. File exists at `api/users.js` or `pages/api/users.js`
2. Export default function
3. Correct file extension

```javascript
// api/users.js
export default function handler(req, res) {
  res.json({ users: [] });
}
```

### Error: Dynamic Route Not Working

**Symptom**: `/api/users/123` returns 404

**Solution**: Use bracket notation

```
api/
└── users/
    └── [id].js    # Matches /api/users/:id
```

```javascript
// api/users/[id].js
export default function handler(req, res) {
  const { id } = req.query;
  res.json({ userId: id });
}
```

---

## Domain & SSL Errors

### Error: "DNS Configuration Required"

**Solution**:

1. Add A record: `76.76.21.21`
2. Add CNAME for www: `cname.vercel-dns.com`
3. Wait for propagation (up to 48h)

### Error: SSL Certificate Error

**Symptom**: "Your connection is not private"

**Solutions**:
1. Wait for automatic provisioning (up to 24h)
2. Check DNS is correctly configured
3. Remove conflicting CAA records

---

## Monorepo Errors

### Error: Wrong Project Deployed

**Symptom**: Backend deploys when frontend changes

**Solution**: Configure Ignored Build Step

```bash
# apps/web/.vercel/ignore-build.sh
#!/bin/bash
git diff --quiet HEAD^ HEAD -- apps/web/
```

Or use Turborepo:
```json
// vercel.json
{
  "ignoreCommand": "npx turbo-ignore"
}
```

### Error: Import from Parent Directory Fails

**Symptom**:
```
Cannot find module '../../packages/shared'
```

**Solution**:

```json
// vercel.json
{
  "sourceFilesOutsideRootDirectory": true
}
```

---

## Environment Variable Errors

### Error: Variable Undefined

**Symptom**: `process.env.MY_VAR` is undefined

**Checklist**:

1. Variable exists: `vercel env ls`
2. Correct environment (Production/Preview/Development)
3. Redeployed after adding variable
4. Using correct prefix (NEXT_PUBLIC_, REACT_APP_, etc.)

### Error: Variable Not Available at Runtime

**Symptom**: Build works, runtime fails

**Cause**: Variable only available at build time

**Solution**: Ensure variable is set for all environments

---

## Performance Issues

### Issue: Slow Cold Starts

**Solutions**:

1. **Reduce bundle size**:
   ```json
   {
     "functions": {
       "api/**/*.js": {
         "excludeFiles": "node_modules/@types/**"
       }
     }
   }
   ```

2. **Use Edge Runtime**:
   ```javascript
   export const config = {
     runtime: 'edge',
   };
   ```

3. **Lazy imports**:
   ```python
   def handler():
       import pandas  # Import when needed
       return pandas.DataFrame()
   ```

### Issue: Function Execution Slow

**Solutions**:

1. Add caching:
   ```javascript
   res.setHeader('Cache-Control', 's-maxage=60');
   ```

2. Use ISR for Next.js:
   ```javascript
   export async function getStaticProps() {
     return { props: {}, revalidate: 60 };
   }
   ```

3. Optimize database queries
4. Use connection pooling

---

## Debugging Commands

```bash
# View deployment logs
vercel logs https://your-app.vercel.app

# View recent logs
vercel logs --follow

# List deployments
vercel ls

# Inspect deployment
vercel inspect <deployment-url>

# Check project config
vercel project ls

# Verify env vars
vercel env ls

# Pull env vars locally
vercel env pull

# Force redeploy (clear cache)
vercel --force

# Debug mode
vercel --debug
```

---

## Quick Reference: Error → Solution

| Error | Quick Fix |
|-------|-----------|
| No output directory | Set `outputDirectory` in vercel.json |
| Module not found | Check dependencies, run `npm install` |
| 500 error | Check logs, verify env vars |
| 504 timeout | Increase `maxDuration`, optimize code |
| CORS error | Add CORS headers/middleware |
| 404 on refresh | Add SPA rewrite rule |
| Build failed | Check Node version, run build locally |
| Python import error | Add sys.path configuration |
| Wrong project deploys | Use ignored build step |
| Env var undefined | Verify environment target, redeploy |

---

## Getting Help

1. **Vercel Status**: https://www.vercel-status.com/
2. **Documentation**: https://vercel.com/docs
3. **Support**: https://vercel.com/support
4. **Community**: https://github.com/vercel/vercel/discussions
