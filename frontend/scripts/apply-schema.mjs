import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';

async function applySchema() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL environment variable is not set.");
    process.exit(1);
  }

  console.log("Connecting to the database to apply schema...");
  const pool = new Pool({ connectionString: dbUrl });
  const client = await pool.connect();

  try {
    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf-8');

    console.log("Applying database schema...");
    await client.query(schemaSql);
    console.log("Database schema applied successfully.");
  } catch (error) {
    console.error("Error applying database schema:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    console.log("Database connection closed.");
  }
}

applySchema();
