// Smart Expense Tracker - API Service
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('/api/auth/refresh', {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          const { access_token } = response.data.data;
          localStorage.setItem('accessToken', access_token);

          // Retry the original request with new token
          original.headers.Authorization = `Bearer ${access_token}`;
          return api(original);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    refresh: () => api.post('/auth/refresh'),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
    logout: () => api.post('/auth/logout'),
    deleteAccount: (data) => api.delete('/auth/delete-account', { data }),
  },

  // Expense endpoints
  expenses: {
    getAll: (params) => api.get('/expenses', { params }),
    getById: (id) => api.get(`/expenses/${id}`),
    create: (data) => api.post('/expenses', data),
    update: (id, data) => api.put(`/expenses/${id}`, data),
    delete: (id) => api.delete(`/expenses/${id}`),
    bulkDelete: (expenseIds) => api.post('/expenses/bulk-delete', { expense_ids: expenseIds }),
    suggestCategory: (data) => api.post('/expenses/suggest-category', data),
    getStats: (params) => api.get('/expenses/stats', { params }),
    getCategories: () => api.get('/expenses/categories'),
  },

  // Upload endpoints
  upload: {
    receipt: (formData) => api.post('/upload/receipt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    createExpenseFromReceipt: (data) => api.post('/upload/receipt/create-expense', data),
    reprocessReceipt: (fileId) => api.post(`/upload/receipt/reprocess/${fileId}`),
    bulkUpload: (formData) => api.post('/upload/receipt/bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    deleteFile: (fileId) => api.delete(`/upload/receipt/${fileId}/delete`),
    getStats: () => api.get('/upload/stats'),
  },

  // Dashboard endpoints
  dashboard: {
    getOverview: (params) => api.get('/dashboard/overview', { params }),
    getSpendingTrends: (params) => api.get('/dashboard/spending-trends', { params }),
    getCategoryAnalysis: (params) => api.get('/dashboard/category-analysis', { params }),
    getMonthlyComparison: (params) => api.get('/dashboard/monthly-comparison', { params }),
    getBudgetAnalysis: () => api.get('/dashboard/budget-analysis'),
    getInsights: () => api.get('/dashboard/insights'),
    getPredictions: () => api.get('/dashboard/predictions'),
    getTopMerchants: (params) => api.get('/dashboard/top-merchants', { params }),
    getExpensePatterns: (params) => api.get('/dashboard/expense-patterns', { params }),
    exportData: (params) => api.get('/dashboard/export-data', { params }),
  },

  // Health check
  health: () => api.get('/health'),
};

// Utility functions
export const apiUtils = {
  // Handle API errors
  handleError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  // Format API response
  formatResponse: (response) => {
    if (response.data?.data) {
      return response.data.data;
    }
    return response.data;
  },

  // Check if response is successful
  isSuccess: (response) => {
    return response.data?.status === 'success';
  },
};

export default api;