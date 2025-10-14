import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { setupResponseInterceptor } from '../../shared/utils/axiosInterceptors';

// API 기본 URL 설정
const BASE_URL = import.meta.env.VITE_PETLIFECYCLE_API_BASE_URL ||'/api';

// Axios 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (config.headers) {
            if (config.data instanceof FormData) {
                delete config.headers['Content-Type'];
                console.log('FormData 요청 감지 - Content-Type 자동 설정');
            }

            let token = localStorage.getItem('token');
            if (!token) {
                token = sessionStorage.getItem('token');
            }

            if (token && token !== 'undefined' && token !== 'null') {
                config.headers.Authorization = `Bearer ${token}`;
                console.log('Authorization 헤더 추가:', `Bearer ${token.substring(0, 20)}...`);
            } else {
                console.warn('⚠️ 토큰이 없습니다. 인증이 필요한 요청은 실패할 수 있습니다.');
            }
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('❌ 요청 인터셉터 에러:', error);
        return Promise.reject(error);
    }
);

// 응답 인터셉터 (공통 유틸리티 사용)
setupResponseInterceptor(axiosInstance);

// 범용 CRUD 헬퍼 함수들
export const apiHelper = {
    get: async <T>(url: string, params?: any): Promise<T> => {
        const response = await axiosInstance.get<T>(url, { params });
        return response.data;
    },

    post: async <T>(url: string, data?: any): Promise<T> => {
        const response = await axiosInstance.post<T>(url, data);
        return response.data;
    },

    put: async <T>(url: string, data?: any): Promise<T> => {
        const response = await axiosInstance.put<T>(url, data);
        return response.data;
    },

    patch: async <T>(url: string, data?: any): Promise<T> => {
        const response = await axiosInstance.patch<T>(url, data);
        return response.data;
    },

    delete: async <T>(url: string): Promise<T> => {
        const response = await axiosInstance.delete<T>(url);
        return response.data;
    },

    postFormData: async <T>(url: string, formData: FormData): Promise<T> => {
        const response = await axiosInstance.post<T>(url, formData);
        return response.data;
    },

    putFormData: async <T>(url: string, formData: FormData): Promise<T> => {
        const response = await axiosInstance.put<T>(url, formData);
        return response.data;
    },
};

export default axiosInstance;