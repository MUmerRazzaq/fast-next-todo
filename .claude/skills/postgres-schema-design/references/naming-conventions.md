# PostgreSQL Naming Conventions

## Table of Contents
- [General Rules](#general-rules)
- [Table Names](#table-names)
- [Column Names](#column-names)
- [Constraint Names](#constraint-names)
- [Index Names](#index-names)
- [Other Objects](#other-objects)

## General Rules

1. **Use lowercase**: PostgreSQL folds unquoted identifiers to lowercase
2. **Use snake_case**: Separate words with underscores
3. **Be descriptive**: Names should be self-documenting
4. **Avoid reserved words**: Check PostgreSQL reserved words list
5. **Keep it short but clear**: Balance brevity with readability

```sql
-- Good
CREATE TABLE user_account (
    user_id UUID PRIMARY KEY,
    email_address VARCHAR(255)
);

-- Avoid
CREATE TABLE "UserAccount" (  -- Requires quoting
    "userId" UUID PRIMARY KEY,
    "emailAddress" VARCHAR(255)
);
```

## Table Names

### Use Singular Nouns

Per PostgreSQL convention and relational theory, table names should be **singular**:

```sql
-- Recommended (singular)
user
order_item
product_category

-- Avoid (plural)
users
order_items
product_categories
```

**Rationale:**
- A table represents a relation, each row is one entity
- SQL reads naturally: `SELECT * FROM user WHERE id = 1`
- Foreign keys read better: `user_id` not `users_id`
- Consistent with entity naming in ERDs

### Junction Tables

For many-to-many relationships, use both table names:

```sql
-- Format: {table1}_{table2} (alphabetical or logical order)
user_role        -- users have roles
product_category -- products belong to categories
order_item       -- orders contain items
```

### Prefixes (Use Sparingly)

Only use prefixes when necessary for clarity:

```sql
-- Audit tables
audit_user_change
audit_order_history

-- Staging/temporary tables
stg_import_data
tmp_calculation
```

## Column Names

### Primary Keys

```sql
-- Option 1: Simple 'id' (recommended for most cases)
id UUID PRIMARY KEY

-- Option 2: Prefixed '{table}_id' (when joining many tables)
user_id UUID PRIMARY KEY
```

### Foreign Keys

Always suffix with `_id` and match referenced table:

```sql
-- Foreign key naming
user_id UUID REFERENCES user(id)
order_id UUID REFERENCES order(id)
parent_category_id UUID REFERENCES category(id)  -- Self-reference
```

### Boolean Columns

Use `is_`, `has_`, `can_` prefixes:

```sql
is_active BOOLEAN DEFAULT true
is_verified BOOLEAN DEFAULT false
has_subscription BOOLEAN DEFAULT false
can_edit BOOLEAN DEFAULT false
```

### Timestamp Columns

Use `_at` suffix for timestamps, `_on` for dates:

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
deleted_at TIMESTAMPTZ  -- Soft delete
published_at TIMESTAMPTZ
expires_on DATE
birth_date DATE  -- Alternative without suffix when obvious
```

### Amount/Count Columns

```sql
total_amount NUMERIC(12,2)
item_count INTEGER
view_count BIGINT
price_cents INTEGER  -- Store currency in smallest unit
```

## Constraint Names

### Format: `{table}_{column(s)}_{type}`

```sql
-- Primary key
CONSTRAINT user_pkey PRIMARY KEY (id)

-- Foreign key
CONSTRAINT order_user_id_fkey FOREIGN KEY (user_id) REFERENCES user(id)

-- Unique
CONSTRAINT user_email_unique UNIQUE (email)

-- Check
CONSTRAINT order_status_check CHECK (status IN ('pending', 'completed', 'cancelled'))

-- Not null (implicit, but can be named)
CONSTRAINT user_email_not_null CHECK (email IS NOT NULL)
```

### Constraint Type Suffixes

| Suffix | Constraint Type |
|--------|-----------------|
| `_pkey` | Primary Key |
| `_fkey` | Foreign Key |
| `_unique` | Unique |
| `_check` | Check |
| `_excl` | Exclusion |

## Index Names

### Format: `idx_{table}_{column(s)}`

```sql
-- Single column index
CREATE INDEX idx_user_email ON user(email);

-- Multi-column index
CREATE INDEX idx_order_user_id_created_at ON order(user_id, created_at);

-- Partial index
CREATE INDEX idx_user_active ON user(id) WHERE deleted_at IS NULL;

-- Unique index
CREATE UNIQUE INDEX idx_user_email_unique ON user(email);

-- GIN index (for JSONB)
CREATE INDEX idx_user_metadata_gin ON user USING GIN (metadata);
```

### Index Type Suffixes (Optional)

```sql
idx_user_metadata_gin      -- GIN index
idx_location_coords_gist   -- GiST index
idx_user_search_trgm       -- Trigram index
```

## Other Objects

### Sequences

```sql
-- Auto-generated for SERIAL/IDENTITY
{table}_{column}_seq

-- Custom sequences
seq_{purpose}
```

### Functions

```sql
-- Format: verb_noun or action_description
fn_calculate_order_total()
fn_validate_email()
trigger_update_timestamp()
```

### Triggers

```sql
-- Format: trg_{table}_{timing}_{event}
trg_user_before_update
trg_order_after_insert
trg_audit_log_instead_delete
```

### Views

```sql
-- Format: v_{description} or vw_{description}
v_active_user
v_order_summary
vw_monthly_revenue
```

### Materialized Views

```sql
-- Format: mv_{description}
mv_daily_statistics
mv_product_search
```

### Schemas

```sql
-- Use lowercase, descriptive names
public          -- Default schema
auth            -- Authentication related
billing         -- Billing/payment related
reporting       -- Analytics/reporting views
```

## Quick Reference

| Object | Convention | Example |
|--------|------------|---------|
| Table | singular, snake_case | `user_account` |
| Column | snake_case | `created_at` |
| Primary Key | `id` or `{table}_id` | `id`, `user_id` |
| Foreign Key | `{ref_table}_id` | `user_id` |
| Index | `idx_{table}_{cols}` | `idx_user_email` |
| Constraint PK | `{table}_pkey` | `user_pkey` |
| Constraint FK | `{table}_{col}_fkey` | `order_user_id_fkey` |
| Constraint UQ | `{table}_{col}_unique` | `user_email_unique` |
| Constraint CK | `{table}_{col}_check` | `order_status_check` |
| Function | `fn_{action}` | `fn_calculate_total` |
| Trigger | `trg_{table}_{event}` | `trg_user_before_update` |
| View | `v_{description}` | `v_active_user` |
| Sequence | `{table}_{col}_seq` | `order_id_seq` |
