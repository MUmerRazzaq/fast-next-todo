# Vercel CLI Reference

## Installation

```bash
# npm
npm install -g vercel

# pnpm
pnpm add -g vercel

# yarn
yarn global add vercel
```

---

## Authentication

```bash
# Login (opens browser)
vercel login

# Login with email
vercel login --email

# Login with token (CI/CD)
VERCEL_TOKEN=xxx vercel

# Logout
vercel logout

# Check who you're logged in as
vercel whoami
```

---

## Project Setup

```bash
# Link to existing project (interactive)
vercel link

# Link with specific project
vercel link --project=my-project

# Link all projects in monorepo
vercel link --repo

# Unlink project
vercel unlink

# Create new project
vercel project add my-new-project
```

---

## Deployment

### Basic Deployment

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Deploy specific directory
vercel ./dist

# Deploy with different root
vercel --cwd apps/web
```

### Advanced Deployment

```bash
# Force new deployment (bypass cache)
vercel --force

# Skip build step
vercel --prebuilt

# Set build environment
vercel --build-env NODE_ENV=production

# Set target environment
vercel --target production

# Deploy specific branch
vercel --target preview

# Confirm deployment without prompts
vercel --yes

# Debug mode
vercel --debug

# Archive (no build)
vercel --archive=tgz
```

### Deployment with Custom Settings

```bash
# Custom name
vercel --name my-custom-name

# Custom scope/team
vercel --scope my-team

# Specify regions
vercel --regions iad1,sfo1
```

---

## Environment Variables

### List Variables

```bash
# List all environment variables
vercel env ls

# List for specific environment
vercel env ls production
```

### Add Variables

```bash
# Add interactively
vercel env add

# Add with name and environment
vercel env add DATABASE_URL production

# Add to multiple environments
vercel env add API_KEY production preview

# Add sensitive/encrypted
vercel env add SECRET_KEY production --sensitive

# Add from stdin
echo "my-value" | vercel env add MY_VAR production
```

### Remove Variables

```bash
# Remove from specific environment
vercel env rm MY_VAR production

# Remove from all environments
vercel env rm MY_VAR production preview development
```

### Pull Variables

```bash
# Pull to .env.local
vercel env pull

# Pull to specific file
vercel env pull .env.production

# Pull specific environment
vercel env pull .env.staging --environment=preview
```

---

## Logs & Debugging

```bash
# View deployment logs
vercel logs https://my-project.vercel.app

# View logs for specific deployment
vercel logs dpl_xxxxx

# Follow logs in real-time
vercel logs --follow

# View function logs
vercel logs --since 1h

# Output format
vercel logs --output json
```

---

## Domains

```bash
# List domains
vercel domains ls

# Add domain
vercel domains add example.com

# Add to specific project
vercel domains add api.example.com --scope my-team

# Remove domain
vercel domains rm example.com

# Inspect domain
vercel domains inspect example.com

# Move domain to another project
vercel domains move example.com new-project

# Verify domain
vercel domains verify example.com
```

---

## DNS Management

```bash
# List DNS records
vercel dns ls example.com

# Add DNS record
vercel dns add example.com @ A 76.76.21.21
vercel dns add example.com www CNAME cname.vercel-dns.com
vercel dns add example.com api CNAME my-api.vercel.app

# Remove DNS record
vercel dns rm example.com rec_xxxxx
```

---

## Secrets (Deprecated → Use Env)

```bash
# Note: Secrets are deprecated, use environment variables instead
vercel secrets ls       # Deprecated
vercel env ls           # Use this instead
```

---

## Project Management

```bash
# List projects
vercel project ls

# Add project
vercel project add my-project

# Remove project
vercel project rm my-project

# Inspect project
vercel inspect my-project
```

---

## Deployments

```bash
# List deployments
vercel ls

# List for specific project
vercel ls my-project

# Inspect deployment
vercel inspect https://my-deployment.vercel.app

# Remove deployment
vercel rm https://my-deployment.vercel.app

# Remove all preview deployments
vercel rm my-project --safe

# Alias deployment
vercel alias set https://my-deployment.vercel.app my-alias.vercel.app

# Promote deployment to production
vercel promote https://my-deployment.vercel.app
```

---

## Rollback

```bash
# Promote previous deployment
vercel rollback

# Promote specific deployment
vercel promote https://previous-deployment.vercel.app
```

---

## Teams & Organizations

```bash
# Switch team
vercel switch

# Switch to specific team
vercel switch my-team

# List teams
vercel teams ls

# Invite team member
vercel teams invite email@example.com
```

---

## Local Development

```bash
# Start local development server
vercel dev

# Start on specific port
vercel dev --listen 3001

# Start with debug mode
vercel dev --debug
```

---

## CI/CD Commands

### GitHub Actions Example

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Required Environment Variables for CI

```bash
VERCEL_TOKEN=xxx           # Personal access token
VERCEL_ORG_ID=team_xxx     # Organization/team ID
VERCEL_PROJECT_ID=prj_xxx  # Project ID
```

Get IDs from `.vercel/project.json` after running `vercel link`.

---

## Configuration Commands

```bash
# Pull vercel.json from project
vercel pull

# Pull and build locally
vercel pull && vercel build

# Build without deploying
vercel build

# Build for production
vercel build --prod
```

---

## Certs (SSL)

```bash
# List certificates
vercel certs ls

# Issue certificate
vercel certs issue example.com

# Remove certificate
vercel certs rm example.com
```

---

## Bisect (Find Breaking Deployment)

```bash
# Start bisect
vercel bisect

# Bisect with specific range
vercel bisect --good dpl_good --bad dpl_bad
```

---

## Common Command Patterns

### Full Production Deploy

```bash
vercel --prod --yes
```

### Deploy Monorepo App

```bash
cd apps/web && vercel --prod
```

### Quick Debug

```bash
vercel logs --follow
```

### Reset and Redeploy

```bash
vercel --force --prod
```

### CI Deploy with Token

```bash
VERCEL_TOKEN=$TOKEN vercel --prod --yes
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error |
| 2 | Invalid input |

---

## Global Options

| Option | Description |
|--------|-------------|
| `--cwd` | Set working directory |
| `--debug` | Enable debug output |
| `--global-config` | Path to global config |
| `--local-config` | Path to local config |
| `--no-color` | Disable color output |
| `--scope` | Team/org scope |
| `--token` | Auth token |
| `-h, --help` | Show help |
| `-v, --version` | Show version |
| `-y, --yes` | Skip confirmations |
