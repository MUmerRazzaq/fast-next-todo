# Communication Pattern Decision Matrix

| Criteria                  | REST (HTTP/JSON) | gRPC (Protobuf) | GraphQL         | Message Queue (e.g., RabbitMQ) | Pub/Sub (e.g., Kafka) |
| ------------------------- | ---------------- | --------------- | --------------- | ------------------------------ | --------------------- |
| **Use Case**              | Public APIs, simple req/res | Internal service-to-service | Mobile/complex UIs | Decoupled tasks, background jobs | Event broadcasting, streaming |
| **Communication Style**   | Sync             | Sync            | Sync            | Async                          | Async                 |
| **Performance**           | Medium           | High            | Medium          | N/A                            | High (throughput)     |
| **Payload Format**        | JSON             | Protocol Buffers (binary) | JSON            | Any (usually JSON)             | Any (usually Avro/JSON) |
| **Schema/Contract**       | OpenAPI          | .proto files    | SDL             | N/A (defined by message body)  | Schema Registry (optional) |
| **Coupling**              | Loose            | Tight (on .proto) | Loose           | Very Loose                     | Very Loose            |
| **Client Code Generation**| Yes (via OpenAPI) | Yes (native)    | Yes             | No                             | No                    |

**How to use:**
For each interaction between services, evaluate these criteria to select the most appropriate communication pattern. A single system can use multiple patterns.
