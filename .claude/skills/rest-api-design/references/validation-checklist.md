# API Validation Checklist

## Design
- [ ] Use plural nouns: `/users`, not `/user`
- [ ] No verbs in URLs (use HTTP methods)
- [ ] Lowercase with hyphens: `/user-profiles`
- [ ] Max 2-3 nesting levels for sub-resources
- [ ] Descriptive path parameter names: `{userId}`
- [ ] Consistent method usage (GET/POST/PUT/PATCH/DELETE)

## Requests
- [ ] `Content-Type` for requests with body
- [ ] Query params for pagination (`page`, `limit`), sorting (`sort`), filtering
- [ ] JSON as primary format
- [ ] Request body schemas defined
- [ ] Validation constraints specified

## Responses
- [ ] Correct status codes (200/201/204/400/401/403/404/422/500)
- [ ] `Location` header for 201 responses
- [ ] Consistent error format
- [ ] No sensitive data leaked

## Security
- [ ] Authentication required for protected endpoints
- [ ] Input validation and sanitization
- [ ] Rate limiting implemented
- [ ] Sensitive data not in URLs
- [ ] Proper 404 vs 403 handling

## Documentation
- [ ] OpenAPI 3.0+ spec
- [ ] All endpoints documented
- [ ] Example requests/responses
- [ ] Error codes documented

## Performance
- [ ] Pagination for collections
- [ ] Sparse fieldsets (`fields` parameter)
- [ ] Compression support