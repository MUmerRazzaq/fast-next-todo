# Connection Pooling for Serverless Databases

Serverless databases like Neon and PlanetScale have architectures that can be sensitive to high connection counts. Traditional connection pooling strategies must be adapted for these environments.

## The Challenge with Serverless

- **Connection Limits**: Serverless database instances often have lower concurrent connection limits compared to traditional dedicated servers.
- **Stateless Compute**: Your application might run on a serverless platform (like AWS Lambda or Vercel Functions), where each invocation can create a new database connection, quickly exhausting limits.
- **Idle Connections**: Serverless databases may charge for idle connection uptime.

## General Best Practices

1.  **Use a Transaction Pooler**: The most robust solution is to use an external connection pooler like **PgBouncer** (for Postgres-compatible databases like Neon) or the built-in proxy for PlanetScale. The pooler sits between your application and the database, managing a small number of connections to the database while accepting many connections from your application.
2.  **Keep Application-Side Pools Small**: If you are using an application-side pool (like SQLAlchemy's), keep it very small.
    *   `pool_size`: 1 to 5
    *   `max_overflow`: 1 to 10
3.  **Short `pool_recycle`**: Recycle connections frequently to avoid them being terminated by the serverless infrastructure. A value of 60-300 seconds (1-5 minutes) is a good starting point.
4.  **Disable `pool_pre_ping` if using PgBouncer**: If you are using PgBouncer in transaction or session mode, `pool_pre_ping` can be redundant or even problematic.

## Configuration for Neon (PostgreSQL)

Neon recommends using **PgBouncer**. You can often get the PgBouncer connection string directly from your Neon dashboard.

If you must connect directly from a serverless function without an external pooler, use a configuration optimized for short-lived connections.

```python
from sqlalchemy import create_engine

# Unpooled connection for very short-lived functions (e.g. AWS Lambda)
# This creates and destroys a connection on each checkout.
from sqlalchemy.pool import NullPool
engine = create_engine(db_url, poolclass=NullPool)


# Small pool for environments with some persistence
engine = create_engine(
    db_url,
    pool_size=1,
    max_overflow=5,
    pool_recycle=280, # ~4.5 minutes
    pool_pre_ping=True
)
```

## Configuration for PlanetScale (MySQL-compatible)

PlanetScale has a highly available proxy layer that handles connection pooling. Your application should be configured to create connections as needed and close them quickly.

- There is no need for an external pooler like PgBouncer.
- `pool_recycle` is important. PlanetScale recommends a value less than their default timeout.
- Use `pool_pre_ping=True`.

```python
# Recommended settings for PlanetScale
engine = create_engine(
    db_url,
    pool_size=5,
    max_overflow=10,
    pool_recycle=28800, # PlanetScale's default timeout is 8 hours
    pool_pre_ping=True,
    connect_args={
        "ssl": {
            # Your SSL config here if needed, often managed by platform
        }
    }
)
```
