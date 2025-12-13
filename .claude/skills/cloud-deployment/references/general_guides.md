# General Deployment Guides

This file contains guides for common tasks that apply across multiple platforms.

## Environment Variable Setup

Environment variables are used to manage secrets and configuration without hardcoding them. All platforms support them through a web dashboard or CLI.

**Best Practices:**
-   **Never commit secrets** to Git. Use environment variables.
-   Create a `.env.example` file in your repository listing the required variables, but with placeholder values.
-   For local development, use a `.env` file (and add `.env` to `.gitignore`).

**Platform specifics:**
-   **Vercel**: Project Settings > Environment Variables.
-   **Railway**: Service > Variables. Or `railway variables set KEY=VALUE`.
-   **Render**: Service > Environment.
-   **Fly.io**: `flyctl secrets set KEY=VALUE`.

## Database Connection

Your deployed application needs to connect to a database. The connection string is usually stored in an environment variable (e.g., `DATABASE_URL`).

**Example (Node.js with Prisma):**

Your `schema.prisma` would have:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Your code would then use Prisma Client as usual. The `DATABASE_URL` would be set in your deployment platform's environment variables.

**Connection Pooling:**
For serverless environments (like Vercel), it's critical to use a connection pooler like PgBouncer or the one provided by your database host (e.g., Neon, Vercel Postgres, Railway Postgres) to avoid exhausting database connections.

## Custom Domain Configuration

All platforms allow you to use a custom domain. The general process is:

1.  **Add the domain** in your platform's dashboard (e.g., Vercel > Project > Domains).
2.  **Configure DNS records**. The platform will give you DNS records (usually `A`, `CNAME`, or `ALIAS`) to add at your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare).
3.  **Wait for DNS propagation**. This can take a few minutes to several hours.

## SSL/TLS Certificate Setup

All the platforms in this guide (**Vercel, Railway, Render, Fly.io**) provide **automatic SSL/TLS certificates** for custom domains. Once your DNS is configured correctly, they will automatically provision and renew a certificate (usually from Let's Encrypt) for you. You typically do not need to do any manual setup for SSL.
