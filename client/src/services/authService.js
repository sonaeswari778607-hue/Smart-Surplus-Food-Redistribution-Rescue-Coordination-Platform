import API from './api';

export const authService = {
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('foodrescue_token', response.data.token);
      localStorage.setItem('foodrescue_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('foodrescue_token', response.data.token);
      localStorage.setItem('foodrescue_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('foodrescue_token');
    localStorage.removeItem('foodrescue_user');
  },

  getStoredUser: () => {
    const userStr = localStorage.getItem('foodrescue_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export default authService;
