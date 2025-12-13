# Database Normalization Guide

## Table of Contents
- [Overview](#overview)
- [First Normal Form (1NF)](#first-normal-form-1nf)
- [Second Normal Form (2NF)](#second-normal-form-2nf)
- [Third Normal Form (3NF)](#third-normal-form-3nf)
- [Beyond 3NF](#beyond-3nf)
- [When to Denormalize](#when-to-denormalize)

## Overview

Normalization reduces data redundancy and improves data integrity. Most applications should aim for 3NF.

**Benefits:**
- Eliminates redundant data
- Reduces update anomalies
- Ensures data consistency
- Minimizes storage requirements

**Trade-offs:**
- More JOINs required
- Potentially slower reads
- Increased query complexity

## First Normal Form (1NF)

**Rules:**
1. Each column contains atomic (indivisible) values
2. Each column contains values of a single type
3. Each row is unique (has a primary key)
4. No repeating groups or arrays

### Violation Example

```sql
-- Violates 1NF: phone_numbers contains multiple values
CREATE TABLE contact_bad (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    phone_numbers VARCHAR(255)  -- "555-1234, 555-5678"
);
```

### Corrected (1NF)

```sql
-- Option 1: Separate table (preferred)
CREATE TABLE contact (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE contact_phone (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contact(id),
    phone_number VARCHAR(20),
    phone_type VARCHAR(20)  -- 'home', 'work', 'mobile'
);

-- Option 2: PostgreSQL array (acceptable for simple cases)
CREATE TABLE contact_with_array (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    phone_numbers TEXT[]  -- PostgreSQL array type
);
```

### Another Violation: Repeating Groups

```sql
-- Violates 1NF: repeating groups (phone1, phone2, phone3)
CREATE TABLE contact_bad (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    phone1 VARCHAR(20),
    phone2 VARCHAR(20),
    phone3 VARCHAR(20)
);

-- Corrected: separate table
CREATE TABLE contact (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE contact_phone (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contact(id),
    phone_number VARCHAR(20)
);
```

## Second Normal Form (2NF)

**Rules:**
1. Must be in 1NF
2. All non-key columns depend on the **entire** primary key (no partial dependencies)

*Applies only to tables with composite primary keys.*

### Violation Example

```sql
-- Violates 2NF: product_name depends only on product_id, not full PK
CREATE TABLE order_item_bad (
    order_id INTEGER,
    product_id INTEGER,
    product_name VARCHAR(100),  -- Depends only on product_id
    quantity INTEGER,
    PRIMARY KEY (order_id, product_id)
);
```

### Corrected (2NF)

```sql
-- Product details in separate table
CREATE TABLE product (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    price NUMERIC(10,2)
);

-- Order item only has columns dependent on full PK
CREATE TABLE order_item (
    order_id INTEGER REFERENCES "order"(id),
    product_id INTEGER REFERENCES product(id),
    quantity INTEGER,
    unit_price NUMERIC(10,2),  -- Price at time of order
    PRIMARY KEY (order_id, product_id)
);
```

### Identifying Partial Dependencies

For composite PK (A, B), ask:
- Does column X depend on just A? → Partial dependency
- Does column X depend on just B? → Partial dependency
- Does column X depend on both A and B? → Full dependency (OK)

## Third Normal Form (3NF)

**Rules:**
1. Must be in 2NF
2. No transitive dependencies (non-key columns don't depend on other non-key columns)

### Violation Example

```sql
-- Violates 3NF: city and state depend on zip_code (transitive dependency)
CREATE TABLE customer_bad (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    zip_code VARCHAR(10),
    city VARCHAR(100),      -- Depends on zip_code, not customer
    state VARCHAR(50)       -- Depends on zip_code, not customer
);
```

### Corrected (3NF)

```sql
CREATE TABLE zip_code (
    code VARCHAR(10) PRIMARY KEY,
    city VARCHAR(100),
    state VARCHAR(50)
);

CREATE TABLE customer (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    zip_code VARCHAR(10) REFERENCES zip_code(code)
);
```

### Another Example: Derived Data

```sql
-- Violates 3NF: total is derived from quantity * price
CREATE TABLE order_item_bad (
    id SERIAL PRIMARY KEY,
    product_id INTEGER,
    quantity INTEGER,
    unit_price NUMERIC(10,2),
    total NUMERIC(10,2)  -- Transitive: depends on quantity and unit_price
);

-- Corrected: remove derived column, calculate when needed
CREATE TABLE order_item (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES product(id),
    quantity INTEGER,
    unit_price NUMERIC(10,2)
);

-- Calculate total in queries or views
CREATE VIEW order_item_with_total AS
SELECT *, quantity * unit_price AS total
FROM order_item;
```

## Beyond 3NF

### Boyce-Codd Normal Form (BCNF)

Stricter than 3NF: Every determinant must be a candidate key.

```sql
-- Potential BCNF violation: instructor determines room
-- (assuming each instructor teaches in one room)
CREATE TABLE class_bad (
    student_id INTEGER,
    instructor VARCHAR(100),
    room VARCHAR(20),
    PRIMARY KEY (student_id, instructor)
);

-- Corrected for BCNF
CREATE TABLE instructor_room (
    instructor VARCHAR(100) PRIMARY KEY,
    room VARCHAR(20)
);

CREATE TABLE class (
    student_id INTEGER,
    instructor VARCHAR(100) REFERENCES instructor_room(instructor),
    PRIMARY KEY (student_id, instructor)
);
```

### Fourth Normal Form (4NF)

No multi-valued dependencies. Rarely needed in practice.

### Fifth Normal Form (5NF)

No join dependencies. Very rare to need this level.

## When to Denormalize

Intentional denormalization can improve performance:

### 1. Caching Computed Values

```sql
-- Denormalized: store computed count for performance
CREATE TABLE post (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    comment_count INTEGER DEFAULT 0  -- Denormalized
);

-- Update via trigger
CREATE FUNCTION update_comment_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE post SET comment_count = comment_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE post SET comment_count = comment_count - 1
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### 2. Avoiding Expensive JOINs

```sql
-- Denormalized: store author name with post for fast display
CREATE TABLE post (
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES user(id),
    author_name VARCHAR(100),  -- Denormalized copy
    title VARCHAR(255),
    content TEXT
);
```

### 3. Historical Data Preservation

```sql
-- Denormalized: preserve price at time of order
CREATE TABLE order_item (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES product(id),
    product_name VARCHAR(255),     -- Snapshot
    product_sku VARCHAR(50),       -- Snapshot
    unit_price NUMERIC(10,2),      -- Snapshot
    quantity INTEGER
);
```

### 4. Reporting Tables

```sql
-- Denormalized materialized view for reporting
CREATE MATERIALIZED VIEW mv_sales_summary AS
SELECT
    date_trunc('day', o.created_at) AS sale_date,
    p.category,
    COUNT(*) AS order_count,
    SUM(oi.quantity) AS items_sold,
    SUM(oi.quantity * oi.unit_price) AS revenue
FROM "order" o
JOIN order_item oi ON o.id = oi.order_id
JOIN product p ON oi.product_id = p.id
GROUP BY 1, 2;
```

## Normalization Decision Matrix

| Situation | Recommendation |
|-----------|----------------|
| New application, unclear query patterns | Start with 3NF |
| Read-heavy, few writes | Consider denormalization |
| Write-heavy, data integrity critical | Strict 3NF |
| Reporting/analytics | Denormalized views/tables |
| Historical data (invoices, receipts) | Denormalize snapshots |
| Frequently computed aggregates | Cache with triggers |

## Quick Normalization Checklist

**1NF Check:**
- [ ] No multi-valued columns
- [ ] No repeating groups
- [ ] Primary key defined

**2NF Check:**
- [ ] All non-key columns depend on entire primary key
- [ ] No partial dependencies

**3NF Check:**
- [ ] No non-key column depends on another non-key column
- [ ] No derived/calculated stored values (unless intentional)

**Denormalization Justification:**
- [ ] Performance problem verified with EXPLAIN ANALYZE
- [ ] Update strategy documented (triggers, application code)
- [ ] Trade-offs understood and accepted
