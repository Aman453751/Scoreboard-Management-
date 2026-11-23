import api from './api';

export const statsService = {
  async getDashboardStats() {
    const response = await api.get('/stats');
    return response.data;
  }
};
