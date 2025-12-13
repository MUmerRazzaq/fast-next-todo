# Fly.io Deployment Guide

This guide provides instructions for deploying to Fly.io.

## 1. Configuration (`fly.toml` and `Dockerfile`)

Fly.io uses a `fly.toml` file for configuration and requires your application to be containerized with a `Dockerfile`. A template `fly.toml` is in `assets/fly.toml`.

**`fly.toml` Key Properties:**
- `app`: The name of your application.
- `build`: Specifies the build strategy (usually Docker).
- `http_service`: Configures the public-facing service, including internal port and HTTPS settings.

**`Dockerfile`:**
You must provide a `Dockerfile` that packages your application. For a Node.js app, it might look like:
```Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
```

## 2. Deployment Checklist

1.  [ ] Create a Fly.io account.
2.  [ ] Install the Fly.io CLI: `curl -L https://fly.io/install.sh | sh`.
3.  [ ] Log in with `flyctl auth login`.
4.  [ ] Launch a new app with `flyctl launch`. This will generate a `fly.toml` for you.
5.  [ ] Add secrets (environment variables) using `flyctl secrets set KEY=VALUE`.
6.  [ ] Deploy with `flyctl deploy`.

## 3. CI/CD Integration

You can deploy to Fly.io from GitHub Actions. The `flyctl launch` command can generate a starter `main.yml` file for you. It typically involves:
1.  Checking out the code.
2.  Setting up the `flyctl` CLI.
3.  Running `flyctl deploy` with a `FLY_API_TOKEN` secret.

## 4. Rollback Procedure

Fly.io deployments create new "releases". You can roll back to a previous release:

1.  List releases with `flyctl releases`.
2.  Note the version number of the release you want to roll back to (e.g., `v10`).
3.  Deploy that specific release: `flyctl deploy --image my-app:deployment-01H8X...` (get the image from the releases list) or by re-deploying a specific git commit if using CI/CD.

A simpler way for stateless apps is to just re-deploy the older commit from your git history.
