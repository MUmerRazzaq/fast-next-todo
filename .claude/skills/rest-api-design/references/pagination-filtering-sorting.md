# Pagination, Filtering, and Sorting

## Pagination

### Offset-Based (Simple)
```
GET /items?page=2&limit=20
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "totalItems": 100,
    "totalPages": 5
  }
}
```

### Best Practices
- Default limit: 20 items
- Max limit: 100 items
- Use 1-indexed pages

## Filtering

### Simple Filters
```
GET /items?status=active&category=electronics
```

### Multiple Values
```
GET /items?status=active,pending
```

### Comparisons
```
GET /items?price[gte]=100&price[lte]=500
GET /items?created_at[gt]=2024-01-01
```

### Text Search
```
GET /items?q=search-term
```

## Sorting

### Single Field
```
GET /items?sort=name
GET /items?sort=name:desc
```

### Multiple Fields
```
GET /items?sort=status:asc,created_at:desc
```

## Other Options

### Sparse Fields
```
GET /items?fields=id,name,price
```

### Include Relations
```
GET /items/123?include=author,category
```

### Combined Example
```
GET /items?page=1&limit=20&status=active&q=laptop&sort=-created_at&fields=id,name
```