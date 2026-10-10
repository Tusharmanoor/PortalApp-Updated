import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token and handle FormData Content-Type
apiClient.interceptors.request.use(
  (config) => {
    // If sending FormData, delete application/json default so Axios sets multipart/form-data with boundary
    if (config.data instanceof FormData) {
      if (typeof (config.headers as any).delete === 'function') {
        (config.headers as any).delete('Content-Type');
        (config.headers as any).delete('content-type');
      } else {
        delete (config.headers as any)['Content-Type'];
        delete (config.headers as any)['content-type'];
      }
    }

    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error('Error reading auth token from storage:', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 unauthenticated
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Session expired or unauthorized. Please re-login.');
    }
    return Promise.reject(error);
  }
);
