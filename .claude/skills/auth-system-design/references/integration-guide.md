# Frontend/Backend Authentication Integration

Essential patterns for secure frontend-backend authentication integration.

## Architecture

### Backend Responsibilities
- Validate credentials securely
- Generate/validate tokens
- Handle password hashing
- Implement authorization
- Rate limiting and security

### Frontend Responsibilities
- Collect credentials securely
- Store tokens safely (memory vs storage)
- Handle refresh automatically
- Redirect after auth
- Clear state on logout

## Backend Implementation

### Core Endpoints
```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer
import bcrypt, jwt
from datetime import timedelta

app = FastAPI()
security = HTTPBearer()

@app.post("/auth/login")
async def login(email: str, password: str):
    # Validate credentials
    user = get_user_by_email(email)
    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        raise HTTPException(401, "Invalid credentials")

    # Generate tokens
    access_token = create_token(user.id, user.roles)
    refresh_token = generate_refresh_token()

    store_refresh_token(refresh_token, user.id)
    return {"access_token": access_token, "refresh_token": refresh_token}

@app.post("/auth/refresh")
async def refresh(refresh_token: str):
    user_id = validate_refresh_token(refresh_token)
    if not user_id:
        raise HTTPException(401, "Invalid refresh token")

    new_token = create_token(user_id, get_user_roles(user_id))
    return {"access_token": new_token}
```

## Frontend Implementation

### Auth Context Pattern
```typescript
// Minimal auth context
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email, password})
    });

    const tokens = await response.json();
    localStorage.setItem('token', tokens.access_token);
    setUser(getUserProfile(tokens.access_token));
  };

  const refreshAuth = async () => {
    // Token refresh logic
  };
};
```

### Token Storage
- **SPA**: Store access tokens in memory, refresh tokens in httpOnly cookies
- **Server-side rendered**: Use sessions with secure cookies
- **Never**: Store tokens in localStorage for sensitive applications