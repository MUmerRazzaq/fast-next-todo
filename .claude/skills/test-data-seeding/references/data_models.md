# Data Models

This document defines the database schema for the application.

## User Model

- `id` (integer, primary key)
- `username` (string, unique)
- `email` (string, unique)
- `password_hash` (string)
- `created_at` (datetime)

## Task Model

- `id` (integer, primary key)
- `user_id` (integer, foreign key to User)
- `title` (string)
- `description` (text)
- `completed` (boolean)
- `due_date` (date)
- `created_at` (datetime)

*TODO: Replace the above with your actual data models.*
