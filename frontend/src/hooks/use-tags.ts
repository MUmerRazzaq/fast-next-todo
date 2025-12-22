"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "@/lib/api-client";
import type { Tag, TagCreate, TagUpdate, TagListResponse, TagListParams } from "@/types/api";

/**
 * Query key factory for tags.
 */
export const tagKeys = {
  all: ["tags"] as const,
  lists: () => [...tagKeys.all, "list"] as const,
  list: (params: TagListParams) => [...tagKeys.lists(), params] as const,
  details: () => [...tagKeys.all, "detail"] as const,
  detail: (id: string) => [...tagKeys.details(), id] as const,
};

/**
 * Fetch tags list from API.
 */
async function fetchTags(params: TagListParams = {}): Promise<TagListResponse> {
  return api.get<TagListResponse>("/tags", { params: params as Record<string, string | number | boolean | undefined> });
}

/**
 * Fetch a single tag by ID.
 */
async function fetchTag(id: string): Promise<Tag> {
  return api.get<Tag>(`/tags/${id}`);
}

/**
 * Create a new tag.
 */
async function createTag(data: TagCreate): Promise<Tag> {
  return api.post<Tag>("/tags", data);
}

/**
 * Update a tag.
 */
async function updateTag({ id, data }: { id: string; data: TagUpdate }): Promise<Tag> {
  return api.patch<Tag>(`/tags/${id}`, data);
}

/**
 * Delete a tag.
 */
async function deleteTag(id: string): Promise<void> {
  return api.delete(`/tags/${id}`);
}

/**
 * Options for useTags hook.
 */
export interface UseTagsOptions extends TagListParams {
  enabled?: boolean;
}

/**
 * Hook for fetching paginated tag list.
 */
export function useTags(options: UseTagsOptions = {}) {
  const { enabled = true, ...params } = options;

  const query = useQuery({
    queryKey: tagKeys.list(params),
    queryFn: () => fetchTags(params),
    enabled,
    staleTime: 60 * 1000, // 1 minute (tags change less frequently)
  });

  return {
    tags: query.data?.items ?? [],
    pagination: query.data
      ? {
          page: query.data.page,
          pageSize: query.data.pageSize,
          total: query.data.total,
          totalPages: query.data.totalPages,
          hasNext: query.data.page < query.data.totalPages,
          hasPrevious: query.data.page > 1,
        }
      : null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for fetching a single tag.
 */
export function useTag(tagId: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const query = useQuery({
    queryKey: tagKeys.detail(tagId),
    queryFn: () => fetchTag(tagId),
    enabled: enabled && !!tagId,
    staleTime: 60 * 1000,
  });

  return {
    tag: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook to invalidate all tag queries.
 */
export function useInvalidateTags() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: tagKeys.all });
  };
}

/**
 * Mutation hooks for tag operations.
 */
interface TagMutationOptions {
  onSuccess?: () => void;
  onError?: (error: ApiError) => void;
}

/**
 * Hook for creating a tag.
 */
export function useCreateTag(options: TagMutationOptions = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      options.onSuccess?.();
    },
    onError: options.onError,
  });

  return {
    createTag: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook for updating a tag.
 */
export function useUpdateTag(options: TagMutationOptions = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: updateTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      options.onSuccess?.();
    },
    onError: options.onError,
  });

  return {
    updateTag: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Hook for deleting a tag.
 */
export function useDeleteTag(options: TagMutationOptions = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.all });
      // Also invalidate tasks since tag associations may have changed
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      options.onSuccess?.();
    },
    onError: options.onError,
  });

  return {
    deleteTag: mutation.mutate,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}
