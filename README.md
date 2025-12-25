# Fast Next Todo - Intelligent Multi-User Task Management

## 1. Project Overview

Fast Next Todo is a full-stack, multi-user task management application designed for individuals and teams who need a secure, responsive, and feature-rich platform to organize their work. It provides a robust solution for creating, managing, and tracking tasks with a focus on productivity and user experience.

The core problem it solves is the need for a self-hostable, modern task manager with advanced features like task history, recurrence, and robust filtering, which are often found only in premium SaaS products. It's built for developers, small teams, and individuals who want control over their data and a high-performance, accessible interface.

**Key Highlights:**
- **Multi-user & Authenticated**: Securely manages tasks on a per-user basis.
- **Responsive & Accessible**: Works seamlessly on desktop and mobile, with a focus on WCAG 2.1 AA standards.
- **Feature-Rich**: Includes task history, recurrence, priorities, tags, and keyboard shortcuts.
- **Modern Tech Stack**: Built with Next.js, FastAPI, PostgreSQL, and Docker for a scalable and maintainable solution.

## 2. Features

### Core Task Management
- **Create, Update, Delete Tasks**: Full CRUD functionality for tasks through intuitive dialogs.
- **View Task List**: A comprehensive task list with pagination, filtering, and sorting.
- **Mark Tasks as Complete/Incomplete**: Easily toggle the completion status of tasks.
- **Task Ownership**: Strictly enforces that users can only access and manage their own tasks.

### Organization & Productivity
- **Priorities**: Assign `High`, `Medium`, or `Low` priority to tasks.
- **Tags/Categories**: Create and assign custom tags to tasks for better organization.
- **Smart Filters and Sorting**: Filter tasks by status, priority, tags, and due date. Sort by creation date, due date, priority, or title.
- **Keyboard Shortcuts**: A comprehensive set of keyboard shortcuts for power users, with a built-in help dialog.

### Advanced Capabilities
- **Due Dates**: Assign due dates to tasks, with visual highlighting for overdue items.
- **Recurring Tasks**: Set tasks to recur `Daily`, `Weekly`, or `Monthly`. A new task is automatically created when a recurring task is completed.
- **Export Functionality**: Export your tasks to CSV or JSON format.
- **Activity/History Tracking**: Every change to a task is recorded in an immutable audit log, which can be viewed for each task.

### UX & Accessibility
- **Responsive Dashboard**: The layout adapts smoothly from desktop to mobile devices.
- **Collapsible Sidebar**: A collapsible sidebar on desktop maximizes screen real estate.
- **WCAG 2.1 AA Considerations**: Built with accessibility in mind, using semantic HTML and ARIA attributes.
- **Keyboard Navigation Support**: Fully navigable using the keyboard.

## 3. Tech Stack

