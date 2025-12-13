# Service Discovery and API Gateway

## Service Discovery

In a microservices architecture, service instances change dynamically. Service discovery helps services find each other.

- **Client-side Discovery**: The client is responsible for querying a service registry (e.g., Eureka, Consul) to find the location of other services.
- **Server-side Discovery**: A router or load balancer queries the service registry and routes the request.

## API Gateway

The single entry point for all clients. It routes requests to the appropriate microservice.

- **Responsibilities**:
  - Request routing
  - Authentication and authorization
  - Rate limiting
  - Caching
  - API composition (aggregating results from multiple services)
- **Patterns**:
  - **Backend for Frontend (BFF)**: Create separate API gateways for different types of clients (e.g., web, mobile).
