# SQL Query Optimization Checklist

Follow these steps to systematically analyze and optimize a SQL query.

1.  **Understand the Business Requirement**
    *   What is the purpose of this query?
    *   What data is it trying to retrieve?
    *   Is all the requested data necessary? Can any columns or joins be removed?

2.  **Establish a Performance Baseline**
    *   Copy `assets/benchmarking-template.md` to a new file (e.g., `benchmarks/my-query-benchmark.md`).
    *   Run the original query with `EXPLAIN ANALYZE`.
    *   Record the execution time and the full query plan in the benchmark file.

3.  **Analyze the `EXPLAIN` Plan**
    *   Read `references/explain-plan-analysis.md` for a guide on interpreting the plan.
    *   Identify the most expensive operations (highest cost and longest execution time).
    *   Look for `Seq Scan` (Sequential Scan) on large tables. This is often a primary target for optimization.
    *   Check the number of rows returned at each step. Are there any steps that return far more rows than expected?

4.  **Check Index Usage**
    *   Read `references/index-optimization.md` for guidance.
    *   Does the query plan use existing indexes effectively? Look for `Index Scan` or `Bitmap Index Scan`.
    *   Are there `Seq Scan`s on tables that could be avoided with a new index?
    *   Are the `WHERE` clauses and `JOIN` conditions covered by indexes?
    *   Propose and create necessary indexes.

5.  **Analyze `JOIN` Performance**
    *   Read `references/join-optimization.md`.
    *   Are the `JOIN` types correct (`INNER`, `LEFT`, `RIGHT`)?
    *   Are the `JOIN` conditions using indexed columns?
    *   Check the join order. Is the database picking an efficient join strategy (e.g., `Hash Join`, `Nested Loop`, `Merge Join`)?

6.  **Look for Common Anti-Patterns**
    *   **N+1 Queries**: Is this query part of a larger operation that is making repeated calls to the database? Read `references/n-plus-one-queries.md`.
    *   **Subquery vs. `JOIN`**: Could a correlated subquery be rewritten as a more efficient `JOIN`? Read `references/subquery-vs-join.md`.
    *   **Inefficient Pagination**: Is the query using `OFFSET` on a large result set? Consider cursor-based pagination. Read `references/pagination.md`.
    *   **Functions on Indexed Columns**: Avoid applying functions to columns in the `WHERE` clause (e.g., `WHERE LOWER(email) = '...'`), as this can prevent index usage.

7.  **Rewrite and Refactor the Query**
    *   Apply optimizations based on the analysis.
    *   Refer to `references/examples.md` for before/after patterns.

8.  **Benchmark the Optimized Query**
    *   Run `EXPLAIN ANALYZE` on the new query.
    *   Update the benchmark file with the new query, execution time, and plan.
    *   Verify that the performance has improved and the results are still correct.

9.  **Consider Caching**
    *   If the query is still too slow or is run very frequently, can the results be cached?
    *   Read `references/caching.md` for caching strategies.
