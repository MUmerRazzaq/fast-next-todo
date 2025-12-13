# Session Management with SQLAlchemy

Proper session management is critical for database-driven applications. The main principle is to ensure that a database session is created when needed, used for a unit of work, and then promptly closed.

## 1. Centralized Engine and Session Factory

Your application should have a single `Engine` and a single `sessionmaker` factory. These are typically created in a central location, like a `database.py` file.

```python
# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://user:password@host/dbname"

# The Engine is the starting point for any SQLAlchemy application.
# It's a global object that's created once per application process.
engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# The sessionmaker is a factory for creating new Session objects.
# It provides a standard configuration for all sessions.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

## 2. Session-per-Request Pattern

In a web application, the best practice is the "session-per-request" pattern. A new `Session` is created for each incoming request, used for all database operations within that request, and then closed when the request is finished.

This is most cleanly implemented using a dependency injection system. Here is an example for FastAPI:

```python
# main.py (or a dependency file)
from typing import Generator
from .database import SessionLocal

def get_db() -> Generator:
    """
    This is a dependency that provides a database session for a request.
    It creates a new session for each request and closes it when the request is done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# In your FastAPI route:
# from fastapi import Depends
# from sqlalchemy.orm import Session

# @app.get("/items/")
# def read_items(db: Session = Depends(get_db)):
#     # The 'db' parameter is a SQLAlchemy Session object.
#     items = db.query(Item).all()
#     return items
```

### Why this pattern is effective:

- **Scoped Lifetime**: The session's scope is tied to a single request, preventing session objects from being shared across different requests, which would be a major source of bugs.
- **Connection Management**: Closing the session at the end of the request returns the database connection to the engine's connection pool, making it available for other requests.
- **Error Handling**: The `try...finally` block ensures the session is closed even if an error occurs during the request.

## 3. Decouple Sessions from Business Logic

Your business logic (e.g., in service or repository layers) should not be responsible for creating or closing sessions. It should receive an active session as an argument. This makes your code:

- **More Testable**: You can easily pass a mock or in-memory database session during testing.
- **More Reusable**: The same business logic can be used in different contexts (e.g., a web request or a background job) by just passing a session.

**Good Example (Session is passed in):**
```python
# crud.py
from sqlalchemy.orm import Session
from . import models, schemas

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()
```

**Bad Example (Function creates its own session):**
```python
# (Don't do this)
def get_user(user_id: int):
    db = SessionLocal() # Problem: who closes this?
    user = db.query(models.User).filter(models.User.id == user_id).first()
    db.close() # Now this function is hard to test and not reusable.
    return user
```
