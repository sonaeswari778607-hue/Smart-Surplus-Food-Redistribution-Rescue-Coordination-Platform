import API from './api';

export const volunteerService = {
  getVolunteers: async () => {
    const response = await API.get('/volunteers');
    return response.data;
  },

  getVolunteerById: async (id) => {
    const response = await API.get(`/volunteers/${id}`);
    return response.data;
  },

  updateProfile: async (id, data) => {
    const response = await API.put(`/volunteers/${id}`, data);
    return response.data;
  },

  updateTaskStatus: async (assignmentId, status) => {
    const response = await API.put(`/assignments/${assignmentId}/status`, { status });
    return response.data;
  }
};

export default volunteerService;
