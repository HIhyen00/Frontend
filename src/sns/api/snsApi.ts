import axios from 'axios';
import type { Post, PostRequest, PostsResponse } from '../types/post.types';

const API_BASE_URL = import.meta.env.VITE_SNS_API_URL || 'http://localhost:8007';

// Axios 인스턴스 생성
const snsApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터: Authorization 헤더 추가
snsApi.interceptors.request.use(
    (config) => {
        // userToken 또는 accessToken 사용 (userToken 우선)
        const token = localStorage.getItem('userToken') || localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터: 에러 처리
snsApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // 토큰 만료 또는 인증 실패
            console.warn('SNS API 인증 실패:', error.config?.url);
            localStorage.removeItem('userToken');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            
            // 현재 페이지가 SNS 관련 페이지인 경우에만 리다이렉트
            if (window.location.pathname.startsWith('/sns')) {
                alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// 게시물 API
export const postApi = {
    // 모든 게시물 조회
    getAllPosts: async (page = 0, size = 10): Promise<PostsResponse> => {
        const response = await snsApi.get<PostsResponse>('/api/posts', {
            params: { page, size },
        });
        return response.data;
    },

    // 랜덤 게시물 조회
    getRandomPosts: async (): Promise<Post[]> => {
        const response = await snsApi.get<Post[]>('/api/posts/random');
        return response.data;
    },

    // 인기 게시물 조회
    getTopPosts: async (): Promise<Post[]> => {
        const response = await snsApi.get<Post[]>('/api/posts/top');
        return response.data;
    },

    // 특정 게시물 조회
    getPostById: async (postId: number): Promise<Post> => {
        const response = await snsApi.get<Post>(`/api/posts/${postId}`);
        return response.data;
    },

    // 게시물 생성
    createPost: async (postData: PostRequest): Promise<Post> => {
        const response = await snsApi.post<Post>('/api/posts', postData);
        return response.data;
    },

    // 게시물 수정
    updatePost: async (postId: number, postData: PostRequest): Promise<Post> => {
        const response = await snsApi.put<Post>(`/api/posts/${postId}`, postData);
        return response.data;
    },

    // 게시물 삭제
    deletePost: async (postId: number): Promise<void> => {
        await snsApi.delete(`/api/posts/${postId}`);
    },

    // 게시물 좋아요
    likePost: async (postId: number): Promise<void> => {
        await snsApi.post(`/api/posts/${postId}/like`);
    },

    // 게시물 좋아요 취소
    unlikePost: async (postId: number): Promise<void> => {
        await snsApi.delete(`/api/posts/${postId}/like`);
    },

    // 게시물 검색
    searchPosts: async (keyword: string, page = 0, size = 10): Promise<PostsResponse> => {
        const response = await snsApi.get<PostsResponse>('/api/posts/search', {
            params: { keyword, page, size },
        });
        return response.data;
    },

    // 특정 사용자의 게시물 조회
    getUserPosts: async (accountId: number, page = 0, size = 10): Promise<PostsResponse> => {
        const response = await snsApi.get<PostsResponse>(`/api/posts/user/${accountId}`, {
            params: { page, size },
        });
        return response.data;
    },

    // 피드 조회
    getFeed: async (page = 0, size = 10): Promise<PostsResponse> => {
        const response = await snsApi.get<PostsResponse>('/api/posts/feed', {
            params: { page, size },
        });
        return response.data;
    },
};

// 이미지 업로드 API
export const uploadApi = {
    // 이미지 업로드
    uploadImage: async (file: File, folder: 'post' | 'image_gallery' = 'post'): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await snsApi.post<{ imageUrl: string }>('/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.imageUrl;
    },
};

export default snsApi;
