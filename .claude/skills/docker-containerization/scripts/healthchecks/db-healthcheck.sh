#!/bin/sh
set -e

# Check if the postgres database is ready to accept connections.
pg_isready -h localhost -p 5432 -U user -d mydatabase || exit 1
