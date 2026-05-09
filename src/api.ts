import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://ai-desk-backend.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ChatResponse {
  response: string;
  query_type: string;
}

export interface AuthResponse {
  message: string;
  email?: string;
  name: string;
}

/**
 * Send a message to the AI chatbot
 */
export const chat = async (message: string): Promise<ChatResponse> => {
  const response = await api.post<ChatResponse>('/chat', { message });
  return response.data;
};

/**
 * Login a user
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/login', { email, password });
  return response.data;
};

/**
 * Signup a new user
 */
export const signup = async (email: string, password: string, name?: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/signup', { email, password, name });
  return response.data;
};

/**
 * Get the server health status
 */
export const getHealth = async (): Promise<any> => {
  const response = await api.get('/health');
  return response.data;
};

/**
 * Get the timetable URL
 */
export const getTimetableUrl = (): string => `${API_URL}/api/timetable`;

export default api;
