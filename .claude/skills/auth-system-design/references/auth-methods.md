# Authentication Methods Comparison

Comparison of authentication methods for security, complexity, and use cases.

## Method Overview

### Session-Based
- Server-side state storage with cookie-based session IDs
- **Pros**: Full server control, easy logout, CSRF protection
- **Cons**: Requires server state, scaling challenges, session fixation risks

### JWT Token-Based
- Stateless authentication with signed tokens
- **Pros**: Scalable, cross-domain, no server state needed
- **Cons**: Cannot invalidate tokens early, larger size, key management

### OAuth 2.0
- Authorization framework for third-party integration
- **Pros**: Industry standard, fine-grained scopes, provider integration
- **Cons**: Complex implementation, provider dependency

### OpenID Connect
- Authentication layer on OAuth 2.0
- **Pros**: Standardized identity, SSO support
- **Cons**: More complex than OAuth

## Selection Guidelines

| Method | Best For | Key Considerations |
|--------|----------|-------------------|
| Sessions | Traditional web apps | Server state required |
| JWT | SPA/microservices | Token revocation challenges |
| OAuth 2.0 | Third-party auth | Complex setup |
| OIDC | Identity verification | More complex than OAuth |

### Choose Session-Based When:
- Traditional web apps with server-side rendering
- Need immediate logout
- Single domain applications

### Choose JWT When:
- Microservices/multi-domain
- Mobile/SPA applications
- Stateless architecture

### Choose OAuth 2.0/OIDC When:
- Third-party integration
- Enterprise SSO
- Identity provider exists