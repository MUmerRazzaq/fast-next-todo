
# FastAPI JWT Integration Patterns

This document provides patterns for integrating the `jwt_auth.py` script into a FastAPI application.

## Table of Contents
1. [Setup and Dependencies](#1-setup-and-dependencies)
2. [Pydantic Models](#2-pydantic-models)
3. [Login Endpoint (`/token`)](#3-login-endpoint-token)
4. [Protected Endpoints](#4-protected-endpoints)
5. [Token Refresh Endpoint](#5-token-refresh-endpoint)
6. [Auth Middleware (Alternative)](#6-auth-middleware-alternative)

---

### 1. Setup and Dependencies

First, ensure you have the necessary libraries installed:

```bash
pip install "fastapi[all]" "python-jose[cryptography]" "passlib[bcrypt]"
```

The `jwt_auth.py` script reads the `SECRET_KEY` from an environment variable. Before running your app, set it:

```bash
export SECRET_KEY="your-super-secret-key"
```

### 2. Pydantic Models

Define Pydantic models to handle user data and tokens. This ensures type safety and provides automatic validation and documentation.

```python
from pydantic import BaseModel, EmailStr
from typing import List, Optional

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[EmailStr] = None
    roles: List[str] = []

class User(BaseModel):
    email: EmailStr
    roles: List[str] = ["user"]

class UserInDB(User):
    hashed_password: str
```

### 3. Login Endpoint (`/token`)

The login endpoint is responsible for authenticating the user and issuing JWT tokens. It typically uses an `OAuth2PasswordRequestForm`.

```python
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from scripts.jwt_auth import (
    create_access_token,
    create_refresh_token,
    verify_password,
)
# Assume 'fake_users_db' is a dictionary for this example.
# In a real app, you would query your database.
from .fake_db import fake_users_db

app = FastAPI()

def get_user(db, email: str):
    if email in db:
        user_dict = db[email]
        return UserInDB(**user_dict)

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = get_user(fake_users_db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_data = {"sub": user.email, "roles": user.roles}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
```

### 4. Protected Endpoints

Protect endpoints by adding a dependency on `get_current_user` from `jwt_auth.py`. This ensures that only requests with a valid access token can reach the endpoint.

```python
from scripts.jwt_auth import get_current_user

# Assuming 'app' is your FastAPI instance and you have a fake_users_db

@app.get("/users/me/", response_model=User)
async def read_users_me(current_user_payload: dict = Depends(get_current_user)):
    # The payload from the token is in 'current_user_payload'
    email = current_user_payload.get("sub")
    user = get_user(fake_users_db, email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```
**Decorator Pattern**: You can create a decorator for role-based access control.

```python
from functools import wraps

def require_role(required_role: str):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            user_payload: dict = kwargs.get("current_user_payload")
            if not user_payload or required_role not in user_payload.get("roles", []):
                raise HTTPException(status_code=403, detail="Not enough permissions")
            return await func(*args, **kwargs)
        return wrapper
    return decorator

@app.get("/admin/dashboard")
@require_role("admin")
async def get_admin_dashboard(current_user_payload: dict = Depends(get_current_user)):
    return {"message": f"Welcome Admin {current_user_payload.get('sub')}"}
```

### 5. Token Refresh Endpoint

This endpoint allows clients to get a new access token using a valid refresh token.

```python
from scripts.jwt_auth import decode_token, create_access_token

@app.post("/refresh")
async def refresh_token(current_user_payload: dict = Depends(get_current_user)):
    # Note: For refreshing, you might want a separate dependency that only checks
    # for a refresh token. For simplicity, we reuse get_current_user.

    email = current_user_payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = get_user(fake_users_db, email)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    new_token_data = {"sub": user.email, "roles": user.roles}
    new_access_token = create_access_token(data=new_token_data)

    return {"access_token": new_access_token, "token_type": "bearer"}
```

### 6. Auth Middleware (Alternative)

Instead of dependencies, you can use middleware to validate tokens for a group of routes.

**Pros**: Centralized logic, can protect many routes without modifying their signatures.
**Cons**: Less granular control compared to dependencies, can be slightly less explicit in the endpoint signature.

```python
from fastapi import Request
from scripts.jwt_auth import decode_token

@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    if request.url.path.startswith("/api/v1/protected"):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return HTTPException(status_code=401, detail="Not authenticated")

        token = auth_header.split(" ")[1]
        try:
            payload = decode_token(token)
            request.state.user = payload
        except HTTPException as e:
            return e # Return the auth error

    response = await call_next(request)
    return response
```
To access the user in an endpoint, you would use the `Request` object:
```python
@app.get("/api/v1/protected/data")
async def get_protected_data(request: Request):
    user_payload = request.state.user
    return {"message": "Here is protected data", "user": user_payload}
```
