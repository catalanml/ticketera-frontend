// src/services/axiosConfig.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    // Check if it's a 401 error and not a request to the login endpoint itself
    if (error.response && error.response.status === 401 && !error.config.url?.includes('/login')) { // Adjust '/login' if your login path is different
      console.error('Unauthorized or session expired. Logging out.');
      // Clear authentication data
      localStorage.removeItem('token');
      // Optionally remove user data if stored separately
      // localStorage.removeItem('user');

      // Redirect to login page
      // Use window.location to redirect outside of React Router context
      window.location.href = '/login'; // Adjust '/login' if your login route is different

      // Return a rejected promise to prevent further processing of the error
      // in the component that made the original request.
      return Promise.reject(new Error('Session expired'));
    }
    // For other errors, just reject the promise
    return Promise.reject(error);
  }
);

export default axiosInstance;

