# Example: Next.js Full-Stack Application

## Project Structure

```
nextjs-app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── api/
│       └── users/
│           └── route.ts
├── public/
├── package.json
├── next.config.js
└── tsconfig.json
```

## Files

### package.json

```json
{
  "name": "nextjs-fullstack",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": "20.x"
  }
}
```

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // DO NOT add output: "standalone" for Vercel
  reactStrictMode: true,
};

module.exports = nextConfig;
```

### app/api/users/route.ts

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ users: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ user: body }, { status: 201 });
}
```

## Deployment

```bash
# No vercel.json needed - zero config!
vercel --prod
```

## Environment Variables

```bash
# Add via CLI
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_API_URL production
```

## Edge Cases

### Edge Case 1: API Route Timeout

**Problem**: API route takes too long

**Solution**: Add vercel.json

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

### Edge Case 2: Environment Variable Not Available

**Problem**: `process.env.MY_VAR` is undefined

**Cause**: Variable not set for production

**Solution**:
```bash
vercel env add MY_VAR production
vercel --prod  # Redeploy
```

### Edge Case 3: Middleware Not Working

**Problem**: middleware.ts not executing

**Solution**: Ensure middleware is at root level:

```
app/
middleware.ts  # Must be here, not inside app/
```

### Edge Case 4: Images Not Loading

**Problem**: next/image returns 400

**Solution**: Configure remote patterns:

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { hostname: 'example.com' }
    ]
  }
};
```
