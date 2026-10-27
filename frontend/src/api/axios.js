import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register');
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'}/auth/refresh`,
            { refreshToken },
          );
          if (res.data?.success && res.data?.data?.accessToken) {
            const newAccess = res.data.data.accessToken;
            localStorage.setItem('accessToken', newAccess);
            if (res.data.data.refreshToken) {
              localStorage.setItem('refreshToken', res.data.data.refreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return axios(originalRequest).then((r) => r.data);
          }
        } catch (e) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } else {
        localStorage.removeItem('accessToken');
      }
    }

    let rawMessage = error.response?.data?.message;
    let message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage;
    if (!message) {
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || !error.response) {
        message = 'Unable to connect to the server. Please check your internet connection or ensure the backend service is running.';
      } else {
        message = error.message || 'An unexpected error occurred. Please try again.';
      }
    }
    return Promise.reject(new Error(message));
  },
);

export default api;
