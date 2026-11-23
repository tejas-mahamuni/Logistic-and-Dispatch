import { apiClient } from './client';

export const reportApi = {
  pipeline: async (hubId = '') => {
    const res = await apiClient.get(`/reports/pipeline${hubId ? `?hubId=${hubId}` : ''}`);
    return res.data;
  },

  overdue: async (hubId = '') => {
    const res = await apiClient.get(`/reports/overdue${hubId ? `?hubId=${hubId}` : ''}`);
    return res.data;
  },

  driverPerformance: async (hubId = '') => {
    const res = await apiClient.get(`/reports/driver-performance${hubId ? `?hubId=${hubId}` : ''}`);
    return res.data;
  },

  vehicleUtilization: async (hubId = '') => {
    const res = await apiClient.get(`/reports/vehicle-utilization${hubId ? `?hubId=${hubId}` : ''}`);
    return res.data;
  }
};
