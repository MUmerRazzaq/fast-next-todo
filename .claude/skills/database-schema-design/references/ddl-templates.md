# SQL DDL Script Templates

Use these templates as a starting point for writing your SQL Data Definition Language (DDL) scripts. These examples use PostgreSQL syntax, but are easily adaptable to other SQL dialects.

## Create Table

### Basic Table
```sql
CREATE TABLE table_name (
    id SERIAL PRIMARY KEY,
    column1 VARCHAR(255) NOT NULL,
    column2 INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Table with Foreign Key
```sql
CREATE TABLE child_table (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER NOT NULL,
    data VARCHAR(100),
    CONSTRAINT fk_parent
        FOREIGN KEY(parent_id)
        REFERENCES parent_table(id)
        ON DELETE CASCADE
);
```

### Junction Table for Many-to-Many
```sql
CREATE TABLE users_roles (
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_role
        FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

## Add Constraints

### Add Unique Constraint
```sql
ALTER TABLE table_name
ADD CONSTRAINT constraint_name_unique UNIQUE (column_name);
```

### Add Check Constraint
```sql
ALTER TABLE products
ADD CONSTRAINT price_check CHECK (price > 0);
```

## Create Index

### Single-Column Index
```sql
CREATE INDEX index_name
ON table_name (column_name);
```

### Composite Index
```sql
CREATE INDEX index_name
ON table_name (column1, column2);
```

### Unique Index
```sql
CREATE UNIQUE INDEX index_name
ON table_name (column_name);
```

## Alter Table

### Add a Column
```sql
ALTER TABLE table_name
ADD COLUMN new_column_name VARCHAR(50);
```

### Drop a Column
```sql
ALTER TABLE table_name
DROP COLUMN column_name;
```

### Rename a Column
```sql
ALTER TABLE table_name
RENAME COLUMN old_name TO new_name;
```

### Modify a Column's Data Type
```sql
ALTER TABLE table_name
ALTER COLUMN column_name TYPE NEW_DATA_TYPE;
```
