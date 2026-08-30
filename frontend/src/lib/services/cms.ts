import api from '@/lib/api';
import type { ApiResponse, Post, Page, PaginatedResponse } from '@/types';

export const cmsApi = {
  getPosts: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<{ posts: PaginatedResponse<Post> }>>('/v1/cms/posts', { params }),

  getPost: (slug: string) =>
    api.get<ApiResponse<{ post: Post }>>(`/v1/cms/posts/${slug}`),

  createPost: (data: Partial<Post> & { tags?: string[] }) =>
    api.post<ApiResponse<{ post: Post }>>('/v1/cms/posts', data),

  updatePost: (id: number, data: Partial<Post> & { tags?: string[] }) =>
    api.put<ApiResponse<{ post: Post }>>(`/v1/cms/posts/${id}`, data),

  publishPost: (id: number) =>
    api.post(`/v1/cms/posts/${id}/publish`),

  unpublishPost: (id: number) =>
    api.post(`/v1/cms/posts/${id}/unpublish`),

  deletePost: (id: number) =>
    api.delete(`/v1/cms/posts/${id}`),

  getPages: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ pages: PaginatedResponse<Page> }>>('/v1/cms/pages', { params }),

  getPage: (slug: string) =>
    api.get<ApiResponse<{ page: Page }>>(`/v1/cms/pages/${slug}`),

  createPage: (data: Partial<Page>) =>
    api.post<ApiResponse<{ page: Page }>>('/v1/cms/pages', data),

  updatePage: (id: number, data: Partial<Page>) =>
    api.put<ApiResponse<{ page: Page }>>(`/v1/cms/pages/${id}`, data),

  publishPage: (id: number) =>
    api.post(`/v1/cms/pages/${id}/publish`),

  unpublishPage: (id: number) =>
    api.post(`/v1/cms/pages/${id}/unpublish`),

  deletePage: (id: number) =>
    api.delete(`/v1/cms/pages/${id}`),
};
