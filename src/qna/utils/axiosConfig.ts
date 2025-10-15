import axios, {type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_QNA_API_BASE_URL || "http://localhost:8004/api/qna";

export const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // 쿠키 기반 인증일 경우
});

// 요청 인터셉터: JWT 자동 적용
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token && token !== "undefined" && token !== "null") {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 처리
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error("인증 실패: 로그인 필요");
        }
        return Promise.reject(error);
    }
);

// GET
export const get = async <T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> => {
    const res = await apiClient.get(url, { params });
    return res.data as T;
};

// POST
export const post = async <T = unknown>(url: string, data?: Record<string, unknown>): Promise<T> => {
    const res = await apiClient.post(url, data);
    return res.data as T;
};

// PUT
export const put = async <T = unknown>(url: string, data?: Record<string, unknown>): Promise<T> => {
    const res = await apiClient.put(url, data);
    return res.data as T;
};

// DELETE
export const del = async (url: string): Promise<void> => {
    await apiClient.delete(url);
};
