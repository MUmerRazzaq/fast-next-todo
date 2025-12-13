# Efficient Pagination

Paginating through large result sets is a common requirement. The traditional `LIMIT` / `OFFSET` approach has significant performance problems at scale.

## The Problem with `OFFSET`

A query using `OFFSET` looks like this:
```sql
SELECT * FROM events
ORDER BY created_at DESC
LIMIT 20 OFFSET 40;
```
To fulfill this query, the database must:
1.  Scan and sort all the rows by `created_at`.
2.  Count and discard the first 40 rows.
3.  Return the next 20 rows.

When `OFFSET` is large (e.g., you're on page 10,000, so the offset is 200,000), the database still has to fetch and process all 200,000 rows from disk just to throw them away. This gets progressively slower as the page number increases.

The `EXPLAIN` plan will show a large number of rows being processed by the `Sort` or `Index Scan` node, even though only a few are returned.

## Solution: Keyset / Cursor-Based Pagination

A much more efficient method is keyset pagination, also known as "cursor-based" pagination. Instead of telling the database how many rows to skip, you tell it *where* you left off on the previous page.

This requires a stable, unique ordering key (or combination of keys). A timestamp column like `created_at` and a unique `id` are a perfect combination.

### How it Works

1.  **First Page**:
    ```sql
    SELECT * FROM events
    ORDER BY created_at DESC, id DESC
    LIMIT 20;
    ```
    You get the first 20 events. Your application records the `created_at` and `id` of the *last* event in the result set. Let's say it was `(2023-10-26 10:00:00, 12345)`.

2.  **Second Page**:
    You use the values from the last row of the previous page in a `WHERE` clause to fetch the next "slice" of data.
    ```sql
    SELECT * FROM events
    WHERE (created_at, id) < ('2023-10-26 10:00:00', 12345)
    ORDER BY created_at DESC, id DESC
    LIMIT 20;
    ```

### Why It's Faster

This query is extremely fast because:
1.  It requires an index on `(created_at, id)`.
2.  The database can use the index to jump directly to the correct starting point.
3.  It only needs to read the 20 rows it's going to return, not the thousands or millions of rows it would have to discard with `OFFSET`.

The `EXPLAIN` plan will show an `Index Scan` that returns exactly the number of rows in your `LIMIT` clause.

### Implementation Details

*   **Stable Ordering**: You must `ORDER BY` a column or set of columns that are unique. If you only order by `created_at`, and multiple events have the exact same timestamp, the ordering between those events is not guaranteed, which can lead to skipped or duplicate rows between pages. Adding a unique key like `id` as a tie-breaker solves this. `ORDER BY created_at DESC, id DESC`.
*   **Index**: You need a composite index that matches your `ORDER BY` clause. For the example above, the ideal index is:
    ```sql
    CREATE INDEX ON events (created_at DESC, id DESC);
    ```
*   **Client-side**: The client needs to receive the "cursor" (the values from the last row) from the server and send it back when requesting the next page.

Keyset pagination is the most scalable way to paginate through large datasets.
