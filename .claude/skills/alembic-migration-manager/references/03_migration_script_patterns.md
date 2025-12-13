# Migration Script Patterns

All migration scripts have `upgrade()` and `downgrade()` functions.

- `upgrade()`: Applies the changes.
- `downgrade()`: Reverts the changes. It's crucial to implement this correctly for rollbacks.

## Example 1: Create a Table

```python
# revision: 1234abcd
# down_revision: None

from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('email', sa.String(100), unique=True, nullable=False)
    )

def downgrade():
    op.drop_table('users')
```

## Example 2: Add a Column

```python
# revision: 5678efgh
# down_revision: 1234abcd

from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('users', sa.Column('created_at', sa.DateTime, server_default=sa.func.now()))

def downgrade():
    op.drop_column('users', 'created_at')
```

**Best Practice:** Keep migrations small and focused on a single change. This makes them easier to debug and roll back.
