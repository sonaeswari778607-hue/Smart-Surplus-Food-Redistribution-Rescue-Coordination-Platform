import API from './api';

export const ngoService = {
  getNGOs: async () => {
    const response = await API.get('/ngos');
    return response.data;
  },

  getNGOById: async (id) => {
    const response = await API.get(`/ngos/${id}`);
    return response.data;
  },

  updateProfile: async (id, data) => {
    const response = await API.put(`/ngos/${id}`, data);
    return response.data;
  },

  acceptDonation: async (donationId) => {
    const response = await API.post(`/ngos/accept/${donationId}`);
    return response.data;
  }
};

export default ngoService;
