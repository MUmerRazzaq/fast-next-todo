# Performance Benchmark: [Brief Description of Query]

## 1. Baseline Performance

*   **Date**: YYYY-MM-DD
*   **Environment**: [e.g., Local, Staging, Production Replica]
*   **Notes**: [e.g., Table sizes, any relevant context]

### Original Query

```sql
-- Paste the original, unoptimized query here
```

### `EXPLAIN ANALYZE` Output (Before)

```
-- Paste the full EXPLAIN ANALYZE output for the original query here
```

### Key Metrics (Before)

*   **Total Execution Time**: [e.g., 1500.25 ms]
*   **Key Bottlenecks**: [e.g., "Seq Scan on `line_items` table takes 1200 ms", "High cost on Nested Loop join"]

---

## 2. Optimization Details

### Changes Made

1.  **[Change 1]**: [e.g., Added an index on `orders.customer_id`]
    *   **Reasoning**: [e.g., To replace a `Seq Scan` with an `Index Scan` during the `JOIN` operation.]
    *   **DDL (if any)**:
        ```sql
        CREATE INDEX orders_customer_id_idx ON orders (customer_id);
        ```

2.  **[Change 2]**: [e.g., Rewrote a correlated subquery to use a `LEFT JOIN`]
    *   **Reasoning**: [e.g., To avoid the N+1 problem of running a subquery for each row.]

### Optimized Query

```sql
-- Paste the new, optimized query here
```

---

## 3. Optimized Performance

### `EXPLAIN ANALYZE` Output (After)

```
-- Paste the full EXPLAIN ANALYZE output for the optimized query here
```

### Key Metrics (After)

*   **Total Execution Time**: [e.g., 50.75 ms]
*   **Improvement**: [e.g., 29.5x faster, reduced from 1500 ms to 50 ms]

## 4. Conclusion & Verification

*   **Summary of Improvement**: The optimizations successfully reduced query latency by replacing an expensive sequential scan with an index scan and eliminating a correlated subquery.
*   **Result Verification**: [Confirm that the optimized query returns the exact same results as the original query. Note any verification steps taken.]
