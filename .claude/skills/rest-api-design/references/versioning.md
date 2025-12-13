# API Versioning

## Strategy Comparison

| Strategy | Example | Pros | Cons |
|----------|---------|------|------|
| URI Path | `/v1/users` | Simple, visible | URL pollution |
| Header | `X-API-Version: 1` | Clean URLs | Hidden |
| Query Param | `?version=1` | Simple | Not RESTful |
| Content Negotiation | `Accept: vnd.api.v1+json` | Standards-based | Complex |

## URI Path (Recommended)
```
https://api.example.com/v1/users
https://api.example.com/v2/users
```

- Use major version only: `v1`, `v2`
- Support previous version during transition
- Document deprecation timeline

## Header Versioning
```
GET /users
X-API-Version: 2
```

## Content Negotiation
```
GET /users
Accept: application/vnd.myapi.v2+json
```

## Breaking Changes
**Requires new version:**
- Removing endpoints/fields
- Changing field types
- Changing URL structure
- Tightening validation

**No version change needed:**
- Adding endpoints/fields
- Adding optional parameters
- Adding enum values