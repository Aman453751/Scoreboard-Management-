import api from './api';

export const userService = {
  async getAll(params = {}) {
    const response = await api.get('/users', { params });
    return response.data;
  },

  async getScorers() {
    const response = await api.get('/users/scorers');
    return response.data;
  },

  async updateRole(userId, role) {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
  },

  async delete(userId) {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  }
};
