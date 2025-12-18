import { betterAuth } from 'better-auth';
import PostgresAdapter from '@auth/pg-adapter';
import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';

// Manually read environment variables.
const DATABASE_URL = process.env.DATABASE_URL;
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
const AUTH_BASE_URL = process.env.AUTH_BASE_URL;

if (!DATABASE_URL || !BETTER_AUTH_SECRET || !AUTH_BASE_URL) {
  console.error('Missing required environment variables: DATABASE_URL, BETTER_AUTH_SECRET, AUTH_BASE_URL');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

const auth = betterAuth({
  appName: "Fast Next Todo",
  secret: BETTER_AUTH_SECRET,
  baseURL: AUTH_BASE_URL,
  adapter: PostgresAdapter(pool),
  emailAndPassword: {
    enabled: true,
  },
});

async function generateSchema() {
  console.log('Generating schema for better-auth...');
  const adapter = auth.adapter;

  if (!adapter || !adapter.createSchema) {
    console.error('The configured adapter does not support automatic schema generation.');
    process.exit(1);
  }

  try {
    const schemaResult = await adapter.createSchema(auth.options);
    if (!schemaResult || !schemaResult.code || !schemaResult.path) {
      console.error('Schema generation did not return the expected result.');
      process.exit(1);
    }

    const fullPath = path.join('/app', schemaResult.path);
    const outputDir = path.dirname(fullPath);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(fullPath, schemaResult.code);
    console.log(`Schema successfully generated at: ${fullPath}`);
  } catch (error) {
    console.error('An error occurred during schema generation:', error);
    process.exit(1);
  }
}

generateSchema();
