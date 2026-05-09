import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://ai-desk-backend.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Send a message to the AI chatbot
 * @param {string} message 
 * @returns {Promise<{response: string, query_type: string}>}
 */
export const chat = async (message) => {
  const response = await api.post('/chat', { message });
  return response.data;
};

/**
 * Login a user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{message: string, email: string, name: string}>}
 */
export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

/**
 * Signup a new user
 * @param {string} email 
 * @param {string} password 
 * @param {string} name 
 * @returns {Promise<{message: string, name: string}>}
 */
export const signup = async (email, password, name) => {
  const response = await api.post('/api/auth/signup', { email, password, name });
  return response.data;
};

/**
 * Get the server health status
 */
export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

/**
 * Get the timetable URL
 */
export const getTimetableUrl = () => `${API_URL}/api/timetable`;

export default api;
