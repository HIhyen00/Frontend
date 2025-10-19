import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { ErrorHandler } from './errorHandler';

/**
 * 공통 Request 인터셉터: 토큰 자동 추가
 */
export const setupRequestInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // localStorage 또는 sessionStorage에서 토큰 확인
      let token = localStorage.getItem('token');
      if (!token) {
        token = sessionStorage.getItem('token');
      }

      if (token && token !== 'undefined' && token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

/**
 * 공통 Response 인터셉터: 401 에러 처리 및 한글 에러 메시지
 */
export const setupResponseInterceptor = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // 에러 로깅 (개발 환경에서만)
      if (import.meta.env.DEV) {
        console.error('API 에러 발생:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }

      // 401 Unauthorized 에러 시 자동 로그아웃
      if (error.response?.status === 401) {
        // 토큰 만료 또는 유효하지 않음
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');

        // 로그인 페이지로 리다이렉트 (현재 페이지가 로그인/회원가입이 아닐 때만)
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }
      }

      // 한글 에러 메시지 생성
      const errorMessage = ErrorHandler.handle(error);
      // 원본 에러 객체에 한글 메시지 추가
      (error as any).koreanMessage = errorMessage;
      return Promise.reject(error);
    }
  );
};

/**
 * 모든 인터셉터 설정
 */
export const setupAxiosInterceptors = (axiosInstance: AxiosInstance) => {
  setupRequestInterceptor(axiosInstance);
  setupResponseInterceptor(axiosInstance);
};
