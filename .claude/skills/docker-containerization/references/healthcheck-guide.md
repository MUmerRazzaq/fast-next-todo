# Health Check Guide

A health check is a command run periodically inside a container to determine its health status. This is crucial for orchestrators like Docker Swarm or Kubernetes to manage containers effectively, for example by restarting unhealthy containers or by waiting for a dependency to be ready.

Health checks are configured in the Dockerfile using the `HEALTHCHECK` instruction or in `docker-compose.yml` under the service definition.

## Table of Contents
- [Configuring Healthchecks](#configuring-healthchecks)
- [Healthcheck Options](#healthcheck-options)
- [Healthcheck for a Web Service](#healthcheck-for-a-web-service)
- [Healthcheck for a Database](#healthcheck-for-a-database)
- [Using Healthchecks with depends_on](#using-healthchecks-with-depends_on)

## Configuring Healthchecks

### In a Dockerfile
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1
```

### In `docker-compose.yml`
```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
```

## Healthcheck Options

- `test`: The command to run to check for health. It can be a simple command or a script. The command's exit code determines the health status:
    - `0`: success - the container is healthy and ready for use
    - `1`: unhealthy - the container is not working correctly
    - `2`: reserved - do not use this exit code
- `interval`: The time to wait between running the check (default: 30s).
- `timeout`: The time to wait for the check to complete (default: 30s).
- `retries`: The number of consecutive failures needed to consider the container unhealthy (default: 3).
- `start_period`: The time to wait for the container to bootstrap before starting health checks (default: 0s). Failures during the start period don't count towards the `retries` count.

## Healthcheck for a Web Service

For a web service, a simple health check can be a `curl` or `wget` command to an health endpoint (e.g., `/health`). This endpoint should return a `200 OK` status if the service is healthy.

A sample script is available at `scripts/healthchecks/web-healthcheck.sh`.

## Healthcheck for a Database

For a database like PostgreSQL, you can use a command-line tool to check its status. For example, `pg_isready` checks if a PostgreSQL server is ready to accept connections.

A sample script is available at `scripts/healthchecks/db-healthcheck.sh`.

## Using Healthchecks with depends_on

In `docker-compose.yml`, you can use `depends_on` with the `service_healthy` condition to ensure a service is healthy before starting another service that depends on it.

```yaml
services:
  backend:
    build: ./backend
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
```
In this example, the `backend` service will only start after the `db` service is reported as healthy.
