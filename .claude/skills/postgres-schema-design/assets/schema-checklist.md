# PostgreSQL Schema Validation Checklist (SQLModel)

> For code examples, see [SKILL.md](../SKILL.md) and [common-patterns.md](../references/common-patterns.md)

## Pre-Design

- [ ] Business requirements documented
- [ ] Data entities identified
- [ ] Relationships mapped (ERD created)
- [ ] Query patterns identified
- [ ] Expected data volumes estimated

## Setup

- [ ] SQLModel installed
- [ ] PostgreSQL driver installed (`asyncpg` or `psycopg2-binary`)
- [ ] Engine and session factory configured
- [ ] Alembic configured (if needed)

## Naming

- [ ] Model classes: PascalCase, singular (`User`, `OrderItem`)
- [ ] Tables: snake_case, singular (auto from class name)
- [ ] Columns: snake_case (`created_at`, `user_id`)
- [ ] PKs: `id` or `{table}_id`
- [ ] FKs: `{referenced_table}_id`
- [ ] No reserved words used

## Primary Keys

- [ ] Every model has a primary key
- [ ] PK strategy appropriate for use case:
  - UUID: distributed systems, API exposure, hide record count
  - Integer: single DB, ordering needed, simpler debugging

## Foreign Keys

- [ ] All relationships have FK constraints
- [ ] FK type matches referenced PK type
- [ ] **All FKs indexed** (`index=True`)
- [ ] `Relationship()` defined with `back_populates`

## Data Types

- [ ] `TIMESTAMPTZ` for timestamps (not `TIMESTAMP`)
- [ ] `NUMERIC`/`Decimal` for money (not `float`)
- [ ] `uuid.UUID` for UUIDs
- [ ] `JSONB` for JSON (not `JSON`)
- [ ] Optional fields use `| None`

## Indexes

- [ ] Primary keys indexed (automatic)
- [ ] Foreign keys indexed (manual!)
- [ ] Frequent WHERE columns indexed
- [ ] Frequent ORDER BY columns indexed
- [ ] Composite indexes: most selective column first
- [ ] Partial indexes for filtered queries
- [ ] GIN indexes for JSONB/arrays
- [ ] No redundant indexes

## Constraints

- [ ] NOT NULL on required columns
- [ ] UNIQUE where business rules require
- [ ] CHECK constraints for validation
- [ ] DEFAULT values set appropriately

## Timestamps

- [ ] `created_at` on all tables
- [ ] `updated_at` on mutable tables
- [ ] Update trigger for `updated_at` (recommended)

## Soft Delete (if used)

- [ ] `deleted_at` column added
- [ ] Partial index for active records
- [ ] Queries filter by `deleted_at IS NULL`

## Normalization

- [ ] 1NF: Atomic columns, no repeating groups
- [ ] 2NF: No partial dependencies
- [ ] 3NF: No transitive dependencies
- [ ] Denormalization documented and justified

## Security

- [ ] No sensitive data in plain text
- [ ] Password fields excluded from serialization
- [ ] PII columns identified

## Migrations

- [ ] Migration tested in staging
- [ ] Rollback script prepared
- [ ] Large tables: indexes created CONCURRENTLY
- [ ] Data migrations batched

## Post-Migration

- [ ] All tables created
- [ ] All indexes exist
- [ ] All constraints enforced
- [ ] Sample data validated
- [ ] Application connectivity verified
