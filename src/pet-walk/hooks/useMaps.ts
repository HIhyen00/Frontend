import {useState, useCallback, useEffect, useRef} from "react";
import {api} from '../utils/Api.ts';
import type {KakaoBackendSearchResponse} from "../types/kakaoMapsApi.ts";
import {useKakaoMaps} from './useKakaoMaps';

// 카테고리별 검색 설정 - 반려동물 전용 키워드
const CATEGORY_CONFIG = {
    '동물병원': {
        searchType: 'KEYWORD' as const,
        query: '동물병원',
        categoryCode: null,
        description: '동물병원 전용 검색'
    },
    '펫샵': {
        searchType: 'KEYWORD' as const,
        query: '펫샵',
        categoryCode: null,
        description: '펫샵 전용 검색'
    },
    '애견미용': {
        searchType: 'KEYWORD' as const,
        query: '애견미용',
        categoryCode: null,
        description: '애견미용 전용 검색'
    },
    '애견공원': {
        searchType: 'KEYWORD' as const,
        query: '애견공원',
        categoryCode: null,
        description: '애견공원 전용 검색'
    },
    '애견카페': {
        searchType: 'KEYWORD' as const,
        query: '애견카페',
        categoryCode: null,
        description: '애견카페 전용 검색'
    },
    '애견호텔': {
        searchType: 'KEYWORD' as const,
        query: '애견호텔',
        categoryCode: null,
        description: '애견호텔 전용 검색'
    },
};

