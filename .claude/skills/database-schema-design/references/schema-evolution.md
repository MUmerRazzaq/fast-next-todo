# Schema Evolution Strategy

Database schemas are not static; they evolve over time. A clear strategy for managing schema changes (migrations) is essential for maintaining a healthy application.

## Core Principles

- **Automate Migrations**: Use a database migration tool (e.g., Flyway, Liquibase, Alembic for Python, Knex.js for Node.js) to manage schema changes in a programmatic and version-controlled way.
- **Version Control**: Store migration scripts in your project's version control system (like Git) alongside your application code. This keeps your schema changes in sync with your code changes.
- **Never Modify a Committed Migration**: Once a migration script has been run on a production database, it should never be edited. If you need to make a change, create a new migration script.

## The Migration Process

1.  **Create a New Migration File**: When you need to change the schema, create a new, version-numbered migration file (e.g., `V2__Add_user_status_column.sql`). The migration tool will generate this for you.
2.  **Write the DDL**: Add the SQL DDL statements to the migration file to perform the schema change (e.g., `ALTER TABLE users ADD COLUMN status VARCHAR(20);`).
3.  **Write the "Down" Migration (Optional but Recommended)**: Write the corresponding DDL to revert the change. This is crucial if you need to roll back a deployment.
4.  **Test the Migration**: Test the migration in a development or staging environment to ensure it works as expected and doesn't cause data loss.
5.  **Deploy**: When you deploy your application, your migration tool will automatically check the database's schema version and apply any pending migrations.

## Strategies for Zero-Downtime Deployments

Making schema changes without taking your application offline requires careful planning.

### Additive Changes (Safest)

- **Adding columns**:
    1.  Add the new column with a `DEFAULT` value or make it `NULL`-able.
    2.  Deploy the application code that can work with or without the new column.
    3.  Backfill data for the new column if necessary.
    4.  Deploy new code that relies on the new column.
- **Adding tables or indexes**: These are generally safe and don't require downtime.

### Destructive Changes (Risky)

- **Dropping columns/tables**:
    1.  Deploy application code that no longer reads from or writes to the column/table.
    2.  Run a migration to drop the column/table.
- **Renaming columns/tables**:
    1.  Add a new column with the desired name.
    2.  Deploy code that writes to both the old and new columns, but reads from the old one.
    3.  Run a script to copy data from the old column to the new one.
    4.  Deploy code that reads from the new column.
    5.  Deploy code that stops writing to the old column.
    6.  Drop the old column.
    This is complex. Often it's easier to handle this with a short maintenance window if possible.
