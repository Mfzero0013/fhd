import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar respostas de erro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, senha: string) =>
    api.post('/auth/login', { email, senha }),
  verify: () => api.get('/auth/verify'),
  changePassword: (senhaAtual: string, novaSenha: string) =>
    api.put('/auth/change-password', { senhaAtual, novaSenha }),
  logout: () => api.post('/auth/logout'),
};

// Users API
export const usersAPI = {
  getAll: (params?: any) => api.get('/users', { params }),
  getById: (id: number) => api.get(`/users/${id}`),
  create: (userData: any) => api.post('/users', userData),
  update: (id: number, userData: any) => api.put(`/users/${id}`, userData),
  delete: (id: number) => api.delete(`/users/${id}`),
  getForFeedback: () => api.get('/users/for-feedback/list'),
};

// Feedbacks API
export const feedbacksAPI = {
  create: (feedbackData: any) => api.post('/feedbacks', feedbackData),
  getReceived: (params?: any) => api.get('/feedbacks/received', { params }),
  getSent: (params?: any) => api.get('/feedbacks/sent', { params }),
  getById: (id: number) => api.get(`/feedbacks/${id}`),
  markAsRead: (id: number) => api.put(`/feedbacks/${id}/read`),
  delete: (id: number) => api.delete(`/feedbacks/${id}`),
  getUnreadCount: () => api.get('/feedbacks/unread/count'),
};

// Sectors API
export const sectorsAPI = {
  getAll: (params?: any) => api.get('/sectors', { params }),
  getById: (id: number) => api.get(`/sectors/${id}`),
  create: (sectorData: any) => api.post('/sectors', sectorData),
  update: (id: number, sectorData: any) => api.put(`/sectors/${id}`, sectorData),
  delete: (id: number) => api.delete(`/sectors/${id}`),
};

// Positions API
export const positionsAPI = {
  getAll: (params?: any) => api.get('/positions', { params }),
  getById: (id: number) => api.get(`/positions/${id}`),
  create: (positionData: any) => api.post('/positions', positionData),
  update: (id: number, positionData: any) => api.put(`/positions/${id}`, positionData),
  delete: (id: number) => api.delete(`/positions/${id}`),
};

// Teams API
export const teamsAPI = {
  getAll: (params?: any) => api.get('/teams', { params }),
  getMyTeam: () => api.get('/teams/my-team'),
  addMember: (teamData: any) => api.post('/teams', teamData),
  removeMember: (id: number) => api.delete(`/teams/${id}`),
  getManagers: () => api.get('/teams/managers/available'),
  getEmployees: () => api.get('/teams/employees/available'),
};

// Dashboard API
export const dashboardAPI = {
  getAdmin: () => api.get('/dashboard/admin'),
  getManager: () => api.get('/dashboard/manager'),
  getEmployee: () => api.get('/dashboard/employee'),
  getStats: () => api.get('/dashboard/stats'),
};

// Export API
export const exportAPI = {
  exportFeedbacksAdmin: (params?: any) => 
    api.get('/export/feedbacks/admin', { params, responseType: 'blob' }),
  exportFeedbacksManager: (params?: any) => 
    api.get('/export/feedbacks/manager', { params, responseType: 'blob' }),
  exportUsers: (params?: any) => 
    api.get('/export/users', { params, responseType: 'blob' }),
};

export default api;
