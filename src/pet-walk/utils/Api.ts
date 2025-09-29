import {apiClient} from './axiosConfig.ts';
import type {
    KakaoBackendReverseGeocodingResponse,
    KakaoBackendSearchResponse,
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
    }
};
