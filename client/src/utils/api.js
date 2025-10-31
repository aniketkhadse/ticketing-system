import axios from 'axios';

const API_URL = 'https://ticketing-system-production-9023.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tickets API
export const ticketAPI = {
  create: (data) => api.post('/tickets', data),
  getMyTickets: (params) => api.get('/tickets/my-tickets', { params }),
  getAllTickets: (params) => api.get('/tickets/admin/all', { params }),
  updateStatus: (ticketId, data) => api.patch(`/tickets/${ticketId}/status`, data),
  addComment: (ticketId, text) => api.post(`/tickets/${ticketId}/comments`, { text }),
};

export default api;