import { apiClient } from './client';

export const hubApi = {
  list: async () => {
    const res = await apiClient.get('/hubs');
    return Array.isArray(res.data) ? res.data : (res.data?.content || res.data?.data || []);
  },

  getById: async (id) => {
    const res = await apiClient.get(`/hubs/${id}`);
    return res.data;
  },

  create: async (data) => {
    const res = await apiClient.post('/hubs', data);
    return res.data;
  },

  update: async (id, data) => {
    const res = await apiClient.put(`/hubs/${id}`, data);
    return res.data;
  },

  getZones: async (hubId) => {
    const res = await apiClient.get(`/hubs/${hubId}/service-zones`);
    return res.data;
  },

  addZone: async (hubId, zoneData) => {
    const res = await apiClient.post(`/hubs/${hubId}/service-zones`, zoneData);
    return res.data;
  },

  removeZone: async (hubId, zoneId) => {
    const res = await apiClient.delete(`/hubs/${hubId}/service-zones/${zoneId}`);
    return res.data;
  }
};
