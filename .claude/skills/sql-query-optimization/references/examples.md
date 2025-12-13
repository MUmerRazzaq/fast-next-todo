# Optimized Query Examples (Before/After)

This document provides concrete before-and-after examples of common query optimizations.

---

### 1. Adding an Index to Avoid a `Seq Scan`

**Scenario**: Find a user by their email address from a large `users` table.

**Before (Slow Query):**
```sql
SELECT * FROM users WHERE email = 'test@example.com';
```
*   **Problem**: Without an index on `email`, PostgreSQL must perform a `Seq Scan`, reading the entire `users` table to find the matching row.
*   **`EXPLAIN` plan shows**: `Seq Scan on users` with a `Filter: (email = 'test@example.com')`

**After (Optimized Query):**
First, create the index:
```sql
CREATE INDEX users_email_idx ON users (email);
```
The query remains the same:
```sql
SELECT * FROM users WHERE email = 'test@example.com';
```
*   **Improvement**: The query planner now uses the new index to perform a highly efficient `Index Scan`, directly locating the desired row without scanning the whole table.
*   **`EXPLAIN` plan shows**: `Index Scan using users_email_idx on users`

---

### 2. Rewriting a Correlated Subquery as a `JOIN`

**Scenario**: Get a list of posts and include the author's name for each post.

**Before (Correlated Subquery):**
```sql
SELECT
  p.title,
  (SELECT u.name FROM users u WHERE u.id = p.author_id) AS author_name
FROM posts p;
```
*   **Problem**: For every single row in `posts`, a separate subquery is executed to fetch the author's name. This is an N+1 query problem.
*   **`EXPLAIN` plan shows**: A subplan being executed for each row of the outer query.

**After (`JOIN`):**
```sql
SELECT
  p.title,
  u.name AS author_name
FROM
  posts p
LEFT JOIN
  users u ON p.author_id = u.id;
```
*   **Improvement**: The `JOIN` allows the database to combine the `posts` and `users` tables in a single pass, drastically reducing the overhead.
*   **`EXPLAIN` plan shows**: A `Hash Join` or `Merge Join`, which is much more efficient than the repeated subquery.

---

### 3. Replacing `OFFSET` with Keyset Pagination

**Scenario**: Paginate through a large feed of events, showing the 100th page.

**Before (`OFFSET`):**
```sql
SELECT * FROM events
ORDER BY created_at DESC
LIMIT 10 OFFSET 990; -- (Page 100, 10 items per page)
```
*   **Problem**: The database has to fetch and sort 1000 rows (`990 + 10`), only to discard the first 990. This gets very slow on high page numbers.
*   **`EXPLAIN` plan shows**: A `Sort` or `Index Scan` node processing many more rows than are returned.

**After (Keyset Pagination):**
Assume the last event on page 99 had `created_at = '2023-01-15 12:00:00'` and `id = 54321`.

```sql
SELECT * FROM events
WHERE (created_at, id) < ('2023-01-15 12:00:00', 54321)
ORDER BY created_at DESC, id DESC
LIMIT 10;
```
*   **Improvement**: This query uses an index on `(created_at, id)` to jump directly to the correct starting point. It only reads the 10 rows it needs to return.
*   **`EXPLAIN` plan shows**: An `Index Scan` with `rows=10`.
*   **Note**: This requires an index: `CREATE INDEX events_created_at_id_idx ON events (created_at DESC, id DESC);`

---

### 4. Using `EXISTS` instead of `COUNT(*)`

**Scenario**: Find all users who have placed at least one order.

**Before (`COUNT(*)` in a subquery):**
```sql
SELECT name FROM users u
WHERE (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) > 0;
```
*   **Problem**: For each user, the subquery has to count *all* of their orders. This is unnecessary work if a user has thousands of orders. We only care if the count is greater than zero.

**After (`EXISTS`):**
```sql
SELECT name FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
```
*   **Improvement**: The `EXISTS` subquery can stop as soon as it finds the *first* matching order for a user, which is much more efficient.
*   **`EXPLAIN` plan shows**: A `Semi-Join`, which is optimized for this type of existence check.
