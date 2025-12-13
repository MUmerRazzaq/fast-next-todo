-- Migration: {MIGRATION_NAME}
-- Description: {DESCRIPTION}
-- Author: {AUTHOR}
-- Date: {DATE}
-- Version: {VERSION}

-- ============================================================================
-- MIGRATION UP
-- ============================================================================

BEGIN;

-- Set search path (optional, for schema-specific migrations)
-- SET search_path TO public;

-- ----------------------------------------------------------------------------
-- 1. Create Extensions (if needed)
-- ----------------------------------------------------------------------------
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 2. Create Custom Types/Enums
-- ----------------------------------------------------------------------------
-- DO $$
-- BEGIN
--     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_type') THEN
--         CREATE TYPE status_type AS ENUM ('draft', 'published', 'archived');
--     END IF;
-- END $$;

-- ----------------------------------------------------------------------------
-- 3. Create Tables
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS {table_name} (
    -- Primary Key (choose one strategy)
    -- Option A: UUID (recommended for distributed systems)
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Option B: IDENTITY (recommended for PostgreSQL 10+)
    -- id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    -- Option C: SERIAL (legacy, still widely used)
    -- id SERIAL PRIMARY KEY,

    -- Foreign Keys
    -- parent_id UUID REFERENCES parent_table(id) ON DELETE CASCADE,

    -- Business Columns
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',

    -- JSON/JSONB for flexible data
    metadata JSONB DEFAULT '{}',

    -- Audit timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Soft delete (optional)
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT {table_name}_name_check CHECK (char_length(name) >= 1)
);

-- ----------------------------------------------------------------------------
-- 4. Create Indexes
-- ----------------------------------------------------------------------------
-- B-tree index for exact matches and range queries
CREATE INDEX IF NOT EXISTS idx_{table_name}_created_at
    ON {table_name}(created_at DESC);

-- Partial index for active records (excludes soft-deleted)
CREATE INDEX IF NOT EXISTS idx_{table_name}_active
    ON {table_name}(id)
    WHERE deleted_at IS NULL;

-- GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_{table_name}_metadata
    ON {table_name} USING GIN (metadata);

-- Composite index for common query patterns
-- CREATE INDEX IF NOT EXISTS idx_{table_name}_status_created
--     ON {table_name}(status, created_at DESC);

-- ----------------------------------------------------------------------------
-- 5. Create Triggers
-- ----------------------------------------------------------------------------
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_{table_name}_updated_at ON {table_name};
CREATE TRIGGER trigger_{table_name}_updated_at
    BEFORE UPDATE ON {table_name}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 6. Add Comments
-- ----------------------------------------------------------------------------
COMMENT ON TABLE {table_name} IS '{Table description}';
COMMENT ON COLUMN {table_name}.id IS 'Unique identifier';
COMMENT ON COLUMN {table_name}.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN {table_name}.updated_at IS 'Last modification timestamp';
COMMENT ON COLUMN {table_name}.deleted_at IS 'Soft deletion timestamp (NULL if active)';

-- ----------------------------------------------------------------------------
-- 7. Grant Permissions (if needed)
-- ----------------------------------------------------------------------------
-- GRANT SELECT, INSERT, UPDATE, DELETE ON {table_name} TO app_user;
-- GRANT USAGE, SELECT ON SEQUENCE {table_name}_id_seq TO app_user;

COMMIT;

-- ============================================================================
-- MIGRATION DOWN (Rollback)
-- ============================================================================

-- BEGIN;
--
-- DROP TRIGGER IF EXISTS trigger_{table_name}_updated_at ON {table_name};
-- DROP TABLE IF EXISTS {table_name} CASCADE;
-- DROP TYPE IF EXISTS {custom_type} CASCADE;
--
-- COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify table structure
-- \d {table_name}

-- Verify indexes
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = '{table_name}';

-- Verify constraints
-- SELECT conname, contype, pg_get_constraintdef(oid)
-- FROM pg_constraint WHERE conrelid = '{table_name}'::regclass;
