# Example: Standalone Python API

## Project Structure

```
python-api/
├── api/
│   └── index.py
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── users.py
│   │   └── health.py
│   └── models/
│       └── user.py
├── requirements.txt
├── pyproject.toml
└── vercel.json
```

## Files

### app/main.py

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import health, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    print(f"Starting {settings.app_name}")
    yield
    print("Shutting down")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs" if settings.debug else None,
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, tags=["Health"])
app.include_router(users.router, prefix="/api/v1", tags=["Users"])


@app.get("/")
def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
    }
```

### app/config.py

```python
import os
from functools import lru_cache


class Settings:
    app_name: str = "Python API"
    app_version: str = "1.0.0"
    debug: bool = os.environ.get("DEBUG", "false").lower() == "true"
    database_url: str = os.environ.get("DATABASE_URL", "")
    allowed_origins: list[str] = os.environ.get(
        "ALLOWED_ORIGINS", "http://localhost:3000"
    ).split(",")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
```

### app/routers/health.py

```python
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "healthy"}


@router.get("/ready")
def readiness_check():
    # Add database connectivity check here
    return {"status": "ready"}
```

### app/routers/users.py

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class User(BaseModel):
    id: int
    name: str
    email: str


class CreateUser(BaseModel):
    name: str
    email: str


# In-memory storage for demo
users_db: dict[int, User] = {}
next_id = 1


@router.get("/users")
def list_users() -> list[User]:
    return list(users_db.values())


@router.get("/users/{user_id}")
def get_user(user_id: int) -> User:
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    return users_db[user_id]


@router.post("/users", status_code=201)
def create_user(user: CreateUser) -> User:
    global next_id
    new_user = User(id=next_id, **user.model_dump())
    users_db[next_id] = new_user
    next_id += 1
    return new_user


@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    del users_db[user_id]
```

### api/index.py

```python
"""Vercel serverless entrypoint."""
import sys
from pathlib import Path

# Add project root to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app

# Vercel's native FastAPI support means we just need to expose the 'app' object.
# Mangum is no longer required for basic deployments and can cause issues if present.
```

### requirements.txt

```
fastapi>=0.115.0
pydantic>=2.0.0
```

### pyproject.toml

```toml
[project]
name = "python-api"
version = "1.0.0"
requires-python = ">=3.11"
dependencies = [
    "fastapi>=0.115.0",
    "pydantic>=2.0.0",
]
```

### vercel.json

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
    {
      "source": "/(.*)",
      "destination": "/api/index.py"
    }
  ]
}
```

## Deployment

```bash
# Deploy
vercel --prod

# Add environment variables
vercel env add DATABASE_URL production
vercel env add ALLOWED_ORIGINS production
# Value: https://your-frontend.vercel.app

# Redeploy with env vars
vercel --prod
```

## Testing

### Local Development

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt
pip install uvicorn

# Run locally
uvicorn app.main:app --reload
```

### API Endpoints

```bash
# Health check
curl http://localhost:8000/health

# List users
curl http://localhost:8000/api/v1/users

# Create user
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'

# Get user
curl http://localhost:8000/api/v1/users/1

# Delete user
curl -X DELETE http://localhost:8000/api/v1/users/1
```

## Edge Cases

### Edge Case 1: Pydantic V1 vs V2

**Problem**: `model_dump()` doesn't exist

**Cause**: Using Pydantic V1 syntax

**Solution**: Update to V2:
```python
# V1 (old)
user.dict()

# V2 (new)
user.model_dump()
```

### Edge Case 2: Database Connection Pooling

**Problem**: Too many database connections

**Solution**: Use NullPool for serverless:

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool

engine = create_engine(DATABASE_URL, poolclass=NullPool)
```

### Edge Case 3: Cold Start Slow

**Problem**: First request takes 5+ seconds

**Solutions**:
1. Reduce dependencies
2. Use lazy imports
3. Keep function warm with cron

```python
# Lazy import example
def get_pandas():
    import pandas
    return pandas
```

### Edge Case 4: Request Body Too Large

**Problem**: 413 Payload Too Large

**Solution**: Vercel limit is 4.5MB. For larger files:
- Use presigned URLs
- Stream uploads to external storage

### Edge Case 5: Background Tasks Not Completing

**Problem**: Background task doesn't finish

**Cause**: Function terminates after response

**Solution**: Use external queue or make task synchronous:

```python
# WRONG - task may not complete
@app.post("/process")
async def process(background_tasks: BackgroundTasks):
    background_tasks.add_task(heavy_task)
    return {"status": "processing"}

# RIGHT - task completes before response
@app.post("/process")
async def process():
    await heavy_task()
    return {"status": "done"}
```

## Production Checklist

- [ ] Set `DEBUG=false` in production
- [ ] Configure proper CORS origins
- [ ] Add rate limiting
- [ ] Set up monitoring/logging
- [ ] Configure database connection pooling
- [ ] Remove `/docs` endpoint in production
- [ ] Add health check endpoint
- [ ] Set appropriate `maxDuration`