export const useMaps = () => {
    // Kakao Maps API 로딩 상태 (에러 처리 강화)
    const kakaoMapsResult = useKakaoMaps();

    // 안전한 상태 확인
    if (!kakaoMapsResult) {
        console.error('useKakaoMaps 훅이 undefined를 반환했습니다.');
        return null;
    }

    const kakaoMapsLoaded = kakaoMapsResult.isLoaded || false;
    const kakaoMapsLoading = kakaoMapsResult.isLoading || false;
    const kakaoMapsError = kakaoMapsResult.error || null;

    const [map, setMap] = useState<kakao.maps.Map | null>(null);
    const [searchKeyword, setSearchKeyword] = useState<string>("");
    const [searchResults, setSearchResults] = useState<KakaoBackendSearchResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentMarker, setCurrentMarker] = useState<kakao.maps.Marker | null>(null);
    const [searchMarkers, setSearchMarkers] = useState<kakao.maps.Marker[]>([]);
    const [currentInfoWindow, setCurrentInfoWindow] = useState<kakao.maps.InfoWindow | null>(null);
    const [selectedPlace, setSelectedPlace] = useState<any>(null);
    const [selectedPlacePosition, setSelectedPlacePosition] = useState<{x: number, y: number} | null>(null);
    const [showWebView, setShowWebView] = useState<boolean>(false);
    const [webViewUrl, setWebViewUrl] = useState<string>('');

    // WebView 상태 안정성을 위한 ref
    const webViewStateRef = useRef({ showWebView: false, webViewUrl: '' });
    const webViewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // WebView 상태 디버깅 및 ref 동기화
    useEffect(() => {
        webViewStateRef.current = { showWebView, webViewUrl };
        console.log('🔍 WebView 상태 변경:', { showWebView, webViewUrl });
    }, [showWebView, webViewUrl]);
    const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
    const [locationLoading, setLocationLoading] = useState<boolean>(false);
    const [searchRadius, setSearchRadius] = useState<number>(1000); // 기본 1km

    // Kakao Maps 에러를 전체 에러에 포함 (더 안전한 처리)
    useEffect(() => {
        try {
            if (kakaoMapsError) {
                console.error('Kakao Maps API 에러:', kakaoMapsError);
                setError(kakaoMapsError);
            }
        } catch (err) {
            console.error('useEffect 에러 처리 중 예외 발생:', err);
        }
    }, [kakaoMapsError]);

    // 마커 관리 함수들 (개선된 버전)
    const clearAllMarkers = useCallback(() => {
        // 검색 결과 마커들 완전 제거
        searchMarkers.forEach(marker => {
            marker.setMap(null);
        });
        setSearchMarkers([]);

        // 현재 마커 제거
        if (currentMarker) {
            currentMarker.setMap(null);
            setCurrentMarker(null);
        }

        // 인포윈도우 제거
        if (currentInfoWindow) {
            currentInfoWindow.close();
            setCurrentInfoWindow(null);
        }

        // 선택된 장소 정보도 초기화
        setSelectedPlace(null);

        console.log('모든 마커 및 선택 상태 초기화 완료');
    }, [searchMarkers, currentMarker, currentInfoWindow]);

    // 안전한 커스텀 마커 생성 (외부 이미지 의존성 제거)
    const createCustomMarkerImage = useCallback((color: 'red' | 'blue' | 'green' = 'red') => {
        if (!kakaoMapsLoaded || !window.kakao?.maps) return null;

        const colorMap: Record<string, string> = {
            red: '#ef4444',
            blue: '#3b82f6',
            green: '#10b981'
        };

        const fillColor = colorMap[color] || colorMap.red;

        // Base64 인코딩된 SVG 마커 (외부 서버 의존성 없음)
        const svg = `<svg width="24" height="35" viewBox="0 0 24 35" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
                </filter>
            </defs>
            <path d="M12 2c-5.5 0-10 4.5-10 10 0 7.5 10 20 10 20s10-12.5 10-20c0-5.5-4.5-10-10-10z"
                  fill="${fillColor}"
                  stroke="white"
                  stroke-width="2"
                  filter="url(#shadow)"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
        </svg>`;

        const encodedSvg = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
        const imageSize = new window.kakao.maps.Size(24, 35);
        const imageOption = { offset: new window.kakao.maps.Point(12, 35) };

        return new window.kakao.maps.MarkerImage(encodedSvg, imageSize, imageOption);
    }, [kakaoMapsLoaded]);

    const addSearchResultMarkers = useCallback((places: any[]) => {
        if (!kakaoMapsLoaded || !map || !window.kakao?.maps) return;

        console.log(`마커 추가 시작: ${places.length}개 장소`);

        // 기존 마커들 완전 제거
        searchMarkers.forEach(marker => marker.setMap(null));

        if (places.length === 0) {
            setSearchMarkers([]);
            console.log('검색 결과 없음 - 모든 마커 제거');
            return;
        }

        const newMarkers: kakao.maps.Marker[] = [];
        const bounds = new window.kakao.maps.LatLngBounds();

        places.forEach((place, index) => {
            const position = new window.kakao.maps.LatLng(parseFloat(place.y), parseFloat(place.x));
            const markerImage = createCustomMarkerImage(index === 0 ? 'red' : 'blue');

            const marker = new window.kakao.maps.Marker({
                position,
                map,
                image: markerImage,
                title: place.place_name
            });

            // 마커 클릭 이벤트 (화면 좌표 계산 개선)
            window.kakao.maps.event.addListener(marker, 'click', () => {
                console.log('마커 클릭됨:', place.place_name);

                // 지도 컨테이너 확인
                const mapContainer = document.getElementById('map');
                if (!mapContainer) {
                    console.error('지도 컨테이너를 찾을 수 없습니다.');
                    return;
                }

                // 마커 위치를 화면 좌표로 변환
                const markerPosition = marker.getPosition();
                const projection = map.getProjection();

                try {
                    // 카카오맵 API를 사용한 화면 좌표 변환
                    const screenPoint = projection.pointFromCoords(markerPosition);
                    const mapRect = mapContainer.getBoundingClientRect();

                    // 실제 화면 좌표 계산 (지도 컨테이너 기준)
                    const screenX = mapRect.left + screenPoint.x;
                    const screenY = mapRect.top + screenPoint.y;

                    console.log('마커 화면 좌표:', { x: screenX, y: screenY });
                    console.log('지도 컨테이너 위치:', mapRect);

                    setSelectedPlacePosition({ x: screenX, y: screenY });
                } catch (error) {
                    console.error('화면 좌표 계산 오류:', error);
                    // 실패 시 기본 위치 사용
                    setSelectedPlacePosition(null);
                }

                // 거리 계산 (지도 중심 기준)
                const mapCenter = map.getCenter();
                const distance = calculateDistance(
                    mapCenter.getLat(),
                    mapCenter.getLng(),
                    parseFloat(place.y),
                    parseFloat(place.x)
                );

                // 거리 정보 추가
                const placeWithDistance = {
                    ...place,
                    distance: Math.round(distance * 1000) // 미터 단위
                };

                setSelectedPlace(placeWithDistance);

                // 지도를 부드럽게 이동
                const moveLatLng = new window.kakao.maps.LatLng(parseFloat(place.y), parseFloat(place.x));
                map.panTo(moveLatLng);
            });

            newMarkers.push(marker);
            bounds.extend(position);
        });

        // 새 마커들 설정
        setSearchMarkers(newMarkers);

        // 지도 뷰포트 자동 조정
        setTimeout(() => {
            if (newMarkers.length === 1) {
                // 결과가 1개일 때는 해당 위치로 이동
                const position = newMarkers[0].getPosition();
                map.setCenter(position);
                map.setLevel(3);
            } else if (newMarkers.length > 1) {
                // 결과가 여러개일 때는 전체가 보이도록
                map.setBounds(bounds);
            }
        }, 300);

        console.log(`마커 추가 완료: ${newMarkers.length}개`);
    }, [kakaoMapsLoaded, map, createCustomMarkerImage, searchMarkers]);

    // 키워드 검색 (개선된 버전)
    const handleSearch = async (keyword?: string) => {
        const searchTerm = keyword || searchKeyword;
        if (!searchTerm.trim()) {
            setError('검색어를 입력해주세요.');
            return;
        }

        console.log(`키워드 검색 시작: ${searchTerm}`);

        setLoading(true);
        setError(null);
        setSelectedPlace(null);

        try {
            const response = await api.searchPlaces(searchTerm, "KEYWORD");
            setSearchResults(response);

            // 결과에 따라 마커 처리
            addSearchResultMarkers(response.documents || []);

            console.log(`키워드 검색 완료: ${searchTerm}, 결과: ${response.documents?.length || 0}개`);
        } catch (error) {
            console.error(`키워드 검색 실패: ${searchTerm}`, error);

            const errorMessage = error instanceof Error
                ? error.message
                : '검색 중 오류가 발생했습니다.';
            setError(errorMessage);
            setSearchResults(null);

            // 에러 시에도 기존 마커 정리
            addSearchResultMarkers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyUp = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // 지도의 특정 위치로 이동 (간소화된 버전 - 인포윈도우 제거)
    const moveToLocation = (lat: number, lng: number, placeData: any) => {
        if (!map) return;

        // 기존 인포윈도우 닫기 (혹시 남아있다면)
        if (currentInfoWindow) {
            currentInfoWindow.close();
            setCurrentInfoWindow(null);
        }

        // 거리 계산 (지도 중심 기준)
        const mapCenter = map.getCenter();
        const distance = calculateDistance(
            mapCenter.getLat(),
            mapCenter.getLng(),
            lat,
            lng
        );

        // 거리 정보 추가
        const placeWithDistance = {
            ...placeData,
            distance: Math.round(distance * 1000) // 미터 단위
        };

        // 선택된 장소 정보 업데이트 (우리 모달만 표시)
        setSelectedPlace(placeWithDistance);

        // 지도를 부드럽게 이동
        const moveLatLng = new window.kakao.maps.LatLng(lat, lng);
        map.panTo(moveLatLng);

        // 줌 레벨 조정
        if (map.getLevel() > 3) {
            map.setLevel(3);
        }
    };

    // 웹뷰 관련 함수들 (StrictMode 대응 강화)
    const openWebView = useCallback((url: string) => {
        console.log('🔗 WebView 열기 요청:', url);
        console.log('현재 WebView 상태:', webViewStateRef.current);

        if (!url || !url.trim()) {
            console.error('⚠️ WebView URL이 비어있습니다.');
            return;
        }

        // 이미 같은 URL이 열려있으면 무시
        if (webViewStateRef.current.showWebView && webViewStateRef.current.webViewUrl === url) {
            console.log('⏭️ 같은 URL이 이미 열려있습니다. 무시.');
            return;
        }

        // 기존 타이머 정리
        if (webViewTimeoutRef.current) {
            clearTimeout(webViewTimeoutRef.current);
            webViewTimeoutRef.current = null;
        }

        console.log('🚀 WebView 상태 업데이트 시작...');

        // 즉시 상태 업데이트 (StrictMode에서도 안정적)
        setWebViewUrl(url);
        setShowWebView(true);

        console.log('✅ WebView 모달 열기 완료');
    }, []);

    const closeWebView = useCallback(() => {
        console.log('❌ WebView 닫기 요청');
        console.log('현재 WebView 상태:', webViewStateRef.current);

        if (!webViewStateRef.current.showWebView) {
            console.log('⏭️ WebView가 이미 닫혀있습니다. 무시.');
            return;
        }

        // 기존 타이머 정리
        if (webViewTimeoutRef.current) {
            clearTimeout(webViewTimeoutRef.current);
            webViewTimeoutRef.current = null;
        }

        console.log('🚀 WebView 상태 초기화 시작...');
        setShowWebView(false);

        // 모달 애니메이션 후 URL 정리
        webViewTimeoutRef.current = setTimeout(() => {
            setWebViewUrl('');
            console.log('✅ WebView 상태 초기화 완료');
        }, 200);
    }, []);

    // 현재 위치 가져오기 (개선된 버전)
    const getCurrentLocation = () => {
        console.log('현재 위치 요청 시작');
        setLocationLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('위치 서비스가 지원되지 않습니다.');
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const location = { lat: latitude, lng: longitude };
                console.log(`현재 위치 획득: (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`);
                setCurrentLocation(location);

                if (map) {
                    // 기존 위치 마커 제거
                    if (currentMarker) {
                        currentMarker.setMap(null);
                        setCurrentMarker(null);
                    }

                    // 기존 인포윈도우 닫기
                    if (currentInfoWindow) {
                        currentInfoWindow.close();
                        setCurrentInfoWindow(null);
                    }

                    // 현재 위치로 지도 이동 (정확한 중앙 정렬)
                    const moveLatLng = new window.kakao.maps.LatLng(latitude, longitude);
                    map.setCenter(moveLatLng);
                    map.setLevel(3); // 더 자세한 레벨

                    // 현재 위치 마커 생성 (특별한 이미지 사용)
                    const currentLocationImage = createCustomMarkerImage('green');
                    const marker = new window.kakao.maps.Marker({
                        position: moveLatLng,
                        map: map,
                        image: currentLocationImage,
                        title: '현재 위치'
                    });

                    // 현재 위치 인포윈도우 (개선된 디자인)
                    const infoWindowContent = `
                        <div style="
                            padding: 16px;
                            min-width: 240px;
                            font-family: 'Pretendard', 'Malgun Gothic', sans-serif;
                            border-radius: 12px;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                        ">
                            <div style="
                                font-weight: 700;
                                font-size: 16px;
                                margin-bottom: 12px;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            ">
                                <span style="font-size: 18px;">📍</span>
                                현재 위치
                            </div>
                            <div style="
                                font-size: 13px;
                                opacity: 0.9;
                                line-height: 1.5;
                                background: rgba(255,255,255,0.1);
                                padding: 8px;
                                border-radius: 6px;
                            ">
                                <div>위도: ${latitude.toFixed(6)}</div>
                                <div>경도: ${longitude.toFixed(6)}</div>
                            </div>
                        </div>
                    `;

                    const infoWindow = new window.kakao.maps.InfoWindow({
                        content: infoWindowContent,
                        removable: true
                    });

                    infoWindow.open(map, marker);
                    setCurrentMarker(marker);
                    setCurrentInfoWindow(infoWindow);
                }
                
                setLocationLoading(false);
            },
            (error) => {
                let errorMessage = '위치를 가져올 수 없습니다.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = '위치 접근 권한이 거부되었습니다.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = '위치 정보를 사용할 수 없습니다.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = '위치 요청 시간이 초과되었습니다.';
                        break;
                }
                setError(errorMessage);
                setLocationLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        );
    };

    // 카테고리별 최적화된 검색 수행
    const performOptimizedSearch = async (category: string, searchLat: number, searchLng: number) => {
        const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];

        if (!config) {
            // 기본 키워드 검색
            return await api.searchPlaces(category, "KEYWORD", {
                x: searchLng,
                y: searchLat,
                radius: searchRadius,
                size: 15,
                sort: 'distance'
            });
        }

        if (config.searchType === 'CATEGORY' && config.categoryCode) {
            // 카테고리 코드 기반 검색 (더 정확하고 빠름)
            console.log(`카테고리 코드 검색: ${category} (${config.categoryCode}) - ${config.description}`);
            return await api.searchPlaces(config.query, "CATEGORY", {
                categoryGroupCode: config.categoryCode,
                x: searchLng,
                y: searchLat,
                radius: searchRadius,
                size: 15,
                sort: 'distance'
            });
        } else {
            // 키워드 기반 검색 (단순 키워드)
            console.log(`키워드 검색: ${category} (${config.query}) - ${config.description}`);
            return await api.searchPlaces(config.query, "KEYWORD", {
                x: searchLng,
                y: searchLat,
                radius: searchRadius,
                size: 15,
                sort: 'distance'
            });
        }
    };

    // GPS 기준 검색 함수 제거됨 (지도 중심 검색으로 통일)

    // 지도 화면 중심 기준 검색 (개선된 버전)
    const searchNearbyPlacesByMapCenter = async (category: string) => {
        if (!map) {
            setError('지도를 불러오는 중입니다.');
            return;
        }

        const center = map.getCenter();
        const centerLat = center.getLat();
        const centerLng = center.getLng();

        console.log(`검색 시작: ${category}, 위치: (${centerLat.toFixed(4)}, ${centerLng.toFixed(4)})`);

        setLoading(true);
        setError(null);

        // 검색 시작 전에 선택된 장소 정보 초기화
        setSelectedPlace(null);

        try {
            const response = await performOptimizedSearch(category, centerLat, centerLng);
            setSearchResults(response);

            // 결과에 따라 마커 처리 (빈 배열도 처리)
            addSearchResultMarkers(response.documents || []);

            console.log(`검색 완료: ${category}, 결과: ${response.documents?.length || 0}개`);
        } catch (error) {
            console.error(`검색 실패: ${category}`, error);

            const errorMessage = error instanceof Error
                ? error.message
                : '지도 중심 기준 검색 중 오류가 발생했습니다.';
            setError(errorMessage);
            setSearchResults(null);

            // 에러 시에도 기존 마커 정리
            addSearchResultMarkers([]);
        } finally {
            setLoading(false);
        }
    };


    // 실시간 지도 이동 기반 자동 검색
    const handleMapDragEnd = async (selectedCategory: string) => {
        if (!map || !selectedCategory) return;

        const center = map.getCenter();
        const centerLat = center.getLat();
        const centerLng = center.getLng();

        // 디바운싱을 위한 지연
        setTimeout(async () => {
            try {
                const response = await performOptimizedSearch(selectedCategory, centerLat, centerLng);
                setSearchResults(response);
                console.log(`지도 이동 후 자동 검색 (${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}):`, response);
            } catch (error) {
                console.error('자동 검색 실패:', error);
            }
        }, 500);
    };

    // 현재 위치로 지도 이동
    const moveToCurrentLocation = () => {
        if (!map || !currentLocation) {
            getCurrentLocation();
            return;
        }

        // 기존 마커 제거
        if (currentMarker) {
            currentMarker.setMap(null);
        }

        // 현재 위치로 지도 이동
        const moveLatLng = new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
        map.setCenter(moveLatLng);
        map.setLevel(4);

        // 현재 위치 마커 생성
        const marker = new window.kakao.maps.Marker({
            position: moveLatLng,
            map: map
        });

        // 현재 위치 인포윈도우
        const infoWindowContent = `
            <div style="padding: 10px; min-width: 200px; font-family: 'Malgun Gothic', sans-serif;">
                <div style="font-weight: bold; font-size: 14px; color: #333; margin-bottom: 5px;">
                    📍 현재 위치
                </div>
                <div style="font-size: 12px; color: #666;">
                    위도: ${currentLocation.lat.toFixed(6)}<br>
                    경도: ${currentLocation.lng.toFixed(6)}
                </div>
            </div>
        `;

        const infoWindow = new window.kakao.maps.InfoWindow({
            content: infoWindowContent
        });

        infoWindow.open(map, marker);
        setCurrentMarker(marker);
    };

    // 반경 변경 처리
    const handleRadiusChange = (radius: number) => {
        setSearchRadius(radius);
    };

    // cleanup 함수 (WebView 타이머 정리)
    useEffect(() => {
        return () => {
            if (webViewTimeoutRef.current) {
                clearTimeout(webViewTimeoutRef.current);
            }
        };
    }, []);

    // 거리 계산 함수 (키로미터 단위)
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371; // 지구 반지름 (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    return {
        map: {
            instance: map,
            setMap
        },
        searchKeyword,
        setSearchKeyword,
        searchResults,
        selectedPlace,
        selectedPlacePosition,
        error,
        setError,
        loading,
        locationLoading,
        currentLocation,
        searchRadius,
        searchMarkers,
        kakaoMapsLoaded,
        kakaoMapsLoading,
        handleSearch,
        handleKeyUp,
        moveToLocation,
        setSelectedPlace,
        showWebView,
        webViewUrl,
        openWebView,
        closeWebView,
        getCurrentLocation,
        // searchNearbyPlaces 제거됨 (GPS 기준 검색 제거)
        searchNearbyPlacesByMapCenter,
        handleMapDragEnd,
        moveToCurrentLocation,
        handleRadiusChange,
        clearAllMarkers,
        addSearchResultMarkers
    }
}