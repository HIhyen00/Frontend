import axios from 'axios';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api';

const authAPI = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await authAPI.post<LoginResponse>('/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await authAPI.post<LoginResponse>('/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await authAPI.post('/logout');
  },

  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await authAPI.post<LoginResponse>('/refresh', {
      refreshToken,
    });
    return response.data;
  },

  async getCurrentUser() {
    const response = await authAPI.get('/me');
    return response.data;
  },

  async kakaoLogin(): Promise<void> {
    const redirectUri = `${window.location.origin}/oauth2/redirect`;
    window.location.href = `${API_BASE_URL.replace('/api', '')}/oauth2/authorization/kakao?redirect_uri=${encodeURIComponent(redirectUri)}`;
  },
};