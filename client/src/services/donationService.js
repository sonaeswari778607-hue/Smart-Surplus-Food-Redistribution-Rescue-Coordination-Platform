import API from './api';

export const donationService = {
  createDonation: async (donationData) => {
    const response = await API.post('/donations', donationData);
    return response.data;
  },

  getAllDonations: async (filters = {}) => {
    const response = await API.get('/donations', { params: filters });
    return response.data;
  },

  getDonationById: async (id) => {
    const response = await API.get(`/donations/${id}`);
    return response.data;
  },

  updateDonation: async (id, donationData) => {
    const response = await API.put(`/donations/${id}`, donationData);
    return response.data;
  },

  deleteDonation: async (id) => {
    const response = await API.delete(`/donations/${id}`);
    return response.data;
  }
};

export default donationService;
