# Rollbacks and Production Checklist

## 1. Rollback Procedure (Playbook)

1.  **Identify the faulty migration revision ID.** Use `alembic history`.
2.  **Notify stakeholders.** Inform the team that a rollback is in progress.
3.  **Take a database backup.** (If not already automated). This is a critical safety net.
4.  **Downgrade the migration.**
    ```bash
    # Downgrade one step
    alembic downgrade -1

    # Or downgrade to a specific revision (the one before the faulty one)
    alembic downgrade <target_revision>
    ```
5.  **Verify the application.** Ensure the application is working as expected after the rollback.
6.  **Post-mortem.** Analyze why the faulty migration was deployed and improve the process.

## 2. Production Migration Checklist

-   [ ] **Reviewed and approved**: The migration script has been code-reviewed by at least one other engineer.
-   [ ] **Tested**: The migration has passed all automated tests in CI.
-   [ ] **Downgrade is implemented**: The `downgrade()` function is correctly implemented and tested.
-   [ ] **Backward-compatible (for zero-downtime)**: The change does not break the currently running version of the application. For example, when adding a new non-nullable column, it should have a `server_default`.
-   [ ] **Backup taken**: A database backup has been taken before applying the migration.
-   [ ] **Timing**: The migration is being deployed during a low-traffic period if it's expected to be slow or risky.
-   [ ] **Monitoring**: Database and application monitoring is in place to quickly detect any issues after deployment.
