# Service Decomposition

## Criteria for Service Boundaries

- **Domain-Driven Design (DDD) Bounded Context**: Services should align with business domain boundaries. Each bounded context has its own domain model and language (Ubiquitous Language). This is the most common and effective strategy.
- **Single Responsibility Principle (SRP)**: Each service should have a single, well-defined responsibility.
- **Common Closure Principle**: Things that change together should be packaged together. If changes to two components are always released together, consider merging them.
- **Team Autonomy**: Boundaries can be drawn to enable small, autonomous teams to own services end-to-end.

## Anti-Patterns

- **Shared Database**: Avoid multiple services sharing the same database schema. It creates tight coupling.
- **Chatty Communication**: If services are constantly communicating with each other to perform a single task, their boundaries might be incorrect.
- **Leaky Abstractions**: Services should not expose their internal implementation details.
