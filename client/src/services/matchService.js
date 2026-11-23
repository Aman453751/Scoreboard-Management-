import api from './api';

export const matchService = {
  async getAll(params = {}) {
    const response = await api.get('/matches', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/matches', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/matches/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/matches/${id}`);
    return response.data;
  }
};
