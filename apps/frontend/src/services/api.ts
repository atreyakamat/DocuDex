import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = '/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Attach token to requests
api.interceptors.request.use((config) => {
  const tokens = useAuthStore.getState().tokens;
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await useAuthStore.getState().refreshToken();
        const tokens = useAuthStore.getState().tokens;
        original.headers.Authorization = `Bearer ${tokens?.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ────────────────────────────────
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: { email: string; password: string; fullName: string; phone?: string }) =>
    api.post('/auth/register', data),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
  updateProfile: (data: Record<string, unknown>) => api.patch('/auth/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

// ─── Documents API ───────────────────────────
export const documentsApi = {
  list: (params?: Record<string, unknown>) => api.get('/documents', { params }),
  stats: () => api.get('/documents/stats'),
  getStats: () => api.get('/documents/stats'),
  get: (id: string) => api.get(`/documents/${id}`),
  upload: (file: File, metadata?: Record<string, unknown>) => {
    const form = new FormData();
    form.append('file', file);
    if (metadata) form.append('metadata', JSON.stringify(metadata));
    return api.post('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadBulk: (files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return api.post('/documents/upload/bulk', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id: string, data: Record<string, unknown>) => api.patch(`/documents/${id}`, data),
  delete: (id: string) => api.delete(`/documents/${id}`),
  download: (id: string) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
};

// ─── Workflows API ───────────────────────────
export const workflowsApi = {
  templates: () => api.get('/workflows/templates'),
  getTemplates: () => api.get('/workflows/templates'),
  template: (id: string) => api.get(`/workflows/templates/${id}`),
  list: () => api.get('/workflows'),
  getInstances: () => api.get('/workflows'),
  get: (id: string) => api.get(`/workflows/${id}`),
  create: (templateId: string) => api.post('/workflows', { templateId }),
  startWorkflow: (templateId: string) => api.post('/workflows', { templateId }),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/workflows/${id}`, data),
};

// ─── Notifications API ───────────────────────
export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
