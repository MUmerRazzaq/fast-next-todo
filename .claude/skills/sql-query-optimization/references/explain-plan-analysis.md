# Analyzing `EXPLAIN` Plans in PostgreSQL

The `EXPLAIN` command shows the execution plan that the PostgreSQL planner generates for a given statement. `EXPLAIN ANALYZE` executes the query and shows the actual run times and other statistics.

## How to Read the Output

The output is a tree of plan nodes. Each node represents one operation.

```
->  Hash Join  (cost=4.56..7.94 rows=51 width=24) (actual time=0.084..0.122 rows=50 loops=1)
      Hash Cond: (t2.id = t1.t2_id)
      ->  Seq Scan on t2  (cost=0.00..2.51 rows=151 width=12) (actual time=0.012..0.024 rows=151 loops=1)
      ->  Hash  (cost=3.25..3.25 rows=105 width=12) (actual time=0.051..0.051 rows=105 loops=1)
            ->  Seq Scan on t1  (cost=0.00..3.25 rows=105 width=12) (actual time=0.008..0.021 rows=105 loops=1)
```

For each node, you'll see:
*   **`cost`**: The planner's estimate of the cost. The first number is the startup cost, the second is the total cost. It's a unitless number.
*   **`rows`**: The estimated number of rows the operation will output.
*   **`width`**: The estimated average width of a row in bytes.
*   **`actual time`**: The actual time taken to execute the node (in milliseconds). The first number is the time to return the first row, the second is the time to return all rows.
*   **`rows`**: The actual number of rows output by the node.
*   **`loops`**: The number of times the node was executed.

**Key things to look for:**
*   **Large discrepancies between estimated `rows` and actual `rows`**: This indicates that the planner's statistics are out of date. Run `ANALYZE your_table;` to update them.
*   **High `cost` or `actual time`**: These are the bottlenecks. Focus your optimization efforts here.

## Common Plan Node Types

*   **`Seq Scan` (Sequential Scan)**: Reads the entire table sequentially. This is often inefficient for large tables if only a small subset of rows is needed. It's a major target for optimization, usually by adding an index.
*   **`Index Scan`**: Uses an index to find rows. This is generally much more efficient than a `Seq Scan` for selective queries.
*   **`Bitmap Heap Scan` / `Bitmap Index Scan`**: A two-phase scan. First, a `Bitmap Index Scan` creates a bitmap of heap pages to visit. Then, a `Bitmap Heap Scan` fetches the rows from the heap pages. This is efficient when multiple indexes can be combined or when the index is not very selective.
*   **`Nested Loop Join`**: Iterates through rows in the outer table and, for each one, scans the inner table. This is efficient when the outer table is small and there is an index on the join key of the inner table.
*   **`Hash Join`**: Builds a hash table of the smaller table in memory and then probes it with rows from the larger table. This is efficient for large tables and when the join condition is an equality check.
*   **`Merge Join`**: Sorts both tables on the join key and then "merges" them. This is efficient if the tables are already sorted or if the sorted output is needed for a subsequent step.
*   **`Sort`**: Sorts the input data. This can be an expensive operation, especially if the data doesn't fit in memory (`work_mem`). If you see a `Sort` node, consider if it can be avoided (e.g., by using an index that provides data in the correct order).
*   **`Aggregate`**: Computes aggregate functions like `COUNT()`, `SUM()`, etc. `HashAggregate` is used for non-ordered aggregation, while `GroupAggregate` is used when the input is already sorted by the grouping key.

## Using `EXPLAIN` options

You can get more information with options:

*   `EXPLAIN (ANALYZE, BUFFERS)`: Shows buffer usage (shared hits, reads, etc.), which helps understand I/O costs.
*   `EXPLAIN (ANALYZE, TIMING)`: Provides per-node timing information. Enabled by default in `ANALYZE`.
*   `EXPLAIN (ANALYZE, VERBOSE)`: Provides more detailed information about the plan.
