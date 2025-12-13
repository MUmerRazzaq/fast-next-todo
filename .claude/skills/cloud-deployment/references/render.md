# Render Deployment Guide

This guide provides instructions for deploying to Render.

## 1. Configuration (`render.yaml`)

Render uses a `render.yaml` file to define your services as "Infrastructure as Code". A template is available at `assets/render.yaml`.

**Key Properties:**
- `services`: An array of services to deploy.
  - `type`: `web` for a web server, `worker` for a background job, etc.
  - `name`: A name for your service.
  - `env`: The environment (e.g., `node`, `python`).
  - `buildCommand`: Command to build the service.
  - `startCommand`: Command to start the service.

## 2. Deployment Checklist

1.  [ ] Create a Render account.
2.  [ ] Create a new "Blueprint Instance" and link your Git repository.
3.  [ ] Render will automatically detect and use your `render.yaml` file.
4.  [ ] Add environment variables and secrets in your service's "Environment" tab on the Render dashboard.

## 3. CI/CD Integration

Render automatically deploys on every push to your connected Git repository's main branch. You can disable this in your service settings if you prefer manual deploys.

## 4. Rollback Procedure

Render supports one-click rollbacks:

1.  Go to your service's page on the Render dashboard.
2.  Click the "Manual Deploy" button.
3.  Select "Deploy a specific commit" from the dropdown.
4.  Choose the commit you want to roll back to and click "Deploy".
