import axios from 'axios';
import Swal from 'sweetalert2';

export const BASE_HOST = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').trim().replace(/\/+$/, '');
export const API_VERSION = (import.meta.env.VITE_API_VERSION || 'v0').trim().replace(/^\/+|\/+$/g, '');
export const API_BASE_URL = `${BASE_HOST}/api/${API_VERSION}`;
let isRedirecting = false;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && !('data' in body)) {
      Object.defineProperty(body, 'data', { value: body, enumerable: false, writable: true });
    }
    return body;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Something went wrong';

    if (status === 401) {
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');

      if (!isRedirecting && typeof window !== 'undefined') {
        const isAuthorizedPath = window.location.pathname.includes('/authorized') || window.location.pathname.includes('/dashboard');
        if (isAuthorizedPath) {
          isRedirecting = true;
          Swal.fire({
            icon: 'warning',
            title: 'Session Expired',
            text: 'Your session has expired. Please login again.',
            confirmButtonText: 'Login',
            allowOutsideClick: false,
          }).then(() => {
            window.location.href = '/admin-login';
          });
        }
      }
    }

    return Promise.reject({
      status,
      message,
      data: error.response?.data,
      originalError: error,
    });
  }
);

export default apiClient;
