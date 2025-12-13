# API Naming Conventions

## Core Rules
- Use plural nouns: `/users`, `/products`
- Lowercase with hyphens: `/user-profiles`
- No verbs in paths (use HTTP methods)
- Max 2-3 nesting levels

## Examples
```
# CORRECT
GET /users
POST /users
GET /users/123

# INCORRECT
GET /getUser
GET /users/123.json
```

## Query Parameters
- Use lowercase with hyphens: `first-name=John`
- Common: `page`, `limit`, `sort`, `filter`
- No file extensions in URLs
- No trailing slashes
