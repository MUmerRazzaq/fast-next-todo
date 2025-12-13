# Query Result Caching Patterns

When even a fully optimized query is still too slow, or when the same data is requested very frequently, caching can be an effective strategy to improve performance and reduce database load.

## 1. Application-Level Caching

This is the most common form of caching. The application logic is responsible for storing and retrieving results from a cache (like Redis or Memcached).

**Workflow:**
1.  **Check Cache**: Before running a query, the application checks if the result is already in the cache for a given key.
2.  **Cache Hit**: If the data is in the cache, return it directly without hitting the database.
3.  **Cache Miss**: If the data is not in the cache, run the query against the database, store the result in the cache with a specific Time-To-Live (TTL), and then return the result.

**Example (Pseudocode with Redis):**
```
function get_user_dashboard(user_id):
  cache_key = "dashboard:" + user_id
  cached_data = redis.get(cache_key)

  if cached_data is not None:
    return cached_data
  else:
    db_data = run_query("SELECT ... FROM ... WHERE user_id = " + user_id)
    // Store in cache for 5 minutes
    redis.set(cache_key, db_data, ttl=300)
    return db_data
```

**Pros:**
*   Very flexible. Can be applied to any query.
*   Can significantly reduce database load for frequently accessed data.

**Cons:**
*   **Cache Invalidation**: This is the hardest problem in computer science. When the underlying data changes, how do you ensure the cache is updated or removed?
    *   **TTL-based invalidation**: Simple, but can serve stale data until the TTL expires.
    *   **Explicit invalidation**: More complex. When data is updated (e.g., a user updates their profile), the application code must explicitly delete the relevant cache keys. This can be hard to manage.

## 2. Database-Level Caching (Materialized Views)

For complex, expensive queries that don't need to be perfectly real-time (like reporting dashboards), a materialized view can be a powerful tool.

A materialized view is a database object that contains the results of a query. It's like a pre-computed table.

**How it works:**
1.  **Create the Materialized View**: You define the view with your expensive query.
    ```sql
    CREATE MATERIALIZED VIEW daily_sales_summary AS
    SELECT
      DATE(order_date) AS sale_date,
      SUM(total) AS total_sales,
      COUNT(*) AS number_of_orders
    FROM orders
    GROUP BY DATE(order_date);
    ```
    This creates a new object `daily_sales_summary` that stores the result.

2.  **Query the View**: Queries against the materialized view are extremely fast because all the work has already been done.
    ```sql
    -- This is very fast!
    SELECT * FROM daily_sales_summary WHERE sale_date > '2023-10-01';
    ```

3.  **Refresh the View**: The data in the materialized view does not update automatically. You must explicitly refresh it.
    ```sql
    -- This re-runs the original query and updates the view.
    REFRESH MATERIALIZED VIEW daily_sales_summary;
    ```
    You can run this on a schedule (e.g., every hour) using a cron job or a database scheduler like `pg_cron`.

**Pros:**
*   Moves the caching logic into the database.
*   Massively improves performance for complex aggregation queries.
*   Data is always consistent within the view until the next refresh.

**Cons:**
*   Data is only as fresh as the last refresh. Not suitable for real-time data.
*   The refresh process itself can be resource-intensive.

## When to Use Caching

*   When a query has been fully optimized (indexes, joins, etc.) but is still not fast enough.
*   When the same data is read much more frequently than it is written.
*   When slightly stale data is acceptable to the application.
