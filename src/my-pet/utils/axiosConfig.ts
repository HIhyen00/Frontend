import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { setupAxiosInterceptors } from '../../shared/utils/axiosInterceptors';

// API 기본 URL 설정
const BASE_URL = import.meta.env.VITE_PETLIFECYCLE_API_BASE_URL || 'http://localhost:8003/api';

// Axios 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// FormData 처리를 위한 추가 인터셉터 (공통 인터셉터 전에 실행)
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (config.headers && config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 공통 인터셉터 설정 (토큰 자동 추가 및 401 처리)
setupAxiosInterceptors(axiosInstance);

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