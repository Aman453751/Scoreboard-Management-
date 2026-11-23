import api from './api';

export const teamService = {
  async getAll(params = {}) {
    const response = await api.get('/teams', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },

  async create(data) {
    const response = await api.post('/teams', data);
    return response.data;
  },

  async update(id, data) {
    const response = await api.put(`/teams/${id}`, data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  },

  async addPlayer(teamId, playerData) {
    const response = await api.post(`/teams/${teamId}/players`, playerData);
    return response.data;
  },

  async updatePlayer(playerId, playerData) {
    const response = await api.put(`/teams/players/${playerId}`, playerData);
    return response.data;
  },

  async deletePlayer(playerId) {
    const response = await api.delete(`/teams/players/${playerId}`);
    return response.data;
  }
};
