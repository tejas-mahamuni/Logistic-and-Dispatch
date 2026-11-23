import { apiClient } from './client';

export const customerApi = {
  list: async (query = '') => {
    const res = await apiClient.get(`/customers${query ? `?query=${encodeURIComponent(query)}` : ''}`);
    return res.data?.content || (Array.isArray(res.data) ? res.data : []);
  },

  getById: async (id) => {
    const res = await apiClient.get(`/customers/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await apiClient.post('/customers', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/customers/${id}`, data);
    return res.data;
  }
};
