# JWT Structure and Claims Guidelines

Essential JWT structure following RFC 7519 and security best practices.

## JWT Components

JWT format: `header.payload.signature`

### Header
```json
{
  "alg": "RS256",
  "typ": "JWT"
}
```
- Use RS256/ES256 (not HS256 for multi-service)
- Never accept "none" algorithm in production

### Payload Claims
- **Required**: iss, sub, aud, exp, iat
- **Optional**: nbf, jti
- **Custom**: user_id, roles, permissions

## Security Best Practices

### Token Creation
- Use RS256 algorithm
- Short expiration (15-60 min)
- Include required claims
- Limit token size

### Token Validation
- Validate all claims (iss, aud, exp, nbf, sub)
- Verify signature with proper keys
- Prevent algorithm confusion
- Implement blacklisting if needed

## Implementation

### Basic JWT Creation
```python
import jwt
from datetime import datetime, timedelta

def create_token(user_id: str, roles: list):
    payload = {
        "user_id": user_id,
        "roles": roles,
        "exp": (datetime.utcnow() + timedelta(minutes=15)).timestamp(),
        "iss": "https://your-app.com",
        "aud": "https://your-app.com"
    }
    return jwt.encode(payload, key="secret", algorithm="RS256")
```

### Token Validation
```python
def validate_token(token: str):
    try:
        payload = jwt.decode(
            token,
            key="public_key",
            algorithms=["RS256"],
            audience="https://your-app.com",
            issuer="https://your-app.com"
        )
        return payload
    except jwt.PyJWTError:
        return None
```