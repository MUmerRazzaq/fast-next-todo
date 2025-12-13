
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext

# --- Configuration ---
# It's highly recommended to load these from environment variables or a config file.
SECRET_KEY = os.environ.get("SECRET_KEY", "your-super-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# --- Password Hashing ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- OAuth2 Scheme ---
# This will look for the token in the "Authorization: Bearer <token>" header.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Utility Functions ---

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against a hashed one."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hashes a password using bcrypt."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Creates a new JWT access token.
    The token contains the provided data and an expiration timestamp.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    """Creates a new JWT refresh token with a longer expiration."""
    expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    return create_access_token(data, expires_delta=expires)

def decode_token(token: str) -> Optional[dict]:
    """
    Decodes a JWT token.
    Returns the payload if the token is valid, otherwise raises an exception.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise credentials_exception

# --- Dependency for Protected Endpoints ---

async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    FastAPI dependency to get the current user from a JWT token.
    This can be used to protect endpoints. It decodes the token and returns the payload.
    The application logic can then use this payload (e.g., user_id) to fetch the
    full user object from the database.
    """
    payload = decode_token(token)
    # You can add more validation here, e.g., check if user_id exists in the database.
    return payload
