# HTTP Status Codes

## Code Categories
- **2xx**: Success
- **4xx**: Client error
- **5xx**: Server error

## Common Codes

| Code | When to Use |
|------|-------------|
| 200 | Success with response body |
| 201 | Resource created (POST) |
| 204 | Success, no body (DELETE, PUT) |
| 400 | Malformed request |
| 401 | Missing/invalid auth |
| 403 | Auth OK, insufficient permissions |
| 404 | Resource not found |
| 409 | Conflict (duplicate, wrong state) |
| 422 | Validation error |
| 429 | Rate limit exceeded |
| 500 | Server error |

## Decision Tree
```
Request successful?
├─ Yes → 2xx
│   ├─ New resource? → 201 Created
│   ├─ No body to return? → 204 No Content
│   └─ Otherwise → 200 OK
└─ No → Client or server error?
    ├─ Server fault? → 5xx (500, 503)
    └─ Client fault? → 4xx (400, 401, 403, 404, 422)
```

## Quick Reference by Method
- **GET**: 200, 401, 403, 404
- **POST**: 201, 400, 401, 403, 409, 422
- **PUT/PATCH**: 200, 204, 400, 401, 403, 404, 409, 422
- **DELETE**: 204, 401, 403, 404
