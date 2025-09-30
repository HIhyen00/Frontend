export interface BackendAddressSearchResponse {
    total: number;
    items: Array<{
        title: string;
        category?: string;
        address: string;
        roadAddress?: string;
        mapX: string;
        mapY: string;
        distance?: string | null;
    }>;
}

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

export interface KakaoBackendReverseGeocodingResponse {
    meta: {
        total_count: number;
    };
    documents: {
        address: {
            address_name: string;
            region_1depth_name: string;
            region_2depth_name: string;
            region_3depth_name: string;
            mountain_yn: string;
            main_address_no: string;
            sub_address_no: string;
        };
        roadAddress: {
            address_name: string;
            region_1depth_name: string;
            region_2depth_name: string;
            region_3depth_name: string;
            road_name: string;
            underground_yn: string;
            main_building_no: string;
            sub_building_no: string;
            building_name: string;
            zone_no: string;
        };
    }[];
}

export interface MeetingLocation {
    lat: number;
    lng: number;
}

export interface MeetingPlaceRequest {
    meetingLocations: MeetingLocation[];
    categoryGroupCode?: string;
    radius?: number;
    size?: number;
}

export interface MeetingPlaceResponse {
    meetingCenterPoint: {
        lat: number;
        lng: number;
        participantCount: number;
    };
    recommendedPlaces: any[];
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
    [key: string]: any;
}

export interface UpdateWalkRouteRequest {
    name: string;
    description?: string;
    coordinates: Coordinate[];
    [key: string]: any;
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
    distance: number;
    createdAt: string;
}