import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodrescue_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor for handling unauthorized responses
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and handle session expiry if necessary
      localStorage.removeItem('foodrescue_token');
      localStorage.removeItem('foodrescue_user');
    }
    return Promise.reject(error);
  }
);

export default API;
