import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
// API 기본 URL 설정
const BASE_URL = '/api/pet';

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

// 요청 인터셉터
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (config.headers) {
            // 테스트 모드일 경우 테스트 토큰 사용
            if (USE_TEST_TOKEN) {
                config.headers.Authorization = TEST_TOKEN;
                console.log('🔧 [DEV MODE] Using test token');
            } else {
                // 일반 모드: localStorage에서 토큰 가져오기
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // 401 에러 처리
        if (error.response?.status === 401 && !originalRequest._retry && !USE_TEST_TOKEN) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post(`${BASE_URL}/auth/refresh`, {
                    refreshToken
                });

                const { accessToken } = response.data;
                localStorage.setItem('accessToken', accessToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // 에러 로깅
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
        const response = await axiosInstance.post<T>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    putFormData: async <T>(url: string, formData: FormData): Promise<T> => {
        const response = await axiosInstance.put<T>(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

export default axiosInstance;