import {apiClient} from './axiosConfig.ts';
import type {
    KakaoBackendReverseGeocodingResponse,
    KakaoBackendSearchResponse,
    CreateWalkRouteRequest,
    UpdateWalkRouteRequest,
    WalkRouteResponse,
    WalkRouteListResponse,
} from '../types/kakaoMapsApi.ts';

export const api = {
    searchPlaces: async (
        query: string,
        searchType: 'KEYWORD' | 'CATEGORY' = 'KEYWORD',
        options?: {
            categoryGroupCode?: string;
            x?: number;
            y?: number;
            radius?: number;
            rect?: string;
            page?: number;
            size?: number;
            sort?: string;
        }
    ): Promise<KakaoBackendSearchResponse> => {
        try {
            const searchParams = new URLSearchParams();
            searchParams.append('query', query);
            searchParams.append('searchType', searchType);

            if (options) {
                Object.entries(options).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        searchParams.append(key, value.toString());
                    }
                });
            }

            const url = `/kakao-maps/search?${searchParams.toString()}`;
            console.log('요청 URL:', url); // 디버깅용

            return await apiClient.get<KakaoBackendSearchResponse>(url);
        } catch (error) {
            console.error('주소 검색 실패:', error);
            throw error;
        }
    },

    reverseGeocoding: async (
        x: string,
        y: string,
        inputCoord?: string
    ): Promise<KakaoBackendReverseGeocodingResponse> => {
        try {
            const searchParams = new URLSearchParams();
            searchParams.append('x', x);
            searchParams.append('y', y);
            if (inputCoord) {
                searchParams.append('input_coord', inputCoord);
            }

            const url = `/kakao-maps/reverse-geocoding?${searchParams.toString()}`;
            console.log('요청 URL:', url); // 디버깅용

            return await apiClient.get<KakaoBackendReverseGeocodingResponse>(url);
        } catch (error) {
            console.error('주소 검색 실패:', error);
            throw error;
        }
    },

    // Walk Routes API
    createWalkRoute: async (request: CreateWalkRouteRequest): Promise<WalkRouteResponse> => {
        try {
            return await apiClient.post<WalkRouteResponse>('/walk-routes', request);
        } catch (error) {
            console.error('산책로 생성 실패:', error);
            throw error;
        }
    },

    getWalkRoutes: async (): Promise<WalkRouteListResponse[]> => {
        try {
            return await apiClient.get<WalkRouteListResponse[]>('/walk-routes');
        } catch (error) {
            console.error('산책로 목록 조회 실패:', error);
            throw error;
        }
    },

    getWalkRoute: async (routeId: number): Promise<WalkRouteResponse> => {
        try {
            return await apiClient.get<WalkRouteResponse>(`/walk-routes/${routeId}`);
        } catch (error) {
            console.error('산책로 조회 실패:', error);
            throw error;
        }
    },

    updateWalkRoute: async (routeId: number, request: UpdateWalkRouteRequest): Promise<WalkRouteResponse> => {
        try {
            return await apiClient.put<WalkRouteResponse>(`/walk-routes/${routeId}`, request);
        } catch (error) {
            console.error('산책로 수정 실패:', error);
            throw error;
        }
    },

    deleteWalkRoute: async (routeId: number): Promise<void> => {
        try {
            await apiClient.delete(`/walk-routes/${routeId}`);
        } catch (error) {
            console.error('산책로 삭제 실패:', error);
            throw error;
        }
    }
};

// Export individual functions for convenience
export const createWalkRoute = api.createWalkRoute;
export const getWalkRoutes = api.getWalkRoutes;
export const getWalkRoute = api.getWalkRoute;
export const updateWalkRoute = api.updateWalkRoute;
export const deleteWalkRoute = api.deleteWalkRoute;
