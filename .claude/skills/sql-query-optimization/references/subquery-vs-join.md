# Subquery vs. JOIN Performance

Both subqueries and `JOIN`s can be used to combine data from multiple tables, but they have different performance characteristics. Modern SQL planners are very good at optimizing both, but understanding the difference can help you write more performant queries.

## Types of Subqueries

1.  **Scalar Subquery**: Returns a single value (one row, one column). Often used in `SELECT` lists or `WHERE` clauses.
    ```sql
    SELECT
      o.id,
      (SELECT c.name FROM customers c WHERE c.id = o.customer_id) AS customer_name
    FROM orders o;
    ```

2.  **Multi-row Subquery**: Returns multiple rows. Often used with operators like `IN`, `NOT IN`, `ANY`, `ALL`.
    ```sql
    SELECT *
    FROM products
    WHERE id IN (SELECT product_id FROM line_items WHERE quantity > 100);
    ```

3.  **Correlated Subquery**: An inner query that depends on the outer query for its values. The subquery is re-evaluated for each row processed by the outer query. This can be very inefficient. The scalar subquery example above is a correlated subquery.

## Performance Comparison

In older versions of SQL databases, `JOIN`s were almost always faster than subqueries because the database had more information to optimize the entire query at once. Correlated subqueries were particularly slow.

Today, PostgreSQL's query planner is very sophisticated. It will often rewrite a subquery as a `JOIN` internally if it determines that's more efficient. For example, it will often transform a `WHERE ... IN (SELECT ...)` into a `JOIN`.

**General Rule of Thumb:**
*   **Prefer `JOIN`s for readability and performance.** A `JOIN` often expresses the relationship between tables more clearly.
*   **Be very cautious with correlated subqueries.** If you have a correlated subquery, see if it can be rewritten as a `JOIN`.

## Rewriting a Correlated Subquery as a `JOIN`

Let's take the correlated subquery example from before, which gets the customer name for each order.

**Correlated Subquery (Potentially Slow):**
```sql
SELECT
  o.id,
  (SELECT c.name FROM customers c WHERE c.id = o.customer_id) AS customer_name
FROM orders o;
```
For each order, this runs a separate lookup on the `customers` table.

**Equivalent `JOIN` (Often Faster):**
```sql
SELECT
  o.id,
  c.name AS customer_name
FROM
  orders o
LEFT JOIN
  customers c ON o.customer_id = c.id;
```
The `JOIN` allows the database to read both tables and combine them in one pass, which is usually much more efficient.

## When to Use a Subquery

Subqueries are not always bad. They can be very useful and sometimes more readable.

1.  **`WHERE ... IN`**: Using `IN` with a subquery is often clear and the planner is good at optimizing it.
    ```sql
    SELECT * FROM posts WHERE author_id IN (SELECT id FROM users WHERE status = 'active');
    ```

2.  **`EXISTS`**: Using `EXISTS` with a subquery is often more performant than `IN` or `JOIN` when you only need to check for the existence of related rows, not retrieve them. The database can stop as soon as it finds one matching row.
    ```sql
    SELECT *
    FROM users u
    WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);
    -- This is often faster than a JOIN if you don't need any data from `orders`.
    ```

3.  **Complex Aggregations**: Subqueries in the `FROM` clause (derived tables) are very useful for performing multi-step aggregations.
    ```sql
    SELECT
      daily_cohort.cohort_date,
      AVG(daily_cohort.daily_revenue)
    FROM (
      SELECT
        DATE(created_at) AS cohort_date,
        SUM(revenue) AS daily_revenue
      FROM users
      GROUP BY DATE(created_at)
    ) AS daily_cohort
    GROUP BY daily_cohort.cohort_date;
    ```

## Conclusion

*   Modern PostgreSQL is smart about optimizing subqueries.
*   However, `JOIN`s are often more explicit and can be easier for the planner to optimize.
*   **Always rewrite correlated subqueries as `JOIN`s if possible.**
*   Use `EXPLAIN` to see how the database is actually executing your query. You might find that your subquery has already been converted to a `JOIN` behind the scenes.
