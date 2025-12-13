# Communication Patterns

Choose the right communication style for each interaction.

## Synchronous Communication

The client sends a request and waits for a response.

- **REST**: Mature, well-understood, and uses standard HTTP verbs. Good for public-facing APIs.
- **gRPC**: High-performance RPC framework using Protocol Buffers. Excellent for internal, service-to-service communication. Features like streaming are built-in.
- **GraphQL**: Query language for APIs. Allows clients to request exactly the data they need. Reduces over-fetching and under-fetching. Good for complex data models and mobile clients.

## Asynchronous Communication

The client sends a message and doesn't wait for a direct response. Improves resilience and decoupling.

- **Message Queues (e.g., RabbitMQ, SQS)**: A producer sends a message to a queue, and a consumer processes it. Good for decoupling tasks and load balancing.
- **Publish/Subscribe (e.g., Kafka, Pub/Sub)**: A publisher sends a message to a topic, and multiple subscribers can receive it. Ideal for broadcasting events and building event-driven architectures.
