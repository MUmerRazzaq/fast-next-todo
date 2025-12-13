# Dockerfile Best Practices

This document outlines best practices for writing Dockerfiles, focusing on creating small, secure, and efficient images.

## Table of Contents
- [Multi-Stage Builds](#multi-stage-builds)
- [Layer Caching](#layer-caching)
- [Image Size Optimization](#image-size-optimization)
- [Use Specific Base Images](#use-specific-base-images)
- [Use a .dockerignore file](#use-a-dockerignore-file)

## Multi-Stage Builds

Multi-stage builds are a powerful feature that allows you to use multiple `FROM` statements in your Dockerfile. Each `FROM` instruction can use a different base, and each of them begins a new stage of the build. You can selectively copy artifacts from one stage to another, leaving behind everything you don't want in the final image.

This is particularly useful for compiled languages or applications that have a build step (like Node.js or Java). You can use a larger image with all the build tools and dependencies to compile your application, and then copy only the compiled artifacts to a smaller, production-ready image.

### Example

```dockerfile
# Stage 1: Build the application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Create the production image
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]
```

In this example, the `builder` stage has all the development dependencies to build the Next.js app. The final production image only contains the built application and its production dependencies, making it much smaller.

## Layer Caching

Docker builds images in layers. Each instruction in the Dockerfile creates a new layer. Docker caches these layers and reuses them if the instruction and the files it depends on have not changed. To take advantage of layer caching, you should order your Dockerfile instructions from least to most frequently changing.

For example, you should copy your `package.json` and install dependencies before copying the rest of your application code. This way, if you only change your application code, Docker can reuse the layer with the installed dependencies.

### Example

```dockerfile
WORKDIR /app

# Copy dependency manifest first
COPY package*.json ./

# Install dependencies
# This layer is cached as long as package*.json doesn't change
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the app
RUN npm run build
```

## Image Size Optimization

- **Use small base images**: Start with a small base image like `alpine` or `slim`. For example, `python:3.9-slim` is smaller than `python:3.9`.
- **Minimize the number of layers**: Each `RUN` instruction creates a new layer. Combine multiple `RUN` commands using `&&` to reduce the number of layers.
- **Clean up after yourself**: In the same `RUN` instruction where you install packages, remove any unnecessary files or caches. For example, for `apt-get`, you can add `&& rm -rf /var/lib/apt/lists/*`.

## Use Specific Base Images

Always use specific tags for your base images, like `node:18-alpine` instead of `node:latest`. This ensures that your builds are reproducible and you don't accidentally get a new major version of the base image that could break your application.

## Use a .dockerignore file

Use a `.dockerignore` file to exclude files and directories from the build context. This can significantly speed up your builds by reducing the amount of data sent to the Docker daemon. It also helps to avoid accidentally copying sensitive files into your image.
A template `.dockerignore` is available at `assets/dockerignore-template/.dockerignore`.
