import axios from 'axios';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth';
import { ErrorHandler } from '../../shared/utils/errorHandler';

const ACCOUNT_API_BASE_URL = import.meta.env.VITE_ACCOUNT_API_BASE_URL || 'http://localhost:8005/api';

const authAPI = axios.create({
  baseURL: `${ACCOUNT_API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    ErrorHandler.handleAndNotify(error);
    return Promise.reject(error);
  }
);

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await authAPI.post<LoginResponse>('/login', data);
    // Store token for future requests
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
    }
    return response.data;
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await authAPI.post<LoginResponse>('/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await authAPI.post('/logout');
    } catch (error) {
      // 로그아웃 API 실패해도 로컬 토큰은 정리
      console.warn('Logout API failed, but clearing local token:', error);
    } finally {
      // 항상 로컬 토큰 정리
      localStorage.removeItem('token');
    }
  },

  async getCurrentUser() {
    const response = await authAPI.get('/me');
    return response.data;
  },

  async kakaoLogin(accessToken: string): Promise<LoginResponse> {
    console.log('Kakao login request with accessToken:', accessToken);
    const response = await authAPI.post<LoginResponse>('/kakao/token', {
      accessToken
    });
    console.log('Kakao login response:', response.data);
    // Store token for future requests
    if (response.data.accessToken) {
      console.log('Storing token:', response.data.accessToken);
      localStorage.setItem('token', response.data.accessToken);
    } else {
      console.warn('No accessToken in response:', response.data);
    }
    return response.data;
  },
};