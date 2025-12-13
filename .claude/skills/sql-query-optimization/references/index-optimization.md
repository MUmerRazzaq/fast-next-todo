# Index Optimization Guide

Indexes are the most effective way to improve query performance. This guide covers how to identify the need for indexes and how to create effective ones.

## Identifying the Need for an Index

Look for these signs in your `EXPLAIN ANALYZE` output:

1.  **`Seq Scan` on a large table with a `Filter` clause**:
    ```
    ->  Seq Scan on users (cost=0.00..5000.00 rows=10 width=100)
          Filter: (email = 'test@example.com')
    ```
    If the `users` table is large and the query is selective (returns few rows), a sequential scan is inefficient. An index on the `email` column would allow a much faster `Index Scan`.

2.  **`Nested Loop` join where the inner table is being scanned repeatedly**: If the inner loop of a `Nested Loop` join is a `Seq Scan` on a large table, an index on the join key is needed.

## How to Recommend an Index

1.  **Identify Candidate Columns**: The best candidates for indexes are columns that appear frequently in:
    *   `WHERE` clauses (especially with selective operators like `=`, `IN`)
    *   `JOIN` conditions (`ON` clause)
    *   `ORDER BY` clauses (to avoid a `Sort` step)

2.  **Check Column Selectivity**: An index is most effective when it can quickly narrow down the number of rows to be processed. A column with high cardinality (many unique values, like a primary key) is a good candidate. A column with low cardinality (few unique values, like a boolean status) is generally a poor candidate for a standard B-Tree index on its own.

3.  **Consider Composite Indexes**: If your queries often filter on multiple columns, a composite (or multi-column) index can be very effective.
    *   **Query**: `SELECT * FROM users WHERE last_name = 'Smith' AND first_name = 'John';`
    *   **Good Index**: `CREATE INDEX ON users (last_name, first_name);`
    *   **Column Order Matters**: The order of columns in the index should match the order in your queries. Put the most selective columns first. An index on `(a, b)` can be used for queries on `a` and queries on `a` and `b`, but not for queries only on `b`.

4.  **Covering Indexes**: If a query can be answered entirely from an index without visiting the table itself, it's called a covering index. This provides a significant performance boost.
    *   **Query**: `SELECT user_id, created_at FROM orders WHERE customer_id = 123;`
    *   **Covering Index**: `CREATE INDEX ON orders (customer_id) INCLUDE (user_id, created_at);`
    *   The `INCLUDE` clause adds columns to the index without making them part of the search key, which is more efficient.

5.  **Partial Indexes**: If you frequently query a specific subset of a table, a partial index can be very small and efficient.
    *   **Query**: `SELECT * FROM orders WHERE shipped_at IS NULL;`
    *   **Partial Index**: `CREATE INDEX ON orders (order_id) WHERE shipped_at IS NULL;`

## Writing the Index Recommendation

When recommending an index, provide:
1.  **The `CREATE INDEX` statement**.
2.  **The reasoning**: Explain *why* the index is needed, referencing the `EXPLAIN` plan (e.g., "This index will replace the costly `Seq Scan` on the `users` table with an efficient `Index Scan`").
3.  **The expected impact**: Briefly describe the performance improvement you expect (e.g., "This should significantly reduce query latency for lookups by email.").

### Example Recommendation

**Recommendation**: Add a composite index on the `orders` table.

**Statement**:
```sql
CREATE INDEX orders_customer_id_order_date_idx ON orders (customer_id, order_date);
```

**Reasoning**:
The current query plan shows a `Seq Scan` on the `orders` table when filtering by `customer_id`. Adding this index will allow the planner to use a much faster `Index Scan`, especially since `customer_id` is a highly selective column. The `order_date` is included to support sorting and range queries on that column within a customer's orders.
