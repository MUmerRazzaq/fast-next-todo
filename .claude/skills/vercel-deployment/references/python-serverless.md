# Python Serverless Functions on Vercel

## Overview

Vercel supports Python serverless functions with native FastAPI, Flask, and Django support. It's important to note that for FastAPI, Vercel now natively handles the ASGI application, eliminating the need for `Mangum` in most basic deployments.

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

### Step 2: Create the Vercel Entrypoint (No Mangum Required)

For basic FastAPI deployments, Vercel can directly use your `FastAPI` app instance.

```python
# api/index.py
from app.main import app
```
**Note:** If your `app/main.py` directly defines `app = FastAPI(...)`, you might not need an `api/index.py` at all for simple cases. Vercel can often auto-detect and run your app. If you do need an `api/index.py` for specific configurations or routing, simply exposing the `app` instance is sufficient.

Previously, `Mangum` was used to adapt ASGI applications like FastAPI for serverless environments. However, Vercel now provides native support for FastAPI, making `Mangum` unnecessary and potentially leading to deployment errors like `TypeError: issubclass() arg 1 must be a class` if still used. Remove `Mangum` from your dependencies (`requirements.txt`) if you encounter such errors.

The `handler` variable exported from `api/index.py` is typically used for older configurations or when explicit wrapping is needed. For modern FastAPI on Vercel, directly exposing the `app` object is the recommended approach.

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

### Edge Case 8: Lifespan Events Behavior

**Problem**: FastAPI lifespan startup/shutdown events might not behave as expected or `Mangum` might still be present causing issues.

**Cause**: When using `Mangum` (which is generally no longer needed for basic FastAPI deployments on Vercel due to native support), `lifespan="off"` was often used. If `Mangum` is still in your `api/index.py` or `main.py` and you're experiencing issues, it might conflict with Vercel's native handling.

**Solution**:
1.  **Remove `Mangum`**: For most cases, you can remove `Mangum` entirely from your project (from `requirements.txt` and your `api/index.py` or `main.py`). Vercel will handle the ASGI application directly.
2.  **Native FastAPI Lifespan**: With native Vercel support, FastAPI's `lifespan` context manager in `app.main:app` should work as designed. Ensure your `FastAPI` app is initialized with the `lifespan` argument:

    ```python
    # app/main.py
    from contextlib import asynccontextmanager
    from fastapi import FastAPI

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        # Perform startup logic
        yield
        # Perform shutdown logic

    app = FastAPI(lifespan=lifespan)
    ```

---

## Performance Optimization

### 1. Minimize Dependencies

```txt
# requirements.txt - Only include what you need
fastapi>=0.115.0
# Don't include: mangum (no longer needed for basic deployments)
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
from app.main import app
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
