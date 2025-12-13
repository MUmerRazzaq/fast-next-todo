# Core Database Schema Design Principles

This document covers the fundamental principles of designing a relational database schema.

## 1. Entity Identification from Requirements

- **Identify Nouns**: Look for nouns in the requirements document (e.g., "User", "Product", "Order"). These are potential entities.
- **Define Entities**: An entity represents a distinct object or concept. It should have a set of properties (attributes) and a unique identifier (primary key).
- **Example**: If a requirement is "Customers can place orders for multiple products", the entities are `Customer`, `Order`, and `Product`.

## 2. Relationship Cardinality Determination

- **Define Relationships**: Determine how entities are connected.
- **One-to-One (1:1)**: Each instance in one entity is related to exactly one instance in another. (e.g., `USER` and `USER_PROFILE`). Use a foreign key in one of the tables.
- **One-to-Many (1:N)**: One instance in an entity can be related to many instances in another. (e.g., a `USER` can have many `POSTS`). The "many" side table contains a foreign key referencing the "one" side.
- **Many-to-Many (N:M)**: Instances in one entity can relate to many instances in another, and vice-versa. (e.g., `STUDENT` and `COURSE`). Requires a separate "join" or "junction" table that contains foreign keys to both entities.

## 3. Attribute Selection and Data Types

- **Identify Attributes**: For each entity, list its properties. (e.g., a `Product` has a `name`, `price`, and `description`).
- **Choose Appropriate Data Types**: Select the most efficient data type for each attribute.
    - **`INTEGER` / `BIGINT`**: For whole numbers (e.g., IDs, quantities).
    - **`VARCHAR(n)`**: For variable-length strings with a max length (e.g., names, titles).
    - **`TEXT`**: For long-form text (e.g., blog post content).
    - **`DECIMAL(p, s)` / `NUMERIC`**: For fixed-point numbers where precision is important (e.g., currency).
    - **`BOOLEAN`**: For true/false values.
    - **`TIMESTAMP` / `DATETIME`**: For date and time values.
    - **`UUID`**: For universally unique identifiers.
- **Atomicity**: Attributes should be atomic (indivisible). For example, split a full name into `first_name` and `last_name`.

## 4. Constraint Definition

- **Primary Key (PK)**: Uniquely identifies each record in a table. Usually an auto-incrementing integer (`SERIAL` or `IDENTITY`) or a `UUID`.
- **Foreign Key (FK)**: A key used to link two tables together. It's a field (or collection of fields) in one table that refers to the PRIMARY KEY in another table. Enforces referential integrity.
- **Unique Constraint**: Ensures that all values in a column (or a set of columns) are unique. (e.g., user email).
- **Check Constraint**: Enforces a specific condition on the values in a column. (e.g., `price > 0`).
- **NOT NULL**: Ensures a column cannot have a `NULL` value.

## 5. Denormalization Decisions for Performance

- **Normalization**: The process of organizing columns and tables to minimize data redundancy. (e.g., 1NF, 2NF, 3NF). A normalized schema is the default and best starting point.
- **Denormalization**: The process of intentionally adding redundant data to one or more tables to improve query performance by avoiding costly joins.
- **When to Consider Denormalization**:
    - For read-heavy applications where query performance is critical.
    - When joins are complex and slow down frequent queries.
- **Trade-offs**: Denormalization can lead to faster reads, but slower writes and data anomalies if not managed carefully.
- **Example**: In a social media app, storing a `posts_count` on the `users` table is denormalization. It avoids counting posts with every profile view, but requires updating the count on every new post or deletion.
