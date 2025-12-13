# Environment Variable Guide

Environment variables are a great way to configure your application without changing its code. This is particularly important for containerized applications, as it allows you to use the same image in different environments (development, staging, production) with different configurations.

## Table of Contents
- [Using Environment Variables in Dockerfile](#using-environment-variables-in-dockerfile)
- [Passing Environment Variables at Runtime](#passing-environment-variables-at-runtime)
- [Using Environment Variables in Docker Compose](#using-environment-variables-in-docker-compose)
- [Using .env files with Docker Compose](#using-env-files-with-docker-compose)

## Using Environment Variables in Dockerfile

You can set default environment variables in your Dockerfile using the `ENV` instruction. These variables are available during the build process and when the container is running.

```dockerfile
ENV MY_VAR=default_value
```

You can also use `ARG` to define build-time variables. These are not available in the running container unless you also set them with `ENV`.

```dockerfile
ARG BUILD_VAR=some_value
ENV MY_VAR=$BUILD_VAR
```

## Passing Environment Variables at Runtime

You can override the default environment variables when you run a container using the `-e` or `--env` flag.

```bash
docker run -e MY_VAR=new_value my-image
```

You can also pass the contents of a file.
```bash
docker run --env-file ./my-env-file my-image
```
The file should contain key-value pairs separated by `=`.

## Using Environment Variables in Docker Compose

In `docker-compose.yml`, you can use the `environment` key to set environment variables for a service.

```yaml
services:
  backend:
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/mydatabase
      - SECRET_KEY=your-secret-key
```

You can also use variable substitution to pass variables from your shell or a `.env` file into your `docker-compose.yml`.

```yaml
services:
  backend:
    environment:
      - SECRET_KEY=${SECRET_KEY}
```
If you run `export SECRET_KEY=my-secret && docker-compose up`, the `backend` service will have `SECRET_KEY` set to `my-secret`.

## Using .env files with Docker Compose

By default, `docker-compose` looks for a file named `.env` in the directory where you run the command. The variables defined in this file are available for substitution in your `docker-compose.yml` and are also passed to the containers of the services.

`.env` file:
```
SECRET_KEY=my-super-secret-key-from-env-file
```

`docker-compose.yml`:
```yaml
services:
  backend:
    build: .
    environment:
      - SECRET_KEY=${SECRET_KEY}
```
When you run `docker-compose up`, the `SECRET_KEY` environment variable in the `backend` service will be set to `my-super-secret-key-from-env-file`.

You can also use the `env_file` key to specify a custom environment file.

```yaml
services:
  backend:
    env_file:
      - ./backend.env
```
