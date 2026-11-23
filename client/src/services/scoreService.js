import api from './api';

export const scoreService = {
  async getScore(matchId) {
    const response = await api.get(`/matches/${matchId}/score`);
    return response.data;
  },

  async updateScore(matchId, scoreData) {
    const response = await api.post(`/matches/${matchId}/score`, scoreData);
    return response.data;
  },

  async undoScore(matchId) {
    const response = await api.post(`/matches/${matchId}/score/undo`);
    return response.data;
  },

  async getEvents(matchId) {
    const response = await api.get(`/matches/${matchId}/events`);
    return response.data;
  }
};
