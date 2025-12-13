# Monitoring Connection Pools

Effective monitoring is key to identifying performance bottlenecks and preventing connection leaks.

## Key Metrics to Monitor

-   **`pool.size`**: The current size of the connection pool.
-   **`pool.checkedout`**: The number of connections currently in use by your application.
-   **`pool.checkedin`**: The number of connections currently idle in the pool.
-   **`pool.overflow`**: The number of connections currently open beyond the configured `pool.size`.
-   **`pool.wait_time`**: The average time requests are waiting to get a connection from the pool. A high wait time indicates your pool is undersized for your workload.

These metrics are often exposed by database driver libraries or can be tracked using application performance monitoring (APM) tools. SQLAlchemy's pool has an `echo` flag that can be useful for debugging in development.

## Detecting Connection Leaks

A connection leak occurs when your application checks out a connection from the pool but never returns it. Over time, this will exhaust the pool, and your application will hang waiting for connections.

**Symptoms**:
-   `pool.checkedout` grows over time and never decreases, even when traffic is low.
-   Your application eventually times out with "TimeoutError: QueuePool limit of size <x> overflow <y> reached, connection timed out, timeout <z>"

**Debugging**:
1.  **Code Review**: Ensure that every `connection.checkout()` is matched by a `connection.close()` (or that you are using context managers like `with engine.connect() as conn:` which handle this automatically).
2.  **Logging**: Enable logging for connection checkout/check-in to identify the parts of your code that are acquiring connections and not releasing them.
3.  **Use `generate_dashboard_config.py`**: The script in the `scripts/` directory can help you set up a basic text-based dashboard to monitor pool status in real-time.

## Using the `generate_dashboard_config.py` script

This script generates a simple configuration file that you can use with a monitoring tool or a simple script to display the status of your connection pool.

**To run the script:**
```bash
python3 scripts/generate_dashboard_config.py
```

This will output a JSON configuration that you can use to build a dashboard. For example, it might suggest which metrics to plot.

```json
{
  "dashboard_name": "Database Connection Pool",
  "panels": [
    {
      "title": "Pool Connections",
      "type": "graph",
      "metrics": ["pool.checkedout", "pool.checkedin"]
    },
    {
      "title": "Pool Wait Time",
      "type": "graph",
      "metrics": ["pool.wait_time"]
    }
  ]
}
```
This is a conceptual example. The actual script will provide a simple text output.
