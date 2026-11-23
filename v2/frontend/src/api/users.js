import { apiClient } from './client';

export const userApi = {
  list: async () => {
    const res = await apiClient.get('/users');
    return Array.isArray(res.data) ? res.data : (res.data?.content || []);
  },

  create: async (userData) => {
    const res = await apiClient.post('/users', userData);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await apiClient.patch(`/users/${id}/status?status=${status}`);
    return res.data;
  }
};
