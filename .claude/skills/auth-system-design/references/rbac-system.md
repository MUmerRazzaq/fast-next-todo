# Role-Based Access Control (RBAC)

Implementation of role-based access control systems.

## Core Components

- **Users**: Individual accounts
- **Roles**: Collections of permissions
- **Permissions**: Specific actions on resources
- **Resources**: Objects requiring access control

## Implementation

### Basic RBAC Structure
```python
from enum import Enum
from typing import Set

class Permission(str, Enum):
    USER_READ = "user:read"
    USER_WRITE = "user:write"
    USER_DELETE = "user:delete"

class RBACManager:
    def __init__(self):
        self.roles = {}  # role_id -> permissions
        self.user_roles = {}  # user_id -> set of role_ids

    def assign_role(self, user_id: str, role_id: str):
        if user_id not in self.user_roles:
            self.user_roles[user_id] = set()
        self.user_roles[user_id].add(role_id)

    def has_permission(self, user_id: str, permission: Permission) -> bool:
        if user_id not in self.user_roles:
            return False

        user_permissions = set()
        for role_id in self.user_roles[user_id]:
            if role_id in self.roles:
                user_permissions.update(self.roles[role_id])

        return permission in user_permissions
```

### Role Definitions
- **Admin**: Full access (read/write/delete)
- **Editor**: Read/write access
- **User**: Read-only access
- **Guest**: Limited read access

## Best Practices

- Principle of least privilege
- Regular permission audits
- Role-based separation of duties
- Proper permission inheritance