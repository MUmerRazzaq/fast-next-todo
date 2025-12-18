# Step 3: Database Integration with Prisma & PostgreSQL

`better-auth` is designed to be database-agnostic and uses a powerful adapter system to connect to your database. You must use an adapter to handle the storage of users, sessions, accounts, and other authentication-related data.

This guide provides a complete, step-by-step workflow for setting up `better-auth` with **Prisma** and a **PostgreSQL** database.

## The Modern Workflow: Schema Generation

Instead of requiring you to manually create the database schema, `better-auth` provides a powerful Command Line Interface (CLI) tool that **automatically generates the correct Prisma schema** for you. This is the recommended approach.

This workflow has several benefits:
-   **Accuracy**: The generated schema will perfectly match the requirements of your specific `better-auth` version and any plugins you have installed.
-   **Maintainability**: As you update `better-auth` or add plugins, you can simply re-run the command to update your schema.
-   **Speed**: It saves you from the tedious and error-prone process of manually defining the `User`, `Session`, and `Authenticator` models.

---

## Step-by-Step Guide

### Step 1: Install Dependencies

You need to install Prisma, the Prisma Client, the `better-auth` Prisma adapter, and the `better-auth` CLI tool.

```bash
# Install Prisma CLI as a dev dependency
npm install -D prisma

# Install the client, adapter, and better-auth CLI
npm install @prisma/client @better-auth/adapters/prisma @better-auth/cli
```

### Step 2: Initialize Prisma

Run the Prisma `init` command. This will create a `prisma` directory in your project with a `schema.prisma` file inside.

```bash
npx prisma init
```

### Step 3: Configure `schema.prisma` for PostgreSQL

Open the newly created `prisma/schema.prisma` file and edit the `datasource` block to configure it for PostgreSQL.

The `url` should point to an environment variable, typically `DATABASE_URL`.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // <-- Set the provider to postgresql
  url      = env("DATABASE_URL")
}
```

You also need to set the `DATABASE_URL` in your `.env.local` file. This is the connection string for your PostgreSQL database.

```bash
# .env.local

DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### Step 4: Generate the `better-auth` Schema

This is the key step. Run the `better-auth` CLI `generate` command.

This command will inspect your project, find your `schema.prisma` file, and automatically add all the necessary models (`User`, `Session`, `Authenticator`, etc.) required by `better-auth`.

```bash
npx @better-auth/cli@latest generate
```

After the command finishes, inspect your `prisma/schema.prisma` file. You will see that it has been populated with the correct models.

### Step 5: Sync Your Database

Now that your schema is defined, push it to your actual database. The `db push` command is a quick way to sync your database with your schema, ideal for development and prototyping.

```bash
npx prisma db push
```

This command will create the tables in your PostgreSQL database that correspond to the models in your schema.

### Step 6: Configure the Adapter in `better-auth`

Finally, configure the `prismaAdapter` in your main `better-auth` configuration file.

```typescript
// src/lib/auth.ts (or your auth config file)

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

// Create a single, shared instance of the Prisma Client
const prisma = new PrismaClient();

export const auth = betterAuth({
  // ... other options
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // ...
});
```

Your `better-auth` instance is now fully configured to use your PostgreSQL database via Prisma. All user, session, and account data will be managed automatically.
