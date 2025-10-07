import axios from 'axios';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth';
import { setupAxiosInterceptors } from '../../shared/utils/axiosInterceptors';

const ACCOUNT_API_BASE_URL = import.meta.env.VITE_ACCOUNT_API_BASE_URL || 'http://localhost:8005/api';

const authAPI = axios.create({
  baseURL: `${ACCOUNT_API_BASE_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 공통 인터셉터 설정
setupAxiosInterceptors(authAPI);

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
    try {
      await authAPI.post('/logout');
    } catch (error) {
      // 로그아웃 API 실패해도 로컬 토큰은 정리
      console.warn('Logout API failed, but clearing local token:', error);
    }
    // 토큰 정리는 useAuth에서 처리
  },

  async getCurrentUser() {
    const response = await authAPI.get('/me');
    return response.data;
  },

  async kakaoLogin(accessToken: string): Promise<LoginResponse> {
    const response = await authAPI.post<LoginResponse>('/kakao/token', {
      accessToken
    });
    return response.data;
  },

  async deleteAccount(): Promise<void> {
    await authAPI.delete('/account');
  },
};