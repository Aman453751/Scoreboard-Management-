import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.data?.token) {
      localStorage.setItem('omniscore_token', response.data.data.token);
      localStorage.setItem('omniscore_user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data?.data?.token) {
      localStorage.setItem('omniscore_token', response.data.data.token);
      localStorage.setItem('omniscore_user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.put('/auth/profile', profileData);
    if (response.data?.data?.user) {
      localStorage.setItem('omniscore_user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  async changePassword(passwords) {
    const response = await api.put('/auth/change-password', passwords);
    return response.data;
  },

  logout() {
    localStorage.removeItem('omniscore_token');
    localStorage.removeItem('omniscore_user');
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('omniscore_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('omniscore_token');
  }
};
