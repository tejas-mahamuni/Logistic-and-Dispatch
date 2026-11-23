import { apiClient } from './client';

export const orderApi = {
  list: async (hubId = '') => {
    const res = await apiClient.get(`/orders${hubId ? `?hubId=${hubId}` : ''}`);
    return res.data?.content || (Array.isArray(res.data) ? res.data : []);
  },

  getPending: async (hubId = '') => {
    const res = await apiClient.get(`/orders/pending${hubId ? `?hubId=${hubId}` : ''}`);
    return Array.isArray(res.data) ? res.data : (res.data?.content || []);
  },

  getMyOrders: async () => {
    const res = await apiClient.get('/orders/my-orders');
    return Array.isArray(res.data) ? res.data : (res.data?.content || []);
  },

  create: async (data) => {
    const res = await apiClient.post('/orders', data);
    return res.data;
  },

  bulkCreate: async (ordersList) => {
    const res = await apiClient.post('/orders/bulk', ordersList);
    return res.data;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data;
  },

  track: async (trackingNo) => {
    const res = await apiClient.get(`/orders/track/${encodeURIComponent(trackingNo)}`);
    return res.data;
  },

  updateStatus: async (id, status) => {
    const res = await apiClient.patch(`/orders/${id}/status?status=${encodeURIComponent(status)}`);
    return res.data;
  },

  getWarehouseQueue: async (hubId = '') => {
    const res = await apiClient.get(`/orders/warehouse-queue${hubId ? `?hubId=${hubId}` : ''}`);
    return Array.isArray(res.data) ? res.data : (res.data?.content || []);
  },

  dispatchTrunkRoute: async (orderIds, hubId = '', remarks = '') => {
    const res = await apiClient.post(`/orders/trunk-dispatch?hubId=${hubId}&remarks=${encodeURIComponent(remarks)}`, orderIds);
    return res.data;
  },

  receiveAtHub: async (orderIds, hubId = '') => {
    const res = await apiClient.post(`/orders/receive-at-hub?hubId=${hubId}`, orderIds);
    return res.data;
  },

  autoShipAll: async () => {
    const res = await apiClient.post('/orders/trunk-dispatch/auto-ship-all');
    return Array.isArray(res.data) ? res.data : (res.data?.content || []);
  }
};

export const assignmentApi = {
  list: async (hubId = '', driverId = '') => {
    const params = new URLSearchParams();
    if (hubId) params.append('hubId', hubId);
    if (driverId) params.append('driverId', driverId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get(`/assignments${qs}`);
    return res.data?.content || (Array.isArray(res.data) ? res.data : []);
  },

  create: async (data) => {
    const res = await apiClient.post('/assignments', data);
    return res.data;
  },

  autoAssign: async (hubId = '') => {
    const res = await apiClient.post(`/assignments/auto-assign${hubId ? `?hubId=${hubId}` : ''}`);
    return Array.isArray(res.data) ? res.data : (res.data?.content || []);
  },

  updateTripStatus: async (id, status, remarks = '') => {
    const query = new URLSearchParams({ status });
    if (remarks) query.append('remarks', remarks);
    const res = await apiClient.patch(`/assignments/${id}/status?${query.toString()}`);
    return res.data;
  },

  updateStopStatus: async (tripId, stopId, status, remarks = '') => {
    const query = new URLSearchParams({ status });
    if (remarks) query.append('remarks', remarks);
    const res = await apiClient.patch(`/assignments/${tripId}/stops/${stopId}/status?${query.toString()}`);
    return res.data;
  },

  getTodayByDriver: async (driverId) => {
    const res = await apiClient.get(`/assignments/driver/${driverId}/today`);
    return Array.isArray(res.data) ? res.data : (res.data?.content || []);
  }
};
