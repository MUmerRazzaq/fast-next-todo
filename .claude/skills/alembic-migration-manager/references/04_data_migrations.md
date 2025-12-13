# Data Migrations

For data backfilling or transformations, manual migration scripts are used.

## Pattern: Bulk Update

When you need to update a large number of rows, use `op.bulk_insert` or a direct SQL `execute`.

### Example: Backfill a `full_name` column from `first_name` and `last_name`

```python
# revision: 9012ijkl
# down_revision: 5678efgh

from alembic import op
import sqlalchemy as sa

# Define table structure for the migration
users_table = sa.table('users',
    sa.column('first_name', sa.String),
    sa.column('last_name', sa.String),
    sa.column('full_name', sa.String)
)

def upgrade():
    # Use string concatenation appropriate for your DB (e.g., ' ' for SQLite/Postgres)
    op.execute(
        users_table.update().values(
            full_name=users_table.c.first_name + ' ' + users_table.c.last_name
        )
    )

def downgrade():
    # Data migrations are often not perfectly reversible.
    # Here, we can just nullify the column.
    op.execute(
        users_table.update().values(full_name=None)
    )
    # A comment explaining the irreversibility is a good practice.
    # The 'full_name' data is lost on downgrade.
```

**Safety:**
- Data migrations can be risky. Always back up your database before running them in production.
- Test data migrations on a staging environment that mirrors production data as closely as possible.
- For large tables, consider running updates in batches to avoid locking the table for too long.
