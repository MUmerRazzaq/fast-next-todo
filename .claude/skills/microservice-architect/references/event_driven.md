# Event-Driven Architecture (EDA)

Services communicate through events. An event is a significant change in state.

## Core Concepts

- **Event**: A record of something that has happened. Immutable.
- **Producer**: A service that generates and publishes an event.
- **Consumer**: A service that subscribes to and processes an event.
- **Event Bus/Broker**: The infrastructure that transports events from producers to consumers (e.g., Kafka, RabbitMQ).

## Patterns

- **Event Notification**: A service sends an event to notify other services that something has happened, but the event doesn't contain the changed data. Consumers then query the producer service for details. Keeps events small.
- **Event-Carried State Transfer**: The event contains all the necessary data about the state change. Consumers don't need to query the producer service. Increases consumer autonomy but can lead to larger events.
- **Event Sourcing**: Store the state of a business entity as a sequence of state-changing events. The current state can be rebuilt by replaying the events.
