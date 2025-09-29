import axios from 'axios';
import { ErrorHandler } from '../../shared/utils/errorHandler';

// Pet-Walk API 전용 설정
const PETWALK_API_BASE_URL = import.meta.env.VITE_PETWALK_API_BASE_URL || 'http://localhost:8005';
const BASE_URL = '/api'; // 프록시 사용시

// axios 인스턴스 생성
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 (토큰 자동 추가)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 (통합 에러 처리)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        ErrorHandler.handleAndNotify(error);
        return Promise.reject(error);
    }
);

// CRUD 함수들
export const apiClient = {
    // GET 요청
    get: async <T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> => {
        try {
            const response = await api.get(url, {params});
            return response.data as T;
        } catch (error) {
            console.error('GET 요청 실패:', error);
            throw error;
        }
    },

    // POST 요청
    post: async <T = unknown>(url: string, data?: Record<string, unknown>): Promise<T> => {
        try {
            const response = await api.post(url, data);
            return response.data as T;
        } catch (error) {
            console.error('POST 요청 실패:', error);
            throw error;
        }
    },

    // PUT 요청
    put: async <T = unknown>(url: string, data?: Record<string, unknown>): Promise<T> => {
        try {
            const response = await api.put(url, data);
            return response.data as T;
        } catch (error) {
            console.error('PUT 요청 실패:', error);
            throw error;
        }
    },

    // DELETE 요청
    delete: async (url: string) => {
        try {
            const response = await api.delete(url);
            return response.data;
        } catch (error) {
            console.error('DELETE 요청 실패:', error);
            throw error;
        }
    }
};
