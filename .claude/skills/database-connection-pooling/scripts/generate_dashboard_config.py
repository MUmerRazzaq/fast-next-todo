import json

def generate_config():
    """
    Generates a conceptual dashboard configuration for monitoring
    a database connection pool.
    """
    config = {
        "dashboard_name": "Database Connection Pool Monitoring",
        "description": "Key metrics for monitoring the health and performance of the SQLAlchemy connection pool.",
        "panels": [
            {
                "title": "Active vs. Idle Connections",
                "type": "timeseries",
                "targets": [
                    {
                        "query": "app.database.pool.checkedout",
                        "legend": "Active Connections"
                    },
                    {
                        "query": "app.database.pool.checkedin",
                        "legend": "Idle Connections"
                    }
                ],
                "description": "Tracks the number of connections actively in use versus those idle in the pool. A high number of active connections might indicate a need to scale the pool."
            },
            {
                "title": "Pool Overflow",
                "type": "stat",
                "target": {
                    "query": "app.database.pool.overflow",
                    "legend": "Overflow Connections"
                },
                "description": "The number of connections created beyond the configured pool_size. Frequent overflow indicates the pool is undersized."
            },
            {
                "title": "Connection Wait Time (Avg)",
                "type": "timeseries",
                "target": {
                    "query": "avg(app.database.pool.wait_time)",
                    "legend": "Average Wait Time"
                },
                "description": "The average time a request waits for a connection. High wait times are a primary indicator of a connection pool bottleneck."
            },
            {
                "title": "Connection Errors",
                "type": "stat",
                "target": {
                    "query": "sum(app.database.pool.connection_errors)",
                    "legend": "Total Errors"
                },
                "description": "Tracks the number of errors encountered when trying to establish connections. Useful for detecting network issues or database downtime."
            }
        ]
    }
    print(json.dumps(config, indent=2))

if __name__ == "__main__":
    generate_config()
