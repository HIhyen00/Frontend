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
    '공원': {
        searchType: 'KEYWORD' as const,
        query: '공원',
        categoryCode: null,
        description: '공원 전용 검색'
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
    const [showWebView, setShowWebView] = useState<boolean>(false);
    const [webViewUrl, setWebViewUrl] = useState<string>('');

    // WebView 상태 안정성을 위한 ref
    const webViewStateRef = useRef({ showWebView: false, webViewUrl: '' });
    const webViewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 선택된 마커 추적을 위한 ref
    const selectedMarkerRef = useRef<{ marker: kakao.maps.Marker, originalColor: 'red' | 'blue' } | null>(null);

    // WebView 상태 ref 동기화
    useEffect(() => {
        webViewStateRef.current = { showWebView, webViewUrl };
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

    // 마커 관리 함수들
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

        // 선택된 마커 ref 초기화
        selectedMarkerRef.current = null;
    }, [searchMarkers, currentMarker, currentInfoWindow]);

    // 안전한 커스텀 마커 생성 (원형 핀 스타일, 터치 친화적)
    const createCustomMarkerImage = useCallback((color: 'red' | 'blue' | 'green' = 'red', isSelected: boolean = false) => {
        if (!kakaoMapsLoaded || !window.kakao?.maps) return null;

        const colorMap: Record<string, string> = {
            red: '#ef4444',
            blue: '#3b82f6',
            green: '#10b981'
        };

        const fillColor = colorMap[color] || colorMap.red;

        // 선택된 마커는 더 크게
        const size = isSelected ? 36 : 32;
        const pinHeight = size * 1.5;

        // 원형 핀 마커 디자인
        const svg = `<svg width="${size}" height="${pinHeight}" viewBox="0 0 ${size} ${pinHeight}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <filter id="shadow-${color}-${isSelected}" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
                </filter>
                ${isSelected ? `
                <radialGradient id="glow-${color}">
                    <stop offset="0%" style="stop-color:${fillColor};stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${fillColor};stop-opacity:0.8" />
                </radialGradient>` : ''}
            </defs>
            <!-- 핀 본체 (원형) -->
            <circle
                cx="${size/2}"
                cy="${size/2}"
                r="${size/2 - 2}"
                fill="${isSelected ? `url(#glow-${color})` : fillColor}"
                stroke="white"
                stroke-width="3"
                filter="url(#shadow-${color}-${isSelected})"/>
            <!-- 핀 하단 포인터 -->
            <path
                d="M${size/2} ${size/2 + size/4} L${size/2 - size/8} ${size/2} L${size/2 + size/8} ${size/2} Z"
                fill="${isSelected ? `url(#glow-${color})` : fillColor}"
                stroke="white"
                stroke-width="2"
                filter="url(#shadow-${color}-${isSelected})"/>
            <!-- 중앙 도트 -->
            <circle cx="${size/2}" cy="${size/2}" r="${isSelected ? '6' : '5'}" fill="white" opacity="0.9"/>
        </svg>`;

        const encodedSvg = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
        const imageSize = new window.kakao.maps.Size(size, pinHeight);
        const imageOption = { offset: new window.kakao.maps.Point(size/2, size/2) };

        return new window.kakao.maps.MarkerImage(encodedSvg, imageSize, imageOption);
    }, [kakaoMapsLoaded]);

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

    // 통일된 장소 선택 함수 (검색 결과 클릭, 마커 클릭 모두 사용)
    const selectPlace = useCallback((placeData: any, markerToSelect?: kakao.maps.Marker, markerOriginalColor?: 'red' | 'blue') => {
        if (!map) return;

        const lat = parseFloat(placeData.y);
        const lng = parseFloat(placeData.x);

        // 기존 인포윈도우 닫기
        if (currentInfoWindow) {
            currentInfoWindow.close();
            setCurrentInfoWindow(null);
        }

        // 1. 이전 선택된 마커 색상 복원
        if (selectedMarkerRef.current) {
            const { marker: prevMarker, originalColor } = selectedMarkerRef.current;
            const originalImage = createCustomMarkerImage(originalColor);
            prevMarker.setImage(originalImage);
            prevMarker.setZIndex(50); // 모든 마커의 기본 z-index는 50
        }

        // 2. placeData에 distance가 없으면 계산
        let placeWithDistance = placeData;
        if (!placeData.distance) {
            const currentCenter = map.getCenter();
            const distance = calculateDistance(
                currentCenter.getLat(),
                currentCenter.getLng(),
                lat,
                lng
            );
            placeWithDistance = {
                ...placeData,
                distance: Math.round(distance * 1000)
            };
        }

        // 3. 선택된 장소 정보 업데이트
        setSelectedPlace(placeWithDistance);

        // 4. 지도 이동 (줌 레벨 먼저 조정 후 이동)
        const moveLatLng = new window.kakao.maps.LatLng(lat, lng);

        // 줌 레벨이 3보다 크면 먼저 조정
        if (map.getLevel() > 3) {
            map.setLevel(3);
        }

        // setCenter로 즉시 이동 (panTo는 애니메이션이라 비동기 문제 발생 가능)
        map.setCenter(moveLatLng);

        // 5. 마커가 제공된 경우 선택 상태로 변경
        if (markerToSelect) {
            const selectedImage = createCustomMarkerImage('red', true);
            markerToSelect.setImage(selectedImage);
            markerToSelect.setZIndex(200);
            selectedMarkerRef.current = {
                marker: markerToSelect,
                originalColor: markerOriginalColor || 'blue'
            };
        }
    }, [map, currentInfoWindow, createCustomMarkerImage]);

    const addSearchResultMarkers = useCallback((places: any[]) => {
        if (!kakaoMapsLoaded || !map || !window.kakao?.maps) return;

        // 기존 마커들 완전 제거
        searchMarkers.forEach(marker => marker.setMap(null));

        // 선택된 마커 ref 초기화 (새로운 검색이므로)
        selectedMarkerRef.current = null;

        if (places.length === 0) {
            setSearchMarkers([]);
            return;
        }

        const newMarkers: kakao.maps.Marker[] = [];
        const bounds = new window.kakao.maps.LatLngBounds();

        places.forEach((place, index) => {
            const position = new window.kakao.maps.LatLng(parseFloat(place.y), parseFloat(place.x));
            // 모든 마커를 파란색으로 통일 (선택 시에만 빨간색으로 변경)
            const markerImage = createCustomMarkerImage('blue');

            const marker = new window.kakao.maps.Marker({
                position,
                map,
                image: markerImage,
                title: place.place_name
            });

            // 마커 클릭 이벤트 - 통일된 selectPlace 함수 사용
            const handleMarkerClick = () => {
                // 모든 마커의 원래 색상은 파란색
                selectPlace(place, marker, 'blue');
            };

            // 터치/클릭 이벤트 모두 처리
            window.kakao.maps.event.addListener(marker, 'click', handleMarkerClick);

            // 마커에 z-index 설정
            marker.setZIndex(50);

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
        // selectPlace는 dependency에서 제외 (순환 참조 방지)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kakaoMapsLoaded, map, createCustomMarkerImage, searchMarkers]);

    // 키워드 검색
    const handleSearch = async (keyword?: string) => {
        const searchTerm = keyword || searchKeyword;
        if (!searchTerm.trim()) {
            setError('검색어를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError(null);
        setSelectedPlace(null);

        try {
            const response = await api.searchPlaces(searchTerm, "KEYWORD");

            // 각 장소에 거리 정보 추가 (지도 중심 기준)
            const documentsWithDistance = map ? (response.documents || []).map(place => {
                const center = map.getCenter();
                const distance = calculateDistance(
                    center.getLat(),
                    center.getLng(),
                    parseFloat(place.y),
                    parseFloat(place.x)
                );
                return {
                    ...place,
                    distance: Math.round(distance * 1000) // 미터 단위
                };
            }) : response.documents || [];

            const responseWithDistance = {
                ...response,
                documents: documentsWithDistance
            };

            setSearchResults(responseWithDistance);
            addSearchResultMarkers(documentsWithDistance);
        } catch (error: any) {
            console.error('키워드 검색 실패:', error);
            setError(error?.koreanMessage || '검색 중 오류가 발생했습니다.');
            setSearchResults(null);
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

    // 지도의 특정 위치로 이동 (하위 호환성을 위해 유지, selectPlace를 내부적으로 호출)
    const moveToLocation = (lat: number, lng: number, placeData: any) => {
        // searchMarkers에서 해당 위치의 마커 찾기
        const targetMarker = searchMarkers.find(marker => {
            const pos = marker.getPosition();
            return Math.abs(pos.getLat() - lat) < 0.0001 && Math.abs(pos.getLng() - lng) < 0.0001;
        });

        // 모든 마커의 원래 색상은 파란색으로 통일
        selectPlace(placeData, targetMarker, 'blue');
    };

    // 웹뷰 관련 함수들
    const openWebView = useCallback((url: string) => {
        if (!url || !url.trim()) return;

        // 이미 같은 URL이 열려있으면 무시
        if (webViewStateRef.current.showWebView && webViewStateRef.current.webViewUrl === url) {
            return;
        }

        // 기존 타이머 정리
        if (webViewTimeoutRef.current) {
            clearTimeout(webViewTimeoutRef.current);
            webViewTimeoutRef.current = null;
        }

        setWebViewUrl(url);
        setShowWebView(true);
    }, []);

    const closeWebView = useCallback(() => {
        if (!webViewStateRef.current.showWebView) return;

        // 기존 타이머 정리
        if (webViewTimeoutRef.current) {
            clearTimeout(webViewTimeoutRef.current);
            webViewTimeoutRef.current = null;
        }

        setShowWebView(false);

        // 모달 애니메이션 후 URL 정리
        webViewTimeoutRef.current = setTimeout(() => {
            setWebViewUrl('');
        }, 200);
    }, []);

    // 현재 위치 가져오기
    const getCurrentLocation = () => {
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

                    // 현재 위치 인포윈도우 (블루 테마로 업데이트)
                    const infoWindowContent = `
                        <div style="
                            padding: 16px;
                            min-width: 240px;
                            font-family: 'Pretendard', 'Malgun Gothic', sans-serif;
                            border-radius: 12px;
                            box-shadow: 0 4px 20px rgba(59,130,246,0.3);
                            background: #3b82f6;
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
                                opacity: 0.95;
                                line-height: 1.5;
                                background: rgba(255,255,255,0.2);
                                padding: 10px;
                                border-radius: 8px;
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
            // 카테고리 코드 기반 검색
            return await api.searchPlaces(config.query, "CATEGORY", {
                categoryGroupCode: config.categoryCode,
                x: searchLng,
                y: searchLat,
                radius: searchRadius,
                size: 15,
                sort: 'distance'
            });
        } else {
            // 키워드 기반 검색
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

    // 지도 화면 중심 기준 검색
    const searchNearbyPlacesByMapCenter = async (category: string) => {
        if (!map) {
            setError('지도를 불러오는 중입니다.');
            return;
        }

        const center = map.getCenter();
        const centerLat = center.getLat();
        const centerLng = center.getLng();

        setLoading(true);
        setError(null);
        setSelectedPlace(null);

        try {
            const response = await performOptimizedSearch(category, centerLat, centerLng);

            // 각 장소에 거리 정보 추가
            const documentsWithDistance = (response.documents || []).map(place => {
                const distance = calculateDistance(
                    centerLat,
                    centerLng,
                    parseFloat(place.y),
                    parseFloat(place.x)
                );
                return {
                    ...place,
                    distance: Math.round(distance * 1000) // 미터 단위
                };
            });

            const responseWithDistance = {
                ...response,
                documents: documentsWithDistance
            };

            setSearchResults(responseWithDistance);
            addSearchResultMarkers(documentsWithDistance);
        } catch (error: any) {
            console.error('검색 실패:', error);
            setError(error?.koreanMessage || '검색 중 오류가 발생했습니다.');
            setSearchResults(null);
            addSearchResultMarkers([]);
        } finally {
            setLoading(false);
        }
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

    return {
        map: {
            instance: map,
            setMap
        },
        searchKeyword,
        setSearchKeyword,
        searchResults,
        selectedPlace,
        error,
        setError,
        loading,
        locationLoading,
        currentLocation,
        searchRadius,
        searchMarkers,
        kakaoMapsLoaded,
        handleSearch,
        handleKeyUp,
        moveToLocation,
        setSelectedPlace,
        showWebView,
        webViewUrl,
        openWebView,
        closeWebView,
        getCurrentLocation,
        searchNearbyPlacesByMapCenter,
        handleRadiusChange,
        clearAllMarkers
    }
}