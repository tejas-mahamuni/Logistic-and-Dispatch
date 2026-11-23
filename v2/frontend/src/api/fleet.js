import { apiClient } from './client';

export const driverApi = {
  list: async (hubId = '') => {
    const res = await apiClient.get(`/drivers${hubId ? `?hubId=${hubId}` : ''}`);
    return res.data?.content || (Array.isArray(res.data) ? res.data : []);
  },
  getById: async (id) => {
    const res = await apiClient.get(`/drivers/${id}`);
    return res.data;
  },
  getByUserId: async (userId) => {
    const res = await apiClient.get(`/drivers/by-user/${userId}`);
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/drivers', data);
    return res.data;
  }
};

export const vehicleApi = {
  list: async (hubId = '') => {
    const res = await apiClient.get(`/vehicles${hubId ? `?hubId=${hubId}` : ''}`);
    return res.data?.content || (Array.isArray(res.data) ? res.data : []);
  },
  getById: async (id) => {
    const res = await apiClient.get(`/vehicles/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/vehicles', data);
    return res.data;
  }
};
