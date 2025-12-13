# PostgreSQL Index Design Guidelines

## Table of Contents
- [When to Create Indexes](#when-to-create-indexes)
- [Index Types](#index-types)
- [SQLModel Index Patterns](#sqlmodel-index-patterns)
- [Composite Indexes](#composite-indexes)
- [Partial Indexes](#partial-indexes)
- [Index Anti-Patterns](#index-anti-patterns)
- [Index Maintenance](#index-maintenance)

## When to Create Indexes

### Always Index
1. **Primary Keys** - Automatic in PostgreSQL
2. **Foreign Keys** - Not automatic, must create manually
3. **Unique Constraints** - Creates index automatically
4. **Frequently Filtered Columns** - Used in WHERE clauses
5. **JOIN Columns** - Used in JOIN conditions
6. **ORDER BY Columns** - When sorting large result sets

### Consider Indexing
- Columns used in GROUP BY
- Columns with high selectivity (many unique values)
- Columns in covering queries (index-only scans possible)

### Avoid Indexing
- Small tables (< 1000 rows)
- Columns with low selectivity (few unique values like boolean)
- Tables with heavy INSERT/UPDATE/DELETE operations
- Columns rarely used in queries

## Index Types

### B-Tree (Default)
Best for: equality and range queries, ORDER BY, LIKE 'prefix%'

```sql
-- Standard B-tree index
CREATE INDEX idx_user_email ON user(email);

-- SQLModel
class User(SQLModel, table=True):
    email: str = Field(index=True)
```

### Hash
Best for: equality comparisons only (=)

```sql
CREATE INDEX idx_user_uuid ON user USING HASH (uuid);
```

### GIN (Generalized Inverted Index)
Best for: JSONB, arrays, full-text search

```sql
-- JSONB index
CREATE INDEX idx_user_metadata ON user USING GIN (metadata);

-- Array containment
CREATE INDEX idx_post_tags ON post USING GIN (tags);

-- Full-text search
CREATE INDEX idx_post_search ON post USING GIN (to_tsvector('english', title || ' ' || content));
```

### GiST (Generalized Search Tree)
Best for: geometric data, range types, full-text search

```sql
CREATE INDEX idx_location ON store USING GIST (location);
```

### BRIN (Block Range Index)
Best for: large tables with naturally ordered data (timestamps)

```sql
-- Excellent for time-series data
CREATE INDEX idx_log_created ON log USING BRIN (created_at);
```

## SQLModel Index Patterns

### Simple Index
```python
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(index=True)
    name: str = Field(index=True)
```

### Unique Index
```python
class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True)  # Creates unique index
```

### Foreign Key Index
```python
class Post(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    author_id: int = Field(foreign_key="user.id", index=True)  # Index FK!
```

### Advanced Indexes with SQLAlchemy
```python
from sqlalchemy import Index
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str
    tenant_id: int
    status: str
    deleted_at: datetime | None = None

    __table_args__ = (
        # Composite index
        Index('idx_user_tenant_email', 'tenant_id', 'email'),

        # Partial index (active users only)
        Index('idx_user_active', 'id', postgresql_where=text('deleted_at IS NULL')),

        # Unique composite constraint
        Index('idx_user_tenant_email_unique', 'tenant_id', 'email', unique=True),
    )
```

### GIN Index for JSONB
```python
from sqlalchemy import Column, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    metadata: dict = Field(sa_column=Column(JSONB, default={}))

    __table_args__ = (
        Index('idx_user_metadata', 'metadata', postgresql_using='gin'),
    )
```

## Composite Indexes

### Column Order Matters

Put the most selective (restrictive) column first:

```sql
-- If tenant_id has 100 values and status has 3:
-- GOOD: High selectivity first
CREATE INDEX idx_user_tenant_status ON user(tenant_id, status);

-- BAD: Low selectivity first (less efficient)
CREATE INDEX idx_user_status_tenant ON user(status, tenant_id);
```

### Composite Index Usage

A composite index on (A, B, C) can be used for:
- Queries on A
- Queries on A and B
- Queries on A, B, and C

But NOT efficiently for:
- Queries on B alone
- Queries on C alone
- Queries on B and C

```sql
-- Index: (tenant_id, created_at, status)

-- Uses index efficiently:
WHERE tenant_id = 1
WHERE tenant_id = 1 AND created_at > '2024-01-01'
WHERE tenant_id = 1 AND created_at > '2024-01-01' AND status = 'active'

-- Does NOT use index efficiently:
WHERE created_at > '2024-01-01'  -- Missing leading column
WHERE status = 'active'          -- Missing leading columns
```

### Covering Indexes (INCLUDE)
```sql
-- Include columns needed for SELECT to enable index-only scans
CREATE INDEX idx_user_email_include
ON user(email)
INCLUDE (name, created_at);

-- Query can be satisfied entirely from index:
SELECT name, created_at FROM user WHERE email = 'test@example.com';
```

## Partial Indexes

Index only rows matching a condition:

```sql
-- Only index active users (smaller index, faster queries)
CREATE INDEX idx_user_active_email
ON user(email)
WHERE deleted_at IS NULL;

-- Only index recent orders
CREATE INDEX idx_order_recent
ON order(created_at DESC)
WHERE created_at > NOW() - INTERVAL '30 days';

-- Only index pending items
CREATE INDEX idx_task_pending
ON task(due_date)
WHERE status = 'pending';
```

### SQLModel Partial Index
```python
from sqlalchemy import Index, text
from sqlmodel import SQLModel, Field

class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    status: str
    due_date: datetime

    __table_args__ = (
        Index(
            'idx_task_pending',
            'due_date',
            postgresql_where=text("status = 'pending'")
        ),
    )
```

## Index Anti-Patterns

### 1. Indexing Everything
```python
# BAD: Over-indexing
class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    bio: str = Field(index=True)        # Rarely queried
    avatar_url: str = Field(index=True)  # Never filtered
    theme: str = Field(index=True)       # Low selectivity
```

### 2. Missing Foreign Key Indexes
```python
# BAD: No index on FK
class Post(SQLModel, table=True):
    author_id: int = Field(foreign_key="user.id")  # Missing index=True!

# GOOD: Index foreign keys
class Post(SQLModel, table=True):
    author_id: int = Field(foreign_key="user.id", index=True)
```

### 3. Redundant Indexes
```sql
-- Redundant: idx2 is covered by idx1
CREATE INDEX idx1 ON user(tenant_id, email);
CREATE INDEX idx2 ON user(tenant_id);  -- Redundant!
```

### 4. Indexing Low-Cardinality Columns
```python
# BAD: Boolean has only 2 values
class User(SQLModel, table=True):
    is_active: bool = Field(index=True)  # Low selectivity

# BETTER: Use partial index
__table_args__ = (
    Index('idx_user_active', 'id', postgresql_where=text('is_active = true')),
)
```

### 5. Functions Preventing Index Usage
```sql
-- BAD: Function on column prevents index usage
SELECT * FROM user WHERE LOWER(email) = 'test@example.com';

-- GOOD: Create expression index
CREATE INDEX idx_user_email_lower ON user(LOWER(email));

-- Or normalize data on insert
```

## Index Maintenance

### Check Index Usage
```sql
-- Find unused indexes
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Check Index Size
```sql
SELECT
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Reindex (Fix Bloat)
```sql
-- Reindex single index
REINDEX INDEX idx_user_email;

-- Reindex entire table
REINDEX TABLE user;

-- Reindex concurrently (no locks, PostgreSQL 12+)
REINDEX INDEX CONCURRENTLY idx_user_email;
```

### Create Index Concurrently (Production)
```sql
-- Avoid locking table during index creation
CREATE INDEX CONCURRENTLY idx_user_email ON user(email);
```

## Quick Reference

| Query Pattern | Index Type | Example |
|--------------|-----------|---------|
| `WHERE col = value` | B-tree | `CREATE INDEX ON t(col)` |
| `WHERE col > value` | B-tree | `CREATE INDEX ON t(col)` |
| `WHERE col LIKE 'prefix%'` | B-tree | `CREATE INDEX ON t(col)` |
| `WHERE col @> '{"key": "value"}'` | GIN | `USING GIN (col)` |
| `WHERE col && ARRAY[1,2,3]` | GIN | `USING GIN (col)` |
| Full-text search | GIN/GiST | `USING GIN (to_tsvector(...))` |
| Time-series data | BRIN | `USING BRIN (created_at)` |
| Geometric queries | GiST | `USING GIST (location)` |
