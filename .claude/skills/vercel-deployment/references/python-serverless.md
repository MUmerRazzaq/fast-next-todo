# Python Serverless Functions on Vercel

## Overview

Vercel supports Python serverless functions with native FastAPI, Flask, and Django support.

---

## Supported Python Versions

| Version | Status | Notes |
|---------|--------|-------|
| Python 3.12 | Supported | Recommended |
| Python 3.11 | Supported | Stable |
| Python 3.10 | Supported | Legacy |
| Python 3.9 | Deprecated | Avoid |

Set version in `pyproject.toml`:

```toml
[project]
requires-python = ">=3.12"
```

---

## Project Structure

### Standard Structure (Recommended)

```
backend/
├── api/
│   └── index.py          # Main entrypoint
├── app/                   # Application code
│   ├── __init__.py
│   ├── main.py           # FastAPI app
│   ├── routers/
│   └── models/
├── requirements.txt       # Dependencies
├── pyproject.toml        # Project metadata
└── vercel.json           # Vercel config
```

### Minimal Structure

```
project/
├── api/
│   └── index.py          # FastAPI app directly here
└── requirements.txt
```

---

## FastAPI Deployment

### Step 1: Create the FastAPI App

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="My API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Hello from FastAPI on Vercel"}

@app.get("/api/v1/health")
def health():
    return {"status": "healthy"}
```

### Step 2: Create the Vercel Entrypoint

```python
# api/index.py
from mangum import Mangum
from app.main import app

# Mangum wraps ASGI apps for AWS Lambda/Vercel
handler = Mangum(app, lifespan="off")
```

### Step 3: Configure vercel.json

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

### Step 4: Dependencies

```txt
# requirements.txt
fastapi>=0.115.0
mangum>=0.19.0
uvicorn>=0.30.0
```

---

## Flask Deployment

### Flask App

```python
# api/index.py
from flask import Flask

app = Flask(__name__)

@app.route("/")
def home():
    return {"message": "Hello from Flask"}

@app.route("/api/hello")
def hello():
    return {"hello": "world"}
```

### vercel.json for Flask

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/api/index.py" }
  ]
}
```

---

## Django Deployment

### Project Structure

```
django-project/
├── api/
│   └── index.py          # WSGI handler
├── myproject/
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── myapp/
├── requirements.txt
└── vercel.json
```

### Vercel Handler

```python
# api/index.py
from myproject.wsgi import application

app = application
```

### vercel.json for Django

```json
{
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/api/index.py" }
  ]
}
```

---

## Environment Variables

### Accessing in Python

```python
import os

DATABASE_URL = os.environ.get("DATABASE_URL")
SECRET_KEY = os.environ.get("SECRET_KEY")
DEBUG = os.environ.get("DEBUG", "false").lower() == "true"
```

### With Pydantic Settings

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    secret_key: str
    debug: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## Database Connections

### Connection Pooling (Critical for Serverless)

Serverless functions start fresh on each invocation. Use connection pooling:

```python
# For Neon PostgreSQL
DATABASE_URL = "postgresql://user:pass@host/db?sslmode=require"

# Use the POOLED connection string (with -pooler suffix)
DATABASE_URL = "postgresql://user:pass@ep-xxx-pooler.region.neon.tech/db"
```

### SQLAlchemy with Connection Pooling

```python
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool

# NullPool is recommended for serverless
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,  # Don't pool connections in serverless
)
```

---

## Edge Cases & Troubleshooting

### Edge Case 1: Import Errors

**Problem**: `ModuleNotFoundError: No module named 'app'`

**Cause**: Python path not set correctly

**Solution**: Ensure your project structure allows imports:

```python
# api/index.py
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.main import app
```

### Edge Case 2: Large Dependencies

**Problem**: Deployment fails due to package size

**Solution**: Exclude unnecessary files:

```json
// vercel.json
{
  "functions": {
    "api/**/*.py": {
      "excludeFiles": "{tests/**,**/*.test.py,docs/**,.venv/**}"
    }
  }
}
```

### Edge Case 3: Cold Start Timeout

**Problem**: First request times out

**Solution**: Increase maxDuration and optimize imports:

```json
{
  "functions": {
    "api/**/*.py": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

```python
# Lazy imports for faster cold starts
def get_heavy_module():
    import pandas  # Import only when needed
    return pandas
```

### Edge Case 4: File System Access

**Problem**: Can't write to file system

**Cause**: Vercel functions are read-only

**Solution**: Use `/tmp` directory (limited to 512MB):

```python
import tempfile
import os

# Write to /tmp
temp_path = os.path.join(tempfile.gettempdir(), "myfile.txt")
with open(temp_path, "w") as f:
    f.write("data")
```

### Edge Case 5: Background Tasks

**Problem**: Background tasks don't complete

**Cause**: Function terminates after response

**Solution**: Use Vercel's waitUntil (experimental) or external queue:

```python
# Option 1: Sync processing (blocks response)
@app.post("/process")
def process():
    do_heavy_work()  # Blocks until complete
    return {"status": "done"}

# Option 2: External queue (recommended)
@app.post("/process")
def process():
    queue.send_message({"task": "heavy_work"})  # Non-blocking
    return {"status": "queued"}
```

### Edge Case 6: CORS Issues

**Problem**: CORS errors in browser

**Solution**: Configure CORS properly:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Edge Case 7: WebSocket Not Supported

**Problem**: WebSocket connections fail

**Cause**: Vercel serverless doesn't support WebSockets

**Solution**: Use alternative approaches:
- Server-Sent Events (SSE)
- Polling
- External WebSocket service (Pusher, Ably)

### Edge Case 8: Lifespan Events Not Working

**Problem**: FastAPI lifespan startup/shutdown not called

**Cause**: Mangum needs lifespan disabled for Vercel

**Solution**:

```python
# api/index.py
from mangum import Mangum
from app.main import app

handler = Mangum(app, lifespan="off")  # Disable lifespan
```

---

## Performance Optimization

### 1. Minimize Dependencies

```txt
# requirements.txt - Only include what you need
fastapi>=0.115.0
mangum>=0.19.0
# Don't include: uvicorn (not needed on Vercel)
```

### 2. Use Lazy Loading

```python
# Don't import heavy modules at top level
# BAD
import pandas as pd
import numpy as np

# GOOD
def process_data():
    import pandas as pd  # Import when needed
    return pd.DataFrame()
```

### 3. Set Appropriate Memory

```json
{
  "functions": {
    "api/**/*.py": {
      "memory": 1024  // 1GB, increase for heavy processing
    }
  }
}
```

### 4. Use Caching

```python
from functools import lru_cache

@lru_cache(maxsize=100)
def expensive_computation(x):
    return x ** 2
```

---

## Complete Example: FastAPI + Neon PostgreSQL

```python
# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from sqlmodel import Session, create_engine, SQLModel
import os

DATABASE_URL = os.environ["DATABASE_URL"]
engine = create_engine(DATABASE_URL)

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(lifespan=lifespan)

def get_session():
    with Session(engine) as session:
        yield session

@app.get("/users")
def get_users(session: Session = Depends(get_session)):
    return session.exec(select(User)).all()
```

```python
# api/index.py
from mangum import Mangum
from app.main import app

handler = Mangum(app, lifespan="off")
```

```json
// vercel.json
{
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
