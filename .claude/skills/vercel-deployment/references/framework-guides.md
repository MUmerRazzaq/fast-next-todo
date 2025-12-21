# Framework-Specific Deployment Guides

## Overview

Vercel auto-detects most frameworks. This guide covers configuration for each supported framework.

---

## Next.js

### Auto-Detection

Vercel automatically detects Next.js projects and optimizes for:
- App Router and Pages Router
- API Routes (serverless)
- Static Generation (SSG)
- Server-Side Rendering (SSR)
- Incremental Static Regeneration (ISR)
- Edge Runtime

### Zero-Config Deployment

```
nextjs-app/
├── app/                 # App Router
│   ├── page.tsx
│   └── layout.tsx
├── public/
├── package.json
└── next.config.js
```

No `vercel.json` needed.

### Custom Configuration

```json
// vercel.json (optional)
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1"]
}
```

### next.config.js for Vercel

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // DO NOT use output: "standalone" for Vercel
  // "standalone" is for Docker/self-hosting only

  images: {
    remotePatterns: [
      { hostname: "example.com" }
    ]
  }
};

module.exports = nextConfig;
```

### Edge Case: Standalone Output

**Problem**: `output: "standalone"` breaks Vercel deployment

```javascript
// WRONG for Vercel
module.exports = {
  output: "standalone"  // Docker only!
};

// CORRECT for Vercel
module.exports = {
  // No output property, or explicitly omit it
};
```

### Edge Case: Large Pages

If you have pages that take >10s to build:

```json
// vercel.json
{
  "functions": {
    "app/heavy-page/page.tsx": {
      "maxDuration": 60
    }
  }
}
```

---

## React (Vite)

### Configuration

```json
// vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
});
```

### Edge Case: SPA Routing

For client-side routing (React Router), add rewrites:

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## React (Create React App)

### Configuration

```json
// vercel.json
{
  "framework": "create-react-app",
  "buildCommand": "npm run build",
  "outputDirectory": "build"
}
```

### Edge Case: Environment Variables

CRA requires `REACT_APP_` prefix:

```bash
# Vercel env vars
REACT_APP_API_URL=https://api.example.com
```

---

## Vue.js / Nuxt

### Vue 3 (Vite)

```json
// vercel.json
{
  "framework": "vue",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Nuxt 3

Zero-config. Vercel auto-detects Nuxt and enables:
- SSR
- API routes
- Nitro server

```json
// vercel.json (optional)
{
  "framework": "nuxt"
}
```

---

## SvelteKit

### Zero-Config

SvelteKit works out of the box with Vercel adapter.

```bash
npm install @sveltejs/adapter-vercel
```

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter()
  }
};
```

### Edge Case: Edge Functions

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: adapter({
      runtime: 'edge'
    })
  }
};
```

---

## Astro

### Configuration

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server',
  adapter: vercel()
});
```

### Static Astro

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static'
});
```

No vercel.json needed for static Astro.

---

## Angular

### Configuration

```json
// vercel.json
{
  "framework": "angular",
  "buildCommand": "ng build",
  "outputDirectory": "dist/your-project-name"
}
```

### Edge Case: Output Path

Angular outputs to `dist/project-name/`. You must specify the full path.

---

## Remix

### Configuration

```bash
npm install @vercel/remix
```

```javascript
// remix.config.js
module.exports = {
  serverBuildTarget: "vercel"
};
```

---

## Static HTML

### Zero-Config

```
static-site/
├── index.html
├── about.html
└── css/
    └── styles.css
```

Just push to Git. Vercel serves static files automatically.

### Custom 404

Create `404.html` in the root:

```html
<!-- 404.html -->
<!DOCTYPE html>
<html>
<head><title>Not Found</title></head>
<body>
  <h1>404 - Page Not Found</h1>
</body>
</html>
```

---

## Framework Detection Order

Vercel detects frameworks in this order:

1. `vercel.json` → `framework` property
2. `package.json` → dependencies
3. Configuration files (next.config.js, nuxt.config.ts, etc.)
4. File structure

### Override Detection

```json
// vercel.json
{
  "framework": null  // Disable auto-detection
}
```

---

## Common Framework Issues

### Issue: Wrong Framework Detected

**Symptom**: Vercel builds with wrong framework
**Solution**: Explicitly set framework in vercel.json

```json
{
  "framework": "nextjs"
}
```

### Issue: Build Command Not Found

**Symptom**: `npm run build` fails
**Solution**: Check package.json has build script

```json
// package.json
{
  "scripts": {
    "build": "next build"
  }
}
```

### Issue: Output Directory Empty

**Symptom**: "No output directory detected"
**Solution**: Verify outputDirectory matches actual build output

```json
{
  "outputDirectory": "dist"  // or "build", ".next", etc.
}
```

### Issue: Node.js Version

**Symptom**: Build fails due to Node.js version
**Solution**: Set Node.js version in package.json

```json
// package.json
{
  "engines": {
    "node": "20.x"
  }
}
```

Or in Vercel dashboard: Project Settings → General → Node.js Version
