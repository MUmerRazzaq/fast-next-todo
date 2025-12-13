# SQLAlchemy Connection Pooling Configuration

This guide provides best practices for configuring SQLAlchemy connection pooling for traditional, server-based database deployments.

## Engine Configuration

The primary way to configure connection pooling is through `create_engine`.

```python
from sqlalchemy import create_engine

# Example for PostgreSQL
db_url = "postgresql://user:password@host:port/dbname"

engine = create_engine(
    db_url,
    pool_size=10,
    max_overflow=20,
    pool_recycle=3600, # In seconds
    pool_pre_ping=True
)
```

### Key Parameters:

*   **`pool_size`**: The number of connections to keep open in the pool. This is the core size of your pool.
*   **`max_overflow`**: The number of extra connections that can be opened beyond `pool_size`. These connections are temporary and are discarded when they are returned to the pool.
*   **`pool_recycle`**: The maximum age of a connection in seconds. Connections older than this will be replaced with a new one. This is crucial for preventing issues with database or network infrastructure dropping idle connections. A value of 3600 (1 hour) is a common starting point.
*   **`pool_pre_ping`**: If `True`, SQLAlchemy will issue a simple query (e.g., `SELECT 1`) on a connection before it's checked out from the pool. This "ping" tests the connection's viability and replaces it if it's broken. This prevents your application from getting a stale connection. It has a small performance overhead but provides high reliability.

## Calculating Pool Size

A common formula for calculating `pool_size` in a web application is:

**`pool_size` = (Number of Web Servers \* Number of Worker Processes Per Server \* Number of Threads Per Worker) + (small buffer)**

For example, with 2 web servers, each running 4 Gunicorn worker processes (which are single-threaded):
`pool_size` = (2 * 4 * 1) = 8.

You might set `pool_size=10` and `max_overflow=20` to handle spikes in traffic.

**Important**: Your database's `max_connections` setting must be greater than the total number of connections from all your application servers.

## Health Checks and Connection Lifecycle

`pool_pre_ping=True` is the simplest and most effective health check mechanism.

For more complex scenarios, you can use pool events to implement custom logic.

```python
from sqlalchemy import event
from sqlalchemy.engine import Engine

@event.listens_for(Engine, "connect")
def connect(dbapi_connection, connection_record):
    """
    This event is triggered when a new connection is established.
    You could set session-level parameters here.
    """
    cursor = dbapi_connection.cursor()
    try:
        cursor.execute("SELECT 1") # A simple health check
    finally:
        cursor.close()

```
