# Axios Advanced Patterns

## Table of Contents
- [Request Queue & Deduplication](#request-queue--deduplication)
- [Request/Response Transformers](#requestresponse-transformers)
- [Multi-Instance Setup](#multi-instance-setup)
- [Loading State Management](#loading-state-management)

## Request Queue & Deduplication

Prevent duplicate in-flight requests:

```typescript
const pendingRequests = new Map<string, Promise<any>>();

api.interceptors.request.use((config) => {
  const key = `${config.method}:${config.url}:${JSON.stringify(config.params)}`;
  if (pendingRequests.has(key)) {
    const controller = new AbortController();
    config.signal = controller.signal;
    controller.abort();
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const key = `${response.config.method}:${response.config.url}`;
    pendingRequests.delete(key);
    return response;
  },
  (error) => {
    if (error.config) {
      const key = `${error.config.method}:${error.config.url}`;
      pendingRequests.delete(key);
    }
    return Promise.reject(error);
  }
);
```

## Request/Response Transformers

```typescript
const api = axios.create({
  transformRequest: [
    (data) => {
      // Convert dates to ISO strings
      if (data && typeof data === 'object') {
        return JSON.stringify(data, (key, value) =>
          value instanceof Date ? value.toISOString() : value
        );
      }
      return data;
    }
  ],
  transformResponse: [
    (data) => {
      // Parse ISO date strings back to Date objects
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
      return JSON.parse(data, (key, value) =>
        typeof value === 'string' && dateRegex.test(value) ? new Date(value) : value
      );
    }
  ]
});
```

## Multi-Instance Setup

Separate instances for different API domains:

```typescript
// api/clients.ts
export const mainApi = axios.create({ baseURL: '/api/v1' });
export const authApi = axios.create({ baseURL: '/auth' });
export const externalApi = axios.create({ baseURL: 'https://external.com/api' });

// Apply auth interceptor only to main API
mainApi.interceptors.request.use(authInterceptor);
```

## Loading State Management

Global loading indicator with request counting:

```typescript
let activeRequests = 0;

api.interceptors.request.use((config) => {
  activeRequests++;
  document.body.classList.add('loading');
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (--activeRequests === 0) document.body.classList.remove('loading');
    return response;
  },
  (error) => {
    if (--activeRequests === 0) document.body.classList.remove('loading');
    return Promise.reject(error);
  }
);
```

## Error Response Normalization

```typescript
interface NormalizedError {
  message: string;
  code: string;
  status: number;
  field?: string;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; code?: string; errors?: Record<string, string> }>) => {
    const normalized: NormalizedError = {
      message: error.response?.data?.message ?? 'Network error',
      code: error.response?.data?.code ?? 'NETWORK_ERROR',
      status: error.response?.status ?? 0
    };

    // Handle validation errors
    if (error.response?.status === 422 && error.response.data?.errors) {
      const [field, message] = Object.entries(error.response.data.errors)[0];
      normalized.field = field;
      normalized.message = message;
    }

    return Promise.reject(normalized);
  }
);
```
