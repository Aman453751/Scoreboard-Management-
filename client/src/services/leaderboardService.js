import api from './api';

export const leaderboardService = {
  async getByTournament(tournamentId) {
    const response = await api.get(`/tournaments/${tournamentId}/leaderboard`);
    return response.data;
  },

  async recalculate(tournamentId) {
    const response = await api.post(`/tournaments/${tournamentId}/leaderboard/recalculate`);
    return response.data;
  }
};
