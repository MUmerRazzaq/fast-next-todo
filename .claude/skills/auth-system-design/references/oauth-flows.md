# OAuth 2.0 Flow Implementation

Essential OAuth 2.0 flows following RFC 6749 and RFC 7636 (PKCE).

## Grant Types

### Authorization Code (with PKCE)
- **Best for**: Web apps with backend, mobile apps
- **Security**: High
- **Implementation**: Use PKCE for public clients

### Client Credentials
- **Best for**: Service-to-service communication
- **Security**: Medium-High
- **Implementation**: Machine authentication

### Resource Owner Password
- **Best for**: Legacy/trusted applications only
- **Security**: Low (avoid if possible)

## Implementation

### Authorization Code with PKCE
```python
import secrets, hashlib, base64

def generate_pkce_pair():
    # Generate code verifier
    code_verifier = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8')
    code_verifier = code_verifier.rstrip('=')

    # Generate code challenge
    hashed = hashlib.sha256(code_verifier.encode('utf-8')).digest()
    code_challenge = base64.urlsafe_b64encode(hashed).decode('utf-8')
    code_challenge = code_challenge.rstrip('=')

    return code_verifier, code_challenge
```

### Client Credentials Flow
```python
async def get_service_token(client_id: str, client_secret: str):
    token_data = {
        'grant_type': 'client_credentials',
        'client_id': client_id,
        'client_secret': client_secret
    }
    response = await http_client.post(token_url, data=token_data)
    return response.json()
```