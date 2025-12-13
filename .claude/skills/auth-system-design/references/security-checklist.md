# Authentication Security Checklist

Essential security measures for authentication systems.

## Core Security

### Password Security
- [ ] Use bcrypt/Argon2 for hashing (not SHA-1/SHA-256)
- [ ] Minimum 12-character length requirement
- [ ] Check passwords against breach databases
- [ ] Prevent password reuse (last 24 passwords)

### Session/Token Security
- [ ] Use cryptographically secure random tokens
- [ ] Implement proper token expiration (15-60 min for JWT)
- [ ] Use HttpOnly/Secure/SameSite cookie flags
- [ ] Regenerate tokens after authentication

### Transport Security
- [ ] Enforce HTTPS for all auth endpoints
- [ ] Use HSTS headers
- [ ] Implement secure TLS (1.2+)

## API Protection

### Rate Limiting
- [ ] Limit auth attempts (5 per 15 min)
- [ ] Account lockout after 10-20 failures
- [ ] IP-based rate limiting

### Input Validation
- [ ] Validate all auth inputs (email, username, tokens)
- [ ] Use parameterized queries
- [ ] Generic error messages (don't reveal account existence)

## JWT Security

### Token Handling
- [ ] Use RS256/ES256 algorithms (not HS256 for multi-service)
- [ ] Validate all claims (iss, aud, exp, nbf, sub)
- [ ] Implement key rotation (30-90 days)
- [ ] Algorithm validation to prevent confusion attacks

## OAuth 2.0 Security

### Flow Security
- [ ] Always use PKCE for public clients
- [ ] Validate state parameter (CSRF protection)
- [ ] Restrict redirect URIs
- [ ] Short-lived authorization codes (1-10 min)

## MFA & Monitoring

### Multi-Factor Authentication
- [ ] Implement TOTP-based 2FA (RFC 6238)
- [ ] Secure MFA secret storage
- [ ] Backup authentication methods

### Logging & Monitoring
- [ ] Log auth events (success/failure)
- [ ] Monitor suspicious patterns
- [ ] Alert on multiple failed attempts