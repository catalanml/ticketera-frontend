// src/services/axiosConfig.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Usamos import.meta.env para acceder a la variable
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptores (como en el ejemplo anterior)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('No autorizado, sesión expirada.');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

