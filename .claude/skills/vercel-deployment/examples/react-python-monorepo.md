# Example: React + Python Monorepo

## Project Structure

```
monorepo/
├── frontend/                    # Vercel Project #1
│   ├── src/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
├── backend/                     # Vercel Project #2
│   ├── api/
│   │   └── index.py
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   └── routers/
│   ├── requirements.txt
│   └── vercel.json
└── README.md
```

## Frontend Setup

### frontend/package.json

```json
{
  "name": "frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^6.0.0"
  }
}
```

### frontend/vercel.json

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### frontend/src/App.tsx

```tsx
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [health, setHealth] = useState<string>('loading...');

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(res => res.json())
      .then(data => setHealth(data.status))
      .catch(() => setHealth('error'));
  }, []);

  return <div>API Status: {health}</div>;
}

export default App;
```

## Backend Setup

### backend/app/main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="My API")

# CORS configuration
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Hello from FastAPI"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/api/v1/users")
def get_users():
    return {"users": []}
```

### backend/api/index.py

```python
from mangum import Mangum
from app.main import app

handler = Mangum(app, lifespan="off")
```

### backend/requirements.txt

```
fastapi>=0.115.0
mangum>=0.19.0
```

### backend/vercel.json

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

## Deployment Steps

### Step 1: Deploy Backend

```bash
cd monorepo
vercel link  # Select or create backend project
# Set Root Directory: backend

# Add environment variables
vercel env add FRONTEND_URL production
# Value: https://your-frontend.vercel.app (update after frontend deploys)

vercel --prod
```

### Step 2: Deploy Frontend

```bash
vercel link  # Select or create frontend project
# Set Root Directory: frontend

# Add environment variables
vercel env add VITE_API_URL production
# Value: https://your-backend.vercel.app/api/v1

vercel --prod
```

### Step 3: Update Backend CORS

```bash
cd backend
vercel env rm FRONTEND_URL production
vercel env add FRONTEND_URL production
# Value: https://your-actual-frontend.vercel.app

vercel --prod
```

## Edge Cases

### Edge Case 1: CORS Error

**Problem**: "Access-Control-Allow-Origin" error

**Solution**: Verify FRONTEND_URL matches exactly:

```python
# Must match exactly, including https://
allow_origins=["https://your-frontend.vercel.app"]  # No trailing slash!
```

### Edge Case 2: Python Import Error

**Problem**: `ModuleNotFoundError: No module named 'app'`

**Solution**: Add sys.path:

```python
# api/index.py
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app
from mangum import Mangum

handler = Mangum(app, lifespan="off")
```

### Edge Case 3: Environment Variable Not Loading

**Problem**: `os.environ.get("FRONTEND_URL")` returns None

**Debug**:
```python
@app.get("/debug")
def debug():
    return {"frontend_url": os.environ.get("FRONTEND_URL", "NOT SET")}
```

**Solution**: Redeploy after adding env var

### Edge Case 4: Preview Deployments Breaking

**Problem**: Preview uses production API

**Solution**: Use VERCEL_ENV:

```python
import os

if os.environ.get("VERCEL_ENV") == "preview":
    frontend_url = "https://preview-frontend.vercel.app"
else:
    frontend_url = os.environ.get("FRONTEND_URL")
```

### Edge Case 5: Large Python Dependencies

**Problem**: Deployment exceeds 50MB limit

**Solution**: Exclude unnecessary files:

```json
{
  "functions": {
    "api/**/*.py": {
      "excludeFiles": "{.venv/**,tests/**,docs/**,*.md}"
    }
  }
}
```

## Testing Locally

```bash
# Terminal 1: Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```
