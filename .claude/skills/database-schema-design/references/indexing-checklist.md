# Index Recommendation Checklist

Use this checklist to guide your database indexing strategy. Indexes are crucial for query performance but have a cost (slower writes, storage space).

## General Principles

- [ ] **Index for `WHERE` clauses**: Columns frequently used in `WHERE` clauses are primary candidates for indexes.
- [ ] **Index for `JOIN` conditions**: Index the foreign key columns on the "many" side of a relationship. Most database systems do this automatically, but it's good to verify.
- [ ] **Index for `ORDER BY` and `GROUP BY` clauses**: Indexing columns used in sorting and grouping operations can significantly speed them up.

## Index Types

### Single-Column vs. Composite Indexes

- [ ] **Use single-column indexes** for queries that filter on a single column.
- [ ] **Use composite (multi-column) indexes** for queries that filter on multiple columns in the `WHERE` clause.
- [ ] **Order matters in composite indexes**: Place the most selective column (the one with the most unique values) first in the index definition. For example, `(status, created_at)` is better if `status` is more selective. If your queries use `WHERE col1 = 'a' AND col2 > 'b'`, the index should be `(col1, col2)`.

### Covering Indexes

- [ ] **Consider a covering index** if a query's `SELECT`, `WHERE`, and `JOIN` clauses all use columns that are part of the index. This allows the database to answer the query from the index alone, without reading the table data, which is very fast.
- **Example**: For `SELECT email, name FROM users WHERE status = 'active'`, a covering index would be on `(status, email, name)`.

## When to Avoid Indexing

- [ ] **Small tables**: The performance benefit of an index on a very small table is negligible. A full table scan is often faster.
- [ ] **Columns with low cardinality**: Don't index columns with very few unique values (e.g., a boolean or gender column). The index won't be very selective.
- [ ] **Write-heavy tables**: Every index you add slows down `INSERT`, `UPDATE`, and `DELETE` operations, as the index must also be updated. Be mindful of this trade-off.
- [ ] **Large text columns**: Indexing `TEXT` or `BLOB` columns is generally not effective. Consider full-text search for these.

## Maintenance and Analysis

- [ ] **Analyze query plans**: Use `EXPLAIN` (or similar commands) to see if the database is actually using the indexes you've created.
- [ ] **Monitor for unused indexes**: Periodically check for and remove indexes that are no longer used by any queries. They still consume resources.
- [ ] **Re-evaluate your indexing strategy** as your application's query patterns change.
