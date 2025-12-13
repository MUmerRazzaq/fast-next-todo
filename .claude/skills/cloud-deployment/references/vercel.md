# Vercel Deployment Guide

This guide provides instructions for deploying to Vercel.

## 1. Configuration (`vercel.json`)

Vercel can often deploy projects with zero configuration. However, for more control, you can use a `vercel.json` file. A template is available at `assets/vercel.json`.

**Key Properties:**
- `builds`: Specifies how to build your application source code. The `use` property defines the builder (e.g., `@vercel/node` for Node.js).
- `routes`: Defines how incoming requests are routed to your builds.

## 2. Deployment Checklist

1.  [ ] Ensure your project has a `package.json` with a `build` script if you have a build step (e.g., for TypeScript or a static site generator).
2.  [ ] For Node.js backends, ensure there is an entry point file that starts a server. Vercel automatically detects this.
3.  [ ] Create a Vercel account and link your Git repository (GitHub, GitLab, Bitbucket).
4.  [ ] Add environment variables through the Vercel project dashboard.
5.  [ ] Push your code to the main branch to trigger a production deployment.

## 3. CI/CD Integration

Vercel's CI/CD is automatic with Git integration:
- Every `git push` to a branch generates a **Preview Deployment**.
- Every push or merge to the **main** branch generates a **Production Deployment**.

## 4. Rollback Procedure

Vercel makes rollbacks easy from the project dashboard:

1.  Navigate to the "Deployments" tab of your project.
2.  You will see a list of all past deployments.
3.  Find the deployment you want to restore.
4.  Click the "..." menu on the right and select "**Promote to Production**".

This instantly makes the selected deployment the new production version.
