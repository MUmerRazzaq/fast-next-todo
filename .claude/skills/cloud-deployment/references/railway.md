# Railway Deployment Guide

This guide provides instructions for deploying to Railway.

## 1. Configuration (`railway.json`)

Railway uses a `railway.json` file to define how to build and deploy your application. A template is available at `assets/railway.json`.

**Key Properties:**
- `build`: Defines the build process. `NIXPACKS` is the default and automatically detects your environment.
- `deploy`: Specifies the start command and restart policies.

## 2. Deployment Checklist

1.  [ ] Create a Railway account and a new project.
2.  [ ] Install the Railway CLI: `npm i -g @railway/cli`.
3.  [ ] Log in with `railway login`.
4.  [ ] Link your project with `railway link`.
5.  [ ] Add environment variables using `railway variables set KEY=VALUE`.
6.  [ ] Deploy with `railway up`.

## 3. CI/CD Integration

Railway can deploy automatically from a GitHub repository.

1.  Link your GitHub repository in the project's settings.
2.  Pushes to the main branch will automatically trigger a new deployment.

You can also use the Railway CLI in your own CI/CD pipeline (e.g., GitHub Actions) by running `railway up --detach`.

## 4. Rollback Procedure

Railway allows you to redeploy any previous deployment:

1.  Navigate to your service's "Deployments" tab in the Railway dashboard.
2.  You will see a list of all deployments.
3.  Click the "Redeploy" button on the deployment you wish to restore.
