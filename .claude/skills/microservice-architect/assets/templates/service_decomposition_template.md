# Service: [Service Name]

## 1. Domain & Responsibility

- **Bounded Context**: [e.g., Ordering, Payments, User Profile]
- **Core Responsibility**: [A concise sentence describing the service's primary purpose.]

## 2. Data Ownership

- **Owned Data Entities**: [List of data entities this service owns. e.g., Order, OrderItem]
- **Database Technology**: [e.g., PostgreSQL, MongoDB, DynamoDB]

## 3. APIs & Events

### Published APIs (What it offers)

- **API Style**: [e.g., REST, gRPC, GraphQL]
- **Key Endpoints/Procedures**:
  - `[METHOD] /path` - [Description]
  - ...

### Subscribed Events (What it listens to)

- **Event Name**: `[EventName]`
- **Source Service**: `[SourceService]`
- **Purpose**: [Why does it listen to this event?]

### Published Events (What it broadcasts)

- **Event Name**: `[EventName]`
- **Purpose**: [Why is this event published?]

## 4. Dependencies

### Synchronous Dependencies (Services it calls directly)

- **Service**: `[ServiceName]`
- **Reason**: [Why does it need to call this service?]

### Asynchronous Dependencies (Services it depends on via events)

- **Service**: `[ServiceName]` (via consumed events)
