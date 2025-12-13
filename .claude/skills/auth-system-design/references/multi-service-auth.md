# Multi-Service Authentication

Patterns for authentication across multiple services.

## Architecture Patterns

### Centralized Auth Service
- Single identity server handles all auth
- Services validate tokens locally with public keys
- Pros: Centralized management
- Cons: Potential bottleneck

### Shared Secret Authentication
- Services share common secret for token validation
- Pros: Simple, fast validation
- Cons: Secret rotation complexity

### Public Key Verification
- Auth service signs tokens with private key
- Other services verify with public key
- Pros: Secure, scalable
- Cons: Key management complexity

## Implementation

### Centralized Validation
```python
async def validate_token_central(token: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://auth-service/validate",
            headers={"Authorization": f"Bearer {token}"}
        )
        return response.json() if response.status_code == 200 else None
```

### Public Key Verification
```python
import jwt

def validate_with_public_key(token: str, public_key: str):
    try:
        payload = jwt.decode(
            token,
            key=public_key,
            algorithms=["RS256"],
            audience="multi-service-app",
            issuer="https://auth-service.com"
        )
        return payload
    except jwt.PyJWTError:
        return None
```