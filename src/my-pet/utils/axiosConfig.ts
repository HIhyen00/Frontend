import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { setupResponseInterceptor } from '../../shared/utils/axiosInterceptors';

// API 기본 URL 설정
const PETLIFECYCLE_API_BASE_URL = import.meta.env.VITE_PETLIFECYCLE_API_BASE_URL || 'http://localhost:8003';
const BASE_URL = '/api';

// 개발 환경에서 사용할 테스트 토큰 (프로덕션에서는 절대 사용 금지!)
const USE_TEST_TOKEN = import.meta.env.VITE_USE_TEST_TOKEN === 'true';
const TEST_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';

// Axios 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 요청 인터셉터 (테스트 모드 지원 + FormData 처리)
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (config.headers) {
            // 🔥 FormData 처리: Content-Type을 자동으로 설정하도록 제거
            if (config.data instanceof FormData) {
                delete config.headers['Content-Type'];
                console.log('📤 FormData 요청 감지 - Content-Type 자동 설정');
            }

            // 테스트 모드일 경우 테스트 토큰 사용
            if (USE_TEST_TOKEN) {
                config.headers.Authorization = TEST_TOKEN;
                console.log('🔧 [DEV MODE] Using test token');
            } else {
                // 일반 모드: localStorage 또는 sessionStorage에서 토큰 가져오기
                let token = localStorage.getItem('token');
                if (!token) {
                    token = sessionStorage.getItem('token');
                }

                if (token && token !== 'undefined' && token !== 'null') {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        }

        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// 응답 인터셉터 (공통 유틸리티 사용, 테스트 모드에서는 401 리다이렉트 제외)
if (!USE_TEST_TOKEN) {
    setupResponseInterceptor(axiosInstance);
} else {
    // 테스트 모드에서는 에러 로깅만
    axiosInstance.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            if (error.response) {
                console.error('❌ API Error:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('❌ Network Error:', error.request);
            } else {
                console.error('❌ Error:', error.message);
            }
            return Promise.reject(error);
        }
    );
}

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

    // ✅ 수정: FormData는 Content-Type을 자동으로 설정하도록
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