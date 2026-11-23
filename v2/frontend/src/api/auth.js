import { apiClient } from './client';

export const authApi = {
  login: async (username, password) => {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('user');
    }
  },

  me: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  }
};
