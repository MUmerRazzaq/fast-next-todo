# User Context Extraction

In a typical web application, user information is passed in an authentication token (like a JWT) with each request. To enforce data scoping, you first need to extract this user information and make it available to your application's business logic.

With FastAPI, the best way to do this is with a dependency.

## 1. Define a User Context Model

First, define a Pydantic model to represent the user context you'll extract from the token. This provides type safety and validation.

```python
# app/schemas/user.py
from pydantic import BaseModel, Field

class UserContext(BaseModel):
    user_id: int
    organization_id: int
    is_admin: bool = False

```

## 2. Create the Dependency

Next, create a FastAPI dependency that decodes the JWT, validates its payload, and returns a `UserContext` instance.

This example assumes you have a `decode_access_token` function that handles JWT decoding and validation.

```python
# app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

from app.schemas.user import UserContext
from app.core.security import decode_access_token # Assumed function

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_user_context(token: str = Depends(oauth2_scheme)) -> UserContext:
    """
    Dependency to decode JWT and return user context.
    """
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        organization_id = payload.get("org_id")
        is_admin = payload.get("is_admin", False)

        if user_id is None or organization_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return UserContext(
            user_id=int(user_id),
            organization_id=int(organization_id),
            is_admin=is_admin
        )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
```

## 3. Use the Dependency in Path Operations

Now you can use this dependency in your API endpoints to get the context for the current user.

```python
# app/api/v1/endpoints/items.py
from fastapi import APIRouter, Depends

from app.dependencies import get_user_context
from app.schemas.user import UserContext

router = APIRouter()

@router.get("/items/me")
def read_own_items(current_user: UserContext = Depends(get_user_context)):
    # The 'current_user' variable now holds the validated user context.
    # You can now use current_user.user_id, current_user.organization_id, etc.
    return {"user_id": current_user.user_id, "organization_id": current_user.organization_id}
```

This dependency is the foundation for all subsequent data scoping patterns.