- **Frontend**: Next.js 15+ (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Zustand (for state management), React Query (for data fetching), React Hook Form & Zod (for forms).
- **Backend**: Python 3.12+, FastAPI, Uvicorn.
- **Database**: PostgreSQL (tested with Neon Serverless PostgreSQL), SQLModel (ORM), Alembic (migrations).
- **Authentication**: `better-auth` for session management and JWT for API authentication.
- **Testing**:
    - Frontend: Jest (unit/integration), React Testing Library, Playwright (end-to-end).
    - Backend: Pytest.
- **Containerization**: Docker, Docker Compose.

## 4. Architecture Overview

The application follows a decoupled, client-server architecture.

- **Frontend**: A Next.js application responsible for all UI rendering and client-side interactions. It communicates with the backend via a REST API.
- **Backend**: A stateless FastAPI application that exposes the REST API for managing data. It handles business logic, database interactions, and authentication.

### Authentication Flow

The authentication flow is designed to be secure and stateless from the backend's perspective.

```
┌──────────────┐      ┌──────────────────┐      ┌──────────────────────────┐
│   Browser    │      │     Frontend     │      │        Database          │
│              │      │    (Next.js)     │      │      (PostgreSQL)        │
└──────┬───────┘      └────────┬─────────┘      └────────────┬─────────────┘
       │                       │                              │
       │  1. Login (email/pw)  │                              │
       │──────────────────────►│                              │
       │                       │  2. Validate credentials     │
       │                       │─────────────────────────────►│
       │                       │     (check account table)    │
       │                       │◄─────────────────────────────│
       │                       │  3. Create session           │
       │                       │─────────────────────────────►│
       │  4. Session cookie    │     (insert into session)    │
       │◄──────────────────────│                              │
       │                       │                              │
       │  5. Access /tasks     │                              │
       │──────────────────────►│                              │
       │                       │  6. Get JWT token            │
       │                       │    /api/auth/token           │
       │                       │     (verify session,         │
       │                       │      create JWT with         │
       │                       │      user_id from user)      │
       │                       │                              │
┌──────┴───────┐      ┌────────┴─────────┐      ┌────────────┴─────────────┐
│   Browser    │      │     Backend      │      │        Database          │
│              │      │    (FastAPI)     │      │      (PostgreSQL)        │
└──────┬───────┘      └────────┬─────────┘      └────────────┬─────────────┘
       │                       │                              │
       │  7. API Request       │                              │
       │  Authorization:       │                              │
       │  Bearer <JWT>         │                              │
       │──────────────────────►│                              │
       │                       │  8. Verify JWT               │
       │                       │     Extract user_id          │
       │                       │                              │
       │                       │  9. Query tasks WHERE        │
       │                       │     user_id = <from JWT>     │
       │                       │─────────────────────────────►│
       │                       │◄─────────────────────────────│
       │  10. Tasks response   │                              │
       │◄──────────────────────│                              │
```

## 5. Authentication & Security

- **Sign-in / Sign-up Flow**: Users sign up and sign in through dedicated forms. `better-auth` handles the initial authentication and session management within the Next.js application.
- **JWT Token Usage**: After a successful login, the frontend requests a short-lived (configurable, 30 minutes by default) JSON Web Token (JWT) from its own backend (`/api/auth/token`). This JWT is then used for all subsequent requests to the FastAPI backend.
- **Authorization Header**: The JWT must be included in the `Authorization` header of all requests to protected API endpoints.
    - **Format**: `Authorization: Bearer <your_jwt_token>`
- **Token Expiration**: The JWT is configured to expire, requiring the client to re-authenticate or refresh the token.
- **API Access Rules**: All API endpoints (except the health check, if public) are protected and require a valid JWT. The backend validates the token on every request and uses the `user_id` from the token payload to scope all database operations, ensuring a user can never access another user's data.

## 6. API Overview

All endpoints are prefixed with `/api/v1`. Most endpoints require a valid JWT for authentication (exceptions are noted below, such as the health check if configured as public).

| Method | Path                        | Description                                    |
| :----- | :-------------------------- | :--------------------------------------------- |
| `GET`  | `/health`                   | Health check endpoint.                         |
| `GET`  | `/tasks`                    | List all tasks for the current user.           |
| `POST` | `/tasks`                    | Create a new task.                             |
| `GET`  | `/tasks/{task_id}`          | Get a specific task by ID.                     |
| `PATCH`| `/tasks/{task_id}`          | Update a specific task.                        |
| `DELETE`|`/tasks/{task_id}`          | Soft-delete a specific task.                   |
| `POST` | `/tasks/{task_id}/complete` | Mark a task as completed.                      |
| `POST` | `/tasks/{task_id}/uncomplete`| Mark a task as incomplete.                   |
| `GET`  | `/tasks/export/download`    | Export tasks to CSV or JSON.                   |
| `GET`  | `/tasks/{task_id}/audit`    | Get the audit history for a specific task.     |
| `GET`  | `/tags`                     | List all tags for the current user.            |
| `POST` | `/tags`                     | Create a new tag.                              |
| `GET`  | `/tags/{tag_id}`            | Get a specific tag by ID.                      |
| `PATCH`| `/tags/{tag_id}`            | Update a specific tag.                         |
| `DELETE`|`/tags/{tag_id}`            | Delete a specific tag.                         |

## 7. Database Design

The database schema is designed around a few core entities.

- **Core Entities**:
    - **Task**: The central entity representing a to-do item. It includes fields for `title`, `description`, `priority`, `due_date`, `recurrence`, and completion status. Each task is owned by a user.
    - **Tag**: A user-defined tag for organizing tasks (e.g., "work", "personal").
    - **AuditLog**: An immutable, append-only log that records every single change made to a task, including creation, updates, completion, and deletion.
- **Relationships**:
    - **User-Task**: One-to-Many (A user can have many tasks).
    - **User-Tag**: One-to-Many (A user can have many tags).
    - **Task-Tag**: Many-to-Many (A task can have multiple tags, and a tag can be on multiple tasks).
- **Soft-Delete Strategy**: Tasks are not permanently deleted from the database. Instead, an `is_deleted` flag is set to `true`. This preserves task history and allows for potential recovery.
- **Change Tracking**: The `AuditLog` table provides comprehensive change tracking. For every modification, it stores the type of entity, the specific entity ID, the action taken (`create`, `update`, etc.), the field that was changed, its old value, and its new value.

## 8. Project Structure

The project is a monorepo with a `frontend` and `backend` directory.

```
.
├── backend/                # FastAPI Backend
│   ├── alembic/            # Database migrations
│   ├── app/                # Core application source
│   │   ├── api/            # API endpoint definitions (v1)
│   │   ├── models/         # SQLModel database models
│   │   ├── schemas/        # Pydantic schemas for API I/O
│   │   ├── services/       # Business logic
│   │   └── main.py         # FastAPI app entrypoint
│   └── pyproject.toml      # Python dependencies and project config
├── docker-compose.yml      # Docker Compose for local development
├── frontend/               # Next.js Frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── app/            # Next.js App Router pages and layouts
│   │   ├── components/     # Reusable React components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Core libraries (API client, auth)
│   └── package.json        # Node.js dependencies
└── vercel.json             # Vercel deployment configuration
```

## 9. Setup & Installation

### Prerequisites
- **Node.js**: v20.0.0 or later
- **Python**: v3.12 or later
- **Docker** and **Docker Compose**

### Local Development with Docker (Recommended)

This is the easiest way to get started.

1.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Environment Variables**:
    - The `docker-compose.yml` file comes with default environment variables for local development. You do not need to create `.env` files for this method unless you want to override the defaults.

3.  **Build and run the services**:
    ```bash
    docker-compose up -d --build
    ```
    This will start the frontend, backend, and a PostgreSQL database.

### Manual Local Setup

Follow these steps to run the frontend and backend on your local machine without Docker.

1.  **Clone the repository**.

2.  **Setup Backend**:
    - Navigate to the `backend` directory: `cd backend`
    - Create a Python virtual environment and activate it.
    - Install dependencies: `pip install -r requirements.txt`
    - Create a `.env` file from `.env.example` and configure your `DATABASE_URL` and `BETTER_AUTH_SECRET`.
    - Run database migrations: `alembic upgrade head`

3.  **Setup Frontend**:
    - Navigate to the `frontend` directory: `cd frontend`
    - Install dependencies: `npm install`
    - Create a `.env.local` file from `.env.example` and configure your `DATABASE_URL`, `BETTER_AUTH_SECRET`, and other variables. The secret must match the backend's.

## 10. Running the Application

- **With Docker**:
    - After running `docker-compose up`, the services will be available at:
        - **Frontend**: `http://localhost:3000`
        - **Backend API**: `http://localhost:8000`
- **Manually**:
    - **Run Backend**: From the `backend` directory, run:
      ```bash
      uvicorn app.main:app --reload
      ```
    - **Run Frontend**: From the `frontend` directory, run:
      ```bash
      npm run dev
      ```

## 11. Accessibility

The application aims to meet **WCAG 2.1 Level AA** standards.
- **Semantic HTML**: Proper use of `<main>`, `<nav>`, `<button>`, etc., to structure the application.
- **ARIA Attributes**: `aria-label` and other ARIA attributes are used to provide context for screen readers.
- **Keyboard Navigation**: The entire application is navigable using only a keyboard.

## 12. Keyboard Shortcuts

A help dialog with all available shortcuts can be opened by pressing `?`.

| Shortcut        | Action                            |
| :-------------- | :-------------------------------- |
| `?`             | Show this help dialog             |
| `n`             | Create a new task                 |
| `/` or `s`      | Focus the search input            |
| `j` or `↓`      | Navigate down the task list       |
| `k` or `↑`      | Navigate up the task list         |
| `e`             | Edit the selected task            |
| `#` or `d`      | Delete the selected task          |
| `c`             | Complete/uncomplete selected task |
| `Esc`           | Close dialogs or unfocus input    |


## 13. Error Handling

- **Sign-in Errors**: Incorrect credentials will display an "Invalid credentials" error message at the top of the sign-in form.
- **API Error Handling**: The frontend has a centralized API client that handles non-2xx responses. Errors are typically displayed as non-intrusive "toast" notifications. For critical form submission errors, messages may appear directly within the form.
- **User-Friendly Errors**: The system aims to provide user-friendly error messages rather than technical error codes.

## 14. Contribution Guidelines

Contribution guidelines are not yet formally defined. However, if you wish to contribute, please follow these general rules:
- **Branching**: Create a new branch for each feature or bug fix (e.g., `feat/new-feature`, `fix/login-bug`).
- **Commits**: Write clear and descriptive commit messages.
- **Code Style**: Follow the existing code style. The project is configured with linters (ESLint for frontend, Ruff for backend) to help maintain consistency.
- **Issues**: Please open an issue to discuss any significant changes before starting work.

## 15. License

The backend code is licensed under the **MIT License**, as specified in the `pyproject.toml` file. A formal `LICENSE` file has not yet been added to the repository root.
