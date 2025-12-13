# ERD Template (Mermaid)

## Basic Entity-Relationship Diagram

```mermaid
erDiagram
    %% Define entities with their attributes
    USER {
        uuid id PK "Primary key"
        varchar email UK "Unique constraint"
        varchar password_hash
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at "Soft delete"
    }

    ROLE {
        uuid id PK
        varchar name UK
        varchar description
        timestamp created_at
    }

    USER_ROLE {
        uuid user_id PK,FK
        uuid role_id PK,FK
        timestamp assigned_at
    }

    POST {
        uuid id PK
        uuid author_id FK
        varchar title
        text content
        varchar status "draft|published|archived"
        timestamp published_at
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    COMMENT {
        uuid id PK
        uuid post_id FK
        uuid user_id FK
        uuid parent_id FK "Self-referential"
        text content
        timestamp created_at
        timestamp updated_at
    }

    AUDIT_LOG {
        bigint id PK "Auto-increment for ordering"
        varchar table_name
        uuid record_id
        uuid user_id FK
        varchar action "INSERT|UPDATE|DELETE"
        jsonb old_values
        jsonb new_values
        inet ip_address
        timestamp created_at
    }

    %% Define relationships
    USER ||--o{ USER_ROLE : "has"
    ROLE ||--o{ USER_ROLE : "assigned to"
    USER ||--o{ POST : "authors"
    POST ||--o{ COMMENT : "has"
    USER ||--o{ COMMENT : "writes"
    COMMENT ||--o{ COMMENT : "replies to"
    USER ||--o{ AUDIT_LOG : "performs"
```

## Relationship Notations

| Notation | Meaning |
|----------|---------|
| `\|\|--o{` | One-to-Many (required) |
| `\|\|--\|\|` | One-to-One (required) |
| `o\|--o{` | One-to-Many (optional) |
| `}o--o{` | Many-to-Many |

## Attribute Markers

| Marker | Meaning |
|--------|---------|
| `PK` | Primary Key |
| `FK` | Foreign Key |
| `UK` | Unique Key |

## Template Variations

### E-Commerce Domain

```mermaid
erDiagram
    CUSTOMER {
        uuid id PK
        varchar email UK
        varchar name
        timestamp created_at
    }

    ORDER {
        uuid id PK
        uuid customer_id FK
        varchar status
        decimal total_amount
        timestamp order_date
    }

    ORDER_ITEM {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        integer quantity
        decimal unit_price
    }

    PRODUCT {
        uuid id PK
        varchar sku UK
        varchar name
        text description
        decimal price
        integer stock_quantity
    }

    CATEGORY {
        uuid id PK
        uuid parent_id FK "Self-referential"
        varchar name
        varchar slug UK
    }

    PRODUCT_CATEGORY {
        uuid product_id PK,FK
        uuid category_id PK,FK
    }

    CUSTOMER ||--o{ ORDER : "places"
    ORDER ||--|{ ORDER_ITEM : "contains"
    PRODUCT ||--o{ ORDER_ITEM : "ordered in"
    CATEGORY ||--o{ CATEGORY : "parent of"
    PRODUCT }o--o{ CATEGORY : "belongs to"
```

### Multi-Tenant SaaS Domain

```mermaid
erDiagram
    TENANT {
        uuid id PK
        varchar name
        varchar subdomain UK
        varchar plan
        timestamp created_at
    }

    USER {
        uuid id PK
        uuid tenant_id FK
        varchar email
        varchar role
        timestamp created_at
    }

    RESOURCE {
        uuid id PK
        uuid tenant_id FK
        uuid created_by FK
        varchar name
        jsonb data
        timestamp created_at
    }

    TENANT ||--|{ USER : "has"
    TENANT ||--o{ RESOURCE : "owns"
    USER ||--o{ RESOURCE : "creates"
```

## Usage Instructions

1. Copy the appropriate template section
2. Modify entity names to match your domain
3. Add/remove attributes as needed
4. Update relationships based on your requirements
5. Use comments (`%%`) to document design decisions
