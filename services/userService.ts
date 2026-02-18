import axios from 'axios';

const API_URL = '/api/v1/agent'; 

export const userService = {
  updateProfile: async (payload: {
    name?: string;
    avatar_url?: string;
    current_password?: string;
    new_password?: string;
  }) => {
    const response = await axios.put(`${API_URL}/profile/update`, payload);
    return response.data;
  },
};