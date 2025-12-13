# Data Management Patterns

## Database-per-Service

Each microservice owns its domain data and is solely responsible for it. The database is private to the service.

- **Benefits**: Loose coupling, services can evolve independently, each service can choose the best database technology for its needs.
- **Challenges**: Cross-service queries, distributed transactions.

## Distributed Transactions: The Saga Pattern

A saga is a sequence of local transactions. Each local transaction updates the database within a single service and publishes an event that triggers the next local transaction in the next service.

- **Choreography-based Saga**: Each service publishes events that trigger other services. No central coordinator. Simple but can be hard to track.
- **Orchestration-based Saga**: A central orchestrator tells the participants what to do. Easier to manage and understand the workflow.

If a local transaction fails, the saga executes compensating transactions to undo the preceding transactions.
