#!/bin/sh
set -e

# Check if the web service is healthy by sending a request to the /health endpoint.
curl -f http://localhost:8000/health || exit 1
