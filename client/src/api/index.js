import axios from 'axios';

const API = axios.create({ 
  baseURL: 'http://localhost:5000',
  withCredentials: true,
  timeout: 10000
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Content-Type'] = 'application/json';
  return config;
});

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - server may be down');
      throw new Error('Cannot connect to server. Please make sure the backend is running.');
    }
    
    // Token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('msisdn');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

// Endpoints
export const sendOtp = msisdn => API.post('/auth/send-otp', { msisdn });
export const verifyOtp = (msisdn, otp) => API.post('/auth/verify-otp', { msisdn, otp });
export const getServices = () => API.get('/services');
export const getSubscriptions = () => API.get('/subscriptions');
export const subscribeService = serviceId => API.post('/subscriptions', { serviceId });
export const unsubscribeService = serviceId => API.delete(`/subscriptions/${serviceId}`);
export const getTransactions = () => API.get('/transactions');