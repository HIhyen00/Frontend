import axios from 'axios';
import { setupAxiosInterceptors } from '../../shared/utils/axiosInterceptors';
import type { Post, PostRequest, PostsResponse } from '../types/post.types';

const API_BASE_URL = import.meta.env.VITE_SNS_API_BASE_URL || 'http://localhost:8007/api';

// Axios 인스턴스 생성
const snsApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// 공통 인터셉터 설정 (토큰 자동 추가 및 401 처리)
setupAxiosInterceptors(snsApi);

// 게시물 API
export const postApi = {
    // 모든 게시물 조회
    getAllPosts: async (page = 0, size = 10): Promise<PostsResponse> => {
        const response = await snsApi.get<PostsResponse>('/posts', {
            params: { page, size },
        });
        return response.data;
    },

    // 랜덤 게시물 조회
    getRandomPosts: async (): Promise<Post[]> => {
        const response = await snsApi.get<Post[]>('/posts/random');
        return response.data;
    },

    // 인기 게시물 조회
    getTopPosts: async (): Promise<Post[]> => {
        const response = await snsApi.get<Post[]>('/posts/top');
        return response.data;
    },

    // 특정 게시물 조회
    getPostById: async (postId: number): Promise<Post> => {
        const response = await snsApi.get<Post>(`/posts/${postId}`);
        return response.data;
    },

    // 게시물 생성
    createPost: async (postData: PostRequest): Promise<Post> => {
        const response = await snsApi.post<Post>('/posts', postData);
        return response.data;
    },

    // 게시물 수정
    updatePost: async (postId: number, postData: PostRequest): Promise<Post> => {
        const response = await snsApi.put<Post>(`/posts/${postId}`, postData);
        return response.data;
    },

    // 게시물 삭제
    deletePost: async (postId: number): Promise<void> => {
        await snsApi.delete(`/posts/${postId}`);
    },

    // 게시물 좋아요
    likePost: async (postId: number): Promise<void> => {
        await snsApi.post(`/posts/${postId}/like`);
    },

    // 게시물 좋아요 취소
    unlikePost: async (postId: number): Promise<void> => {
        await snsApi.delete(`/posts/${postId}/like`);
    },

    // 게시물 검색
    searchPosts: async (keyword: string, page = 0, size = 10): Promise<PostsResponse> => {
        const response = await snsApi.get<PostsResponse>('/posts/search', {
            params: { keyword, page, size },
        });
        return response.data;
    },

    // 특정 사용자의 게시물 조회
    getUserPosts: async (accountId: number, page = 0, size = 10): Promise<PostsResponse> => {
        const response = await snsApi.get<PostsResponse>(`/posts/user/${accountId}`, {
            params: { page, size },
        });
        return response.data;
    },

    // 피드 조회
    getFeed: async (page = 0, size = 10): Promise<PostsResponse> => {
        const response = await snsApi.get<PostsResponse>('/posts/feed', {
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

        const response = await snsApi.post<{ imageUrl: string }>('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.imageUrl;
    },
};

export default snsApi;
