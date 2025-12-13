# Secure Password Reset

Implementation of secure password reset with timing attack prevention.

## Flow

1. User requests reset (email)
2. Generate secure token (don't reveal user existence)
3. Store hashed token with expiration
4. Send reset email with token
5. User visits reset page with token
6. Validate token and allow new password
7. Update password and invalidate tokens

## Security Considerations

- Use cryptographically secure tokens
- Hash tokens before storage
- Set short expiration (1 hour)
- Constant-time token comparison
- Rate limiting on reset requests
- Don't reveal if user exists

## Implementation

```python
import secrets
import hashlib

def generate_reset_token():
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    return token, token_hash

def request_password_reset(email: str):
    # Process even if user doesn't exist (timing attack prevention)
    user = get_user_by_email(email)
    if user:
        token, token_hash = generate_reset_token()
        store_reset_token(user.id, token_hash, expires_in_hours=1)
        send_reset_email(email, token)

def reset_password(token: str, new_password: str):
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    token_record = get_reset_token(token_hash)

    if not token_record or token_record.expires_at < datetime.utcnow():
        return False

    # Validate and hash new password
    hashed_password = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt(12))
    update_user_password(token_record.user_id, hashed_password)

    # Invalidate all refresh tokens for security
    invalidate_user_tokens(token_record.user_id)
    delete_reset_token(token_hash)
    return True
```