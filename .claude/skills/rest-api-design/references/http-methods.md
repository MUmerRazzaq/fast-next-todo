# HTTP Method Selection

| Method | Purpose | Idempotent | Request Body |
|--------|---------|------------|--------------|
| GET | Retrieve | Yes | No |
| POST | Create/Action | No | Yes |
| PUT | Replace | Yes | Yes |
| PATCH | Partial update | No* | Yes |
| DELETE | Remove | Yes | Optional |

*PATCH idempotency depends on implementation

## Decision Guide
```
Read operation? → GET
New resource? → POST
Existing resource?
  ├─ Replace all? → PUT
  ├─ Partial update? → PATCH
  └─ Remove? → DELETE
```

## Common Patterns
- **GET**: Read-only, cacheable, no side effects
- **POST**: Create new resources, trigger actions
- **PUT**: Replace entire resource, upsert if needed
- **PATCH**: Update specific fields only
- **DELETE**: Remove resource (idempotent)
