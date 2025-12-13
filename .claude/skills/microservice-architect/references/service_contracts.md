# Service Interface Contracts

A service contract is a formal agreement on the API a service provides.

## Key Elements

- **Endpoint/Procedure definitions**: The URLs for REST, or procedure names for gRPC.
- **Data Schemas**: The structure of requests and responses.
- **Communication Protocol**: e.g., HTTP, gRPC.
- **Authentication/Authorization**: How security is handled.
- **Service Level Objectives (SLOs)**: e.g., latency, availability.

## Specification Formats

- **OpenAPI (formerly Swagger)**: For REST APIs. A language-agnostic way to describe REST APIs.
- **Protocol Buffers (Protobuf)**: For gRPC. A language-neutral, platform-neutral, extensible mechanism for serializing structured data.
- **AsyncAPI**: For event-driven architectures. Describes message-based APIs.
- **GraphQL Schema Definition Language (SDL)**: For GraphQL APIs.
