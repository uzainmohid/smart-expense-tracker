// Smart Expense Tracker - Auth Service
import { apiService, apiUtils } from './api';

export const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await apiService.auth.login(credentials);

      if (apiUtils.isSuccess(response)) {
        const { user, access_token, refresh_token } = apiUtils.formatResponse(response);

        // Store tokens and user data
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        localStorage.setItem('user', JSON.stringify(user));

        return { success: true, user };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      return { success: false, error: apiUtils.handleError(error) };
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await apiService.auth.register(userData);

      if (apiUtils.isSuccess(response)) {
        const { user, access_token, refresh_token } = apiUtils.formatResponse(response);

        // Store tokens and user data
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        localStorage.setItem('user', JSON.stringify(user));

        return { success: true, user };
      }

      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return { success: false, error: apiUtils.handleError(error) };
    }
  },

  // Logout user
  logout: async () => {
    try {
      await apiService.auth.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    const user = authService.getCurrentUser();
    return !!(token && user);
  },

  // Get access token
  getToken: () => {
    return localStorage.getItem('accessToken');
  },

  // Refresh user profile
  refreshProfile: async () => {
    try {
      const response = await apiService.auth.getProfile();

      if (apiUtils.isSuccess(response)) {
        const user = apiUtils.formatResponse(response).user;
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }

      return { success: false, error: 'Failed to refresh profile' };
    } catch (error) {
      return { success: false, error: apiUtils.handleError(error) };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiService.auth.updateProfile(profileData);

      if (apiUtils.isSuccess(response)) {
        const user = apiUtils.formatResponse(response).user;
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }

      return { success: false, error: 'Failed to update profile' };
    } catch (error) {
      return { success: false, error: apiUtils.handleError(error) };
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await apiService.auth.changePassword(passwordData);

      if (apiUtils.isSuccess(response)) {
        return { success: true };
      }

      return { success: false, error: 'Failed to change password' };
    } catch (error) {
      return { success: false, error: apiUtils.handleError(error) };
    }
  },

  // Delete account
  deleteAccount: async (password) => {
    try {
      const response = await apiService.auth.deleteAccount({ password });

      if (apiUtils.isSuccess(response)) {
        // Clear local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        return { success: true };
      }

      return { success: false, error: 'Failed to delete account' };
    } catch (error) {
      return { success: false, error: apiUtils.handleError(error) };
    }
  },
};