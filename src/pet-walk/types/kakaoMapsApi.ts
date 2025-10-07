export interface KakaoBackendSearchResponse {
    meta: {
        total_count: number;
        pageable_count: number;
        is_end: boolean;
        same_name?: {
            region: string[];
            keyword: string;
            selected_region: string;
        };
    };
    documents: {
        id?: string;
        place_name: string;
        category_name?: string;
        category_group_code?: string;
        category_group_name?: string;
        phone?: string;
        address_name: string;
        road_address_name?: string;
        x: string; // 경도
        y: string; // 위도
        place_url?: string;
        distance?: string;
    }[];
}

// Walk Route Types
export interface Coordinate {
    lat: number;
    lng: number;
}

export interface CreateWalkRouteRequest {
    name: string;
    description?: string;
    coordinates: Coordinate[];
}

export interface WalkRouteResponse {
    id: number;
    name: string;
    description?: string;
    coordinates: Coordinate[];
    distance: number;
    createdAt: string;
    updatedAt: string;
}

export interface WalkRouteListResponse {
    id: number;
    name: string;
    description?: string;
    coordinates: Coordinate[];
    distance: number;
    createdAt: string;
}