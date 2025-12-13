# Authentication Flows

Core authentication flows with implementation patterns.

## Flow Types

### Sign Up
1. Validate input
2. Check if user exists
3. Hash password
4. Create user
5. Generate tokens
6. Auto-login or redirect

### Login
1. Validate credentials
2. Verify password hash
3. Generate tokens
4. Update last login
5. Return tokens

### Logout
1. Invalidate tokens
2. Clear client storage
3. Redirect to public area

### Token Refresh
1. Validate refresh token
2. Generate new access token
3. Return new token

## Implementation

### Basic Flow Example
```python
# Login implementation
@app.post("/auth/login")
async def login(email: str, password: str):
    user = get_user_by_email(email)
    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        raise HTTPException(401, "Invalid credentials")

    access_token = create_token(user.id, user.roles)
    refresh_token = generate_refresh_token()
    store_refresh_token(refresh_token, user.id)

    return {"access_token": access_token, "refresh_token": refresh_token}
```