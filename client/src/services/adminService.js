import API from './api';

export const adminService = {
  getUsers: async () => {
    const response = await API.get('/admin/users');
    return response.data;
  },

  getDonations: async () => {
    const response = await API.get('/admin/donations');
    return response.data;
  },

  verifyNGO: async (id) => {
    const response = await API.put(`/admin/ngos/${id}/verify`);
    return response.data;
  },

  getStats: async () => {
    const response = await API.get('/admin/stats');
    return response.data;
  }
};

export default adminService;
