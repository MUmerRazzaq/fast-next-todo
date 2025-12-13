# Initialization and Configuration

## 1. Initialization

To start using Alembic, initialize the environment:

```bash
alembic init alembic
```

This creates an `alembic` directory with a `versions` subdirectory for migration scripts, and an `alembic.ini` configuration file.

## 2. Configuration (`alembic.ini`)

This file contains the configuration for Alembic. The most important setting is `sqlalchemy.url`.

-   **`sqlalchemy.url`**: Specifies the database to connect to.
    - For development, you can hardcode it: `sqlalchemy.url = postgresql://user:password@host/dbname`
    - For production, it's better to load it from an environment variable to avoid hardcoding credentials. The `env.py` script is used for this.

See `assets/alembic.ini.template` for a full template.

## 3. Environment (`env.py`)

This script is run every time an Alembic command is invoked. Its main purposes are:
-   To configure the database connection.
-   To provide the Alembic autogenerate feature with the target metadata of your models.

A typical `env.py` will:
1.  Import your database models.
2.  Set `target_metadata` to your declarative base's metadata.
3.  Configure the `sqlalchemy.url` from environment variables.

See `assets/env.py.template` for a practical example.
