import React, {useEffect, useState, useCallback, useMemo, useRef} from "react";
import {FaSearch, FaMapMarkerAlt, FaTimes, FaRoute} from "react-icons/fa";
import {useMaps} from "../hooks/useMaps.ts";
import {getWalkRoutes, deleteWalkRoute, createWalkRoute} from "../utils/Api.ts";
import RoutePanel from "../components/RoutePanel";
import RouteModal from "../components/RouteModal";

const PetWalk = React.memo(() => {
    // Hooks
    const mapsData = useMaps();

    // Error handling
    if (!mapsData) {
        return (
            <div className="min-h-screen pt-16 bg-gray-50 flex items-center justify-center">
                <div className="text-center bg-white p-10 rounded-3xl shadow-2xl max-w-md border border-gray-100">
                    <div className="text-6xl mb-5">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">서비스 로딩 오류</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">지도 서비스를 불러오는 중 문제가 발생했습니다.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        새로고침
                    </button>
                </div>
            </div>
        );
    }

    const {
        map,
        searchKeyword,
        setSearchKeyword,
        searchResults,
        selectedPlace,
        error,
        setError,
        loading,
        locationLoading,
        searchRadius,
        kakaoMapsLoaded,
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
    } = mapsData;

    // State
    const [selectedCategory, setSelectedCategory] = useState("동물병원");
    const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<'search' | 'routes'>('search');
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [routePoints, setRoutePoints] = useState<{ lat: number, lng: number }[]>([]);
    const [routePolyline, setRoutePolyline] = useState<any>(null);
    const [routeMarkers, setRouteMarkers] = useState<any[]>([]); // 경로 마커들
    const [savedRoutes, setSavedRoutes] = useState<any[]>([]);
    const [loadingRoutes, setLoadingRoutes] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [routeName, setRouteName] = useState('');
    const [routeDescription, setRouteDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<any>(null); // 선택된 산책로
    const [displayedRoutePolyline, setDisplayedRoutePolyline] = useState<any>(null); // 표시된 산책로 선
    const [displayedRouteMarkers, setDisplayedRouteMarkers] = useState<any[]>([]); // 표시된 산책로 마커들
    const radiusSearchTimeoutRef = useRef<number | null>(null);
    const errorTimeoutRef = useRef<number | null>(null);
    const selectedPlaceRef = useRef<HTMLButtonElement | null>(null);
    const isDrawingModeRef = useRef(isDrawingMode);

    // isDrawingMode ref 동기화
    useEffect(() => {
        isDrawingModeRef.current = isDrawingMode;
    }, [isDrawingMode]);

    // Auto-dismiss error after 2 seconds
    useEffect(() => {
        if (error) {
            if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
            }

            errorTimeoutRef.current = window.setTimeout(() => {
                setError(null);
            }, 2000);
        }

        return () => {
            if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
            }
        };
    }, [error, setError]);

    // Auto-scroll to selected place
    useEffect(() => {
        if (selectedPlace && selectedPlaceRef.current) {
            selectedPlaceRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }, [selectedPlace]);

    // Categories
    const categories = useMemo(() => [
        {id: "동물병원", label: "동물병원", emoji: "🏥"},
        {id: "펫샵", label: "펫샵", emoji: "🛍️"},
        {id: "애견미용", label: "애견미용", emoji: "✂️"},
        {id: "공원", label: "공원", emoji: "🌳"},
        {id: "애견카페", label: "애견카페", emoji: "☕"},
        {id: "애견호텔", label: "애견호텔", emoji: "🏨"}
    ], []);

    // Check if user is logged in
    const isLoggedIn = useCallback(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        return !!token;
    }, []);

    // Load saved routes
    const loadSavedRoutes = useCallback(async () => {
        if (!isLoggedIn()) {
            setError?.('로그인이 필요합니다.');
            return;
        }

        try {
            setLoadingRoutes(true);
            const routes = await getWalkRoutes();
            setSavedRoutes(routes || []);
        } catch (error: any) {
            console.error('Failed to load routes:', error);
            setError?.(error?.koreanMessage || '산책로를 불러오는데 실패했습니다.');
        } finally {
            setLoadingRoutes(false);
        }
    }, [setError, isLoggedIn]);

    // Hide displayed route
    const hideDisplayedRoute = useCallback(() => {
        if (displayedRoutePolyline) {
            displayedRoutePolyline.setMap(null);
            setDisplayedRoutePolyline(null);
        }
        displayedRouteMarkers.forEach(marker => marker.setMap(null));
        setDisplayedRouteMarkers([]);
        setSelectedRoute(null);
    }, [displayedRoutePolyline, displayedRouteMarkers]);

    // Delete route
    const handleDeleteRoute = useCallback(async (routeId: number) => {
        const route = savedRoutes.find(r => r.id === routeId);
        if (!confirm(`"${route?.name || '이 산책로'}"를 삭제하시겠습니까?`)) return;

        try {
            await deleteWalkRoute(routeId);
            setSavedRoutes(prev => prev.filter(route => route.id !== routeId));

            // 삭제한 산책로가 현재 표시중이면 숨김
            if (selectedRoute?.id === routeId) {
                hideDisplayedRoute();
            }
        } catch (error: any) {
            console.error('Failed to delete route:', error);
            setError?.(error?.koreanMessage || '산책로 삭제에 실패했습니다.');
        }
    }, [setError, selectedRoute, hideDisplayedRoute, savedRoutes]);

    // Save route
    const handleSaveRoute = useCallback(async () => {
        if (!routeName.trim() || routePoints.length < 2) {
            setError?.('산책로 이름과 최소 2개의 지점이 필요합니다.');
            return;
        }

        try {
            setSaving(true);
            await createWalkRoute({
                name: routeName.trim(),
                description: routeDescription.trim() || undefined,
                coordinates: routePoints
            });

            // 1. 먼저 드로잉 모드 종료 (이게 가장 먼저!)
            setIsDrawingMode(false);

            // 2. 폴리라인 제거
            if (routePolyline) {
                routePolyline.setMap(null);
                setRoutePolyline(null);
            }

            // 3. 마커들 제거
            routeMarkers.forEach(marker => marker.setMap(null));
            setRouteMarkers([]);

            // 4. 상태 초기화
            setRoutePoints([]);
            setRouteName('');
            setRouteDescription('');
            setShowCreateModal(false);

            // 5. 저장된 산책로 목록 새로고침
            await loadSavedRoutes();
        } catch (error: any) {
            console.error('Failed to save route:', error);
            setError?.(error?.koreanMessage || '산책로 저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    }, [routeName, routeDescription, routePoints, routePolyline, setError, loadSavedRoutes, routeMarkers]);

    // Category search
    const handleCategorySearch = useCallback(async (category: string) => {
        if (loading || !map?.instance || !searchNearbyPlacesByMapCenter) return;

        setSelectedCategory(category);
        setSelectedPlace(null);
        await searchNearbyPlacesByMapCenter(category);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, map?.instance]);

    // Map initialization
    useEffect(() => {
        if (kakaoMapsLoaded && window.kakao?.maps && !map?.instance) {
            const mapContainer = document.getElementById('map');
            if (!mapContainer) return;

            try {
                const mapInstance = new window.kakao.maps.Map(mapContainer, {
                    center: new window.kakao.maps.LatLng(37.5666805, 126.9784147),
                    level: 4,
                });

                map?.setMap(mapInstance);

                // Initial search
                setTimeout(() => {
                    handleCategorySearch(selectedCategory);
                }, 500);
            } catch (error) {
                console.error('Map initialization error:', error);
                setError?.('지도 초기화에 실패했습니다.');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [kakaoMapsLoaded, map?.instance]);

    // Route drawing click handler (별도 useEffect)
    useEffect(() => {
        if (!map?.instance) return;

        const clickListener = (mouseEvent: any) => {
            // 드로잉 모드가 아닐 경우 무시 (ref 사용으로 항상 최신 값 참조)
            if (!isDrawingModeRef.current) return;

            const latlng = mouseEvent.latLng;
            const newPoint = {lat: latlng.getLat(), lng: latlng.getLng()};

            setRoutePoints(prev => {
                const newPoints = [...prev, newPoint];
                const pointIndex = prev.length + 1;

                // 클릭한 지점에 번호 마커 추가
                const markerContent = `
                    <div style="
                        width: 32px;
                        height: 32px;
                        background: #3b82f6;
                        border: 3px solid white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        color: white;
                        font-size: 14px;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                        cursor: pointer;
                        animation: markerPop 0.3s ease-out;
                    ">
                        ${pointIndex}
                    </div>
                    <style>
                        @keyframes markerPop {
                            0% { transform: scale(0); }
                            50% { transform: scale(1.2); }
                            100% { transform: scale(1); }
                        }
                    </style>
                `;

                const customOverlay = new window.kakao.maps.CustomOverlay({
                    position: latlng,
                    content: markerContent,
                    yAnchor: 0.5
                });

                customOverlay.setMap(map.instance);
                setRouteMarkers(prevMarkers => [...prevMarkers, customOverlay]);

                return newPoints;
            });
        };

        // 클릭 리스너 등록
        window.kakao.maps.event.addListener(map.instance, 'click', clickListener);

        // 클린업
        return () => {
            window.kakao.maps.event.removeListener(map.instance, 'click', clickListener);
        };
    }, [map?.instance]);

    // routePoints가 변경될 때마다 폴리라인 업데이트 (별도 useEffect)
    useEffect(() => {
        if (!map?.instance) return;

        // 드로잉 모드가 아니면 폴리라인 제거만 하고 종료
        if (!isDrawingMode) {
            if (routePolyline) {
                routePolyline.setMap(null);
                setRoutePolyline(null);
            }
            return;
        }

        // 드로잉 모드일 때만 폴리라인 업데이트
        // 기존 폴리라인 제거
        if (routePolyline) {
            routePolyline.setMap(null);
        }

        // 새 폴리라인 생성
        if (routePoints.length >= 2) {
            const polyline = new (window.kakao.maps as any).Polyline({
                path: routePoints.map(p => new window.kakao.maps.LatLng(p.lat, p.lng)),
                strokeWeight: 6,
                strokeColor: '#3b82f6',
                strokeOpacity: 0.9,
                strokeStyle: 'solid'
            });
            polyline.setMap(map.instance);
            setRoutePolyline(polyline);
        } else {
            setRoutePolyline(null);
        }
    }, [routePoints, map?.instance, isDrawingMode, routePolyline]);

    // Handle tab change - cleanup and load
    useEffect(() => {
        if (activeTab === 'routes') {
            // 산책로 탭으로 전환 - 장소 검색 마커 제거 및 산책로 로드
            clearAllMarkers();
            loadSavedRoutes();
        } else {
            // 장소 검색 탭으로 전환 - 모든 산책로 관련 요소 제거

            // 1. 드로잉 모드 종료
            if (isDrawingMode) {
                if (routePolyline) {
                    routePolyline.setMap(null);
                    setRoutePolyline(null);
                }
                routeMarkers.forEach(marker => marker.setMap(null));
                setRouteMarkers([]);
                setRoutePoints([]);
                setIsDrawingMode(false);
            }

            // 2. 표시된 산책로 제거
            hideDisplayedRoute();

            // 3. 모달 닫기
            if (showCreateModal) {
                setShowCreateModal(false);
                setRouteName('');
                setRouteDescription('');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    // Radius change with debounce
    const handleRadiusChangeWithSearch = useCallback((radius: number) => {
        handleRadiusChange(radius);

        if (radiusSearchTimeoutRef.current) {
            clearTimeout(radiusSearchTimeoutRef.current);
        }

        if (selectedCategory && !loading) {
            radiusSearchTimeoutRef.current = window.setTimeout(() => {
                handleCategorySearch(selectedCategory);
            }, 600);
        }
    }, [selectedCategory, loading, handleRadiusChange, handleCategorySearch]);

    // Relayout map when panel state changes
    useEffect(() => {
        if (map?.instance) {
            // 패널 애니메이션 완료 후 지도 크기 재조정
            const timer = setTimeout(() => {
                map.instance.relayout();
            }, 300); // transition duration과 동일하게

            return () => clearTimeout(timer);
        }
    }, [isSearchPanelOpen, map?.instance]);

    // Zoom controls
    const zoomIn = useCallback(() => {
        if (map.instance) {
            const level = map.instance.getLevel();
            if (level > 1) map.instance.setLevel(level - 1);
        }
    }, [map.instance]);

    const zoomOut = useCallback(() => {
        if (map.instance) {
            const level = map.instance.getLevel();
            if (level < 14) map.instance.setLevel(level + 1);
        }
    }, [map.instance]);

    // Toggle drawing mode
    const toggleDrawingMode = useCallback(() => {
        // 드로잉 시작 시 로그인 체크
        if (!isDrawingMode && !isLoggedIn()) {
            setError?.('산책로를 만들려면 로그인이 필요합니다.');
            return;
        }

        if (isDrawingMode) {
            // 드로잉 종료 - 그린 것들 제거
            if (routePolyline) {
                routePolyline.setMap(null);
                setRoutePolyline(null);
            }
            routeMarkers.forEach(marker => marker.setMap(null));
            setRouteMarkers([]);
            setRoutePoints([]);
        } else {
            // 드로잉 시작 - 표시된 산책로 숨김
            hideDisplayedRoute();
        }
        setIsDrawingMode(!isDrawingMode);
    }, [isDrawingMode, routePolyline, routeMarkers, hideDisplayedRoute, isLoggedIn, setError]);

    // Undo last point (마지막 지점 삭제)
    const undoLastPoint = useCallback(() => {
        if (routePoints.length === 0) return;

        setRoutePoints(prev => {
            const newPoints = prev.slice(0, -1);

            // 마지막 마커 제거
            if (routeMarkers.length > 0) {
                const lastMarker = routeMarkers[routeMarkers.length - 1];
                lastMarker.setMap(null);
                setRouteMarkers(prevMarkers => prevMarkers.slice(0, -1));
            }

            // 폴리라인 다시 그리기
            if (routePolyline) {
                routePolyline.setMap(null);
            }

            if (newPoints.length >= 2 && map?.instance) {
                const polyline = new (window.kakao.maps as any).Polyline({
                    path: newPoints.map(p => new window.kakao.maps.LatLng(p.lat, p.lng)),
                    strokeWeight: 6,
                    strokeColor: '#3b82f6',
                    strokeOpacity: 0.9,
                    strokeStyle: 'solid'
                });
                polyline.setMap(map.instance);
                setRoutePolyline(polyline);
            } else {
                setRoutePolyline(null);
            }

            return newPoints;
        });
    }, [routePoints, routeMarkers, routePolyline, map?.instance]);

    // Cancel route creation
    const cancelRouteCreation = useCallback(() => {
        if (routePolyline) {
            routePolyline.setMap(null);
            setRoutePolyline(null);
        }
        // 마커들 제거
        routeMarkers.forEach(marker => marker.setMap(null));
        setRouteMarkers([]);
        setRoutePoints([]);
        setIsDrawingMode(false);
        setShowCreateModal(false);
        setRouteName('');
        setRouteDescription('');
    }, [routePolyline, routeMarkers]);

    // Display saved route on map
    const displayRoute = useCallback((route: any) => {
        if (!map?.instance) return;

        // 이전에 표시된 산책로 제거
        if (displayedRoutePolyline) {
            displayedRoutePolyline.setMap(null);
        }
        displayedRouteMarkers.forEach(marker => marker.setMap(null));

        // 새 산책로 표시
        const coordinates = route.coordinates;
        if (!coordinates || coordinates.length < 2) return;

        // 폴리라인 생성 (녹색)
        const polyline = new (window.kakao.maps as any).Polyline({
            path: coordinates.map((p: any) => new window.kakao.maps.LatLng(p.lat, p.lng)),
            strokeWeight: 6,
            strokeColor: '#10b981',
            strokeOpacity: 0.9,
            strokeStyle: 'solid'
        });
        polyline.setMap(map.instance);
        setDisplayedRoutePolyline(polyline);

        // 마커들 생성
        const markers: any[] = [];
        coordinates.forEach((point: any, index: number) => {
            const markerContent = `
                <div style="
                    width: 32px;
                    height: 32px;
                    background: #10b981;
                    border: 3px solid white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: white;
                    font-size: 14px;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
                ">
                    ${index + 1}
                </div>
            `;

            const customOverlay = new window.kakao.maps.CustomOverlay({
                position: new window.kakao.maps.LatLng(point.lat, point.lng),
                content: markerContent,
                yAnchor: 0.5
            });

            customOverlay.setMap(map.instance);
            markers.push(customOverlay);
        });

        setDisplayedRouteMarkers(markers);
        setSelectedRoute(route);

        // 지도를 산책로가 모두 보이도록 이동
        const bounds = new window.kakao.maps.LatLngBounds();
        coordinates.forEach((point: any) => {
            bounds.extend(new window.kakao.maps.LatLng(point.lat, point.lng));
        });
        map.instance.setBounds(bounds);
    }, [map?.instance, displayedRoutePolyline, displayedRouteMarkers]);

    // Toggle route display
    const toggleRouteDisplay = useCallback((route: any) => {
        if (selectedRoute?.id === route.id) {
            hideDisplayedRoute();
        } else {
            displayRoute(route);
        }
    }, [selectedRoute, hideDisplayedRoute, displayRoute]);

    return (
        <div className="relative h-screen pt-16 bg-gray-50 overflow-hidden">
            {/* Main Container */}
            <div className="h-full flex">
                {/* Search Panel */}
                <div className={`
                    fixed lg:relative z-30 h-full bg-white shadow-2xl transition-all duration-300
                    ${isSearchPanelOpen ? 'w-80 lg:w-96' : 'w-0'}
                    overflow-hidden
                `}>
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="flex-shrink-0 border-b border-gray-100 bg-white p-5">
                            <div className="flex items-center justify-between mb-5">
                                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
                                    <span className="text-2xl">🐾</span>
                                    <span>펫 워크</span>
                                </h1>
                                <button
                                    onClick={() => setIsSearchPanelOpen(false)}
                                    className="lg:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveTab('search')}
                                    className={`
                                        flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all
                                        ${activeTab === 'search'
                                            ? 'bg-blue-500 text-white shadow-lg'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    <FaSearch className="inline w-3.5 h-3.5 mr-2" />
                                    장소 검색
                                </button>
                                <button
                                    onClick={() => {
                                        if (!isLoggedIn()) {
                                            setError?.('로그인이 필요합니다.');
                                            return;
                                        }
                                        setActiveTab('routes');
                                    }}
                                    className={`
                                        flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all
                                        ${activeTab === 'routes'
                                            ? 'bg-blue-500 text-white shadow-lg'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }
                                    `}
                                >
                                    <FaRoute className="inline w-3.5 h-3.5 mr-2" />
                                    내 산책로
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {activeTab === 'search' ? (
                                <div className="p-6 space-y-6">
                                    {/* Search Input */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchKeyword}
                                            onChange={(e) => setSearchKeyword(e.target.value)}
                                            onKeyUp={handleKeyUp}
                                            placeholder="장소를 검색하세요..."
                                            className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all text-sm bg-white shadow-sm"
                                        />
                                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    </div>

                                    {/* Categories */}
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">카테고리</h3>
                                        <div className="grid grid-cols-3 gap-2.5">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => handleCategorySearch(cat.id)}
                                                    className={`
                                                        p-3.5 rounded-2xl font-medium transition-all text-center
                                                        ${selectedCategory === cat.id
                                                            ? 'bg-blue-500 text-white shadow-xl scale-105'
                                                            : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md active:scale-95'
                                                        }
                                                    `}
                                                >
                                                    <div className="text-2xl mb-1.5">{cat.emoji}</div>
                                                    <div className="text-xs font-semibold">{cat.label}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Location & Radius */}
                                    <div className="space-y-3.5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <button
                                            onClick={getCurrentLocation}
                                            disabled={locationLoading}
                                            className="w-full flex items-center justify-center gap-2.5 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                                        >
                                            <FaMapMarkerAlt className="w-4 h-4" />
                                            {locationLoading ? '위치 찾는 중...' : '내 위치로 이동'}
                                        </button>

                                        <div>
                                            <label className="text-xs font-bold text-gray-900 mb-2.5 block uppercase tracking-wider">
                                                검색 반경: {searchRadius}m
                                            </label>
                                            <input
                                                type="range"
                                                min="500"
                                                max="5000"
                                                step="500"
                                                value={searchRadius}
                                                onChange={(e) => handleRadiusChangeWithSearch(Number(e.target.value))}
                                                className="w-full accent-blue-500 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                                            />
                                            <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
                                                <span>500m</span>
                                                <span>5km</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Results */}
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-16">
                                            <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent mb-3"></div>
                                            <p className="text-sm text-gray-600 font-medium">검색 중...</p>
                                        </div>
                                    ) : searchResults?.documents && searchResults.documents.length > 0 ? (
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wider">
                                                검색 결과 ({searchResults.documents.length})
                                            </h3>
                                            <div className="space-y-2.5">
                                                {searchResults.documents.map((place, idx) => {
                                                    const isSelected = selectedPlace?.place_name === place.place_name &&
                                                                      selectedPlace?.x === place.x &&
                                                                      selectedPlace?.y === place.y;

                                                    return (
                                                        <button
                                                            key={idx}
                                                            ref={isSelected ? selectedPlaceRef : null}
                                                            onClick={() => moveToLocation(parseFloat(place.y), parseFloat(place.x), place)}
                                                            className={`
                                                                w-full text-left p-4 rounded-2xl transition-all active:scale-[0.98] group relative
                                                                ${isSelected
                                                                    ? 'bg-blue-50 border-2 border-blue-500 shadow-lg ring-2 ring-blue-200'
                                                                    : 'bg-white border border-gray-200 hover:border-blue-400 hover:shadow-lg'
                                                                }
                                                            `}
                                                        >
                                                            {isSelected && (
                                                                <div className="absolute top-3 right-3">
                                                                    <div className="bg-blue-500 text-white rounded-full p-1">
                                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            <h4 className={`font-bold mb-1.5 text-sm ${isSelected ? 'text-blue-700' : 'text-gray-900 group-hover:text-gray-900'}`}>
                                                                {place.place_name}
                                                            </h4>
                                                            <p className={`text-xs mb-1 font-medium ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                                                                {place.category_name}
                                                            </p>
                                                            <p className={`text-xs leading-relaxed ${isSelected ? 'text-blue-500' : 'text-gray-400'}`}>
                                                                {place.address_name}
                                                            </p>
                                                            {place.distance && (
                                                                <p className={`text-xs mt-2 font-semibold ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                                                                    📍 {place.distance < 1000
                                                                        ? `${place.distance}m`
                                                                        : `${(parseFloat(place.distance) / 1000).toFixed(1)}km`}
                                                                </p>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : searchResults ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="text-6xl mb-4">🔍</div>
                                            <p className="text-gray-900 font-semibold mb-1.5">검색 결과가 없습니다</p>
                                            <p className="text-sm text-gray-500">다른 키워드나 반경을 시도해보세요</p>
                                        </div>
                                    ) : null}
                                </div>
                            ) : (
                                <RoutePanel
                                    isDrawingMode={isDrawingMode}
                                    routePoints={routePoints}
                                    savedRoutes={savedRoutes}
                                    loadingRoutes={loadingRoutes}
                                    selectedRoute={selectedRoute}
                                    onToggleDrawingMode={toggleDrawingMode}
                                    onCompleteDrawing={() => setShowCreateModal(true)}
                                    onCancelDrawing={cancelRouteCreation}
                                    onUndoLastPoint={undoLastPoint}
                                    onToggleRouteDisplay={toggleRouteDisplay}
                                    onDeleteRoute={handleDeleteRoute}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Map Container */}
                <div className="flex-1 relative">
                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsSearchPanelOpen(!isSearchPanelOpen)}
                        className="absolute top-4 left-4 z-20 bg-white hover:bg-gray-50 p-3 rounded-2xl shadow-xl transition-all border border-gray-200 active:scale-95"
                    >
                        {isSearchPanelOpen ? <FaTimes className="w-5 h-5 text-gray-700" /> : <FaSearch className="w-5 h-5 text-gray-700" />}
                    </button>

                    {/* Map */}
                    <div id="map" className="w-full h-full" />

                    {/* Zoom Controls */}
                    <div className="absolute top-4 right-4 z-20 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                        <button
                            onClick={zoomIn}
                            className="block p-3.5 hover:bg-gray-50 active:bg-gray-100 transition-all border-b border-gray-200"
                        >
                            <span className="text-xl font-bold text-gray-700">+</span>
                        </button>
                        <button
                            onClick={zoomOut}
                            className="block p-3.5 hover:bg-gray-50 active:bg-gray-100 transition-all"
                        >
                            <span className="text-xl font-bold text-gray-700">−</span>
                        </button>
                    </div>

                    {/* Current Location FAB */}
                    <button
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="absolute bottom-6 right-6 z-20 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 p-4 rounded-full shadow-2xl transition-all active:scale-95"
                    >
                        <FaMapMarkerAlt className="w-5 h-5 text-white" />
                    </button>

                    {/* Place Details Card */}
                    {selectedPlace && (
                        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-gray-100">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="font-bold text-lg text-gray-900 leading-snug">{selectedPlace.place_name}</h3>
                                <button
                                    onClick={() => setSelectedPlace(null)}
                                    className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-1.5 rounded-lg transition-all"
                                >
                                    <FaTimes className="w-4 h-4" />
                                </button>
                            </div>

                            {selectedPlace.category_name && (
                                <p className="text-xs text-gray-600 mb-3 font-medium bg-gray-50 inline-block px-2.5 py-1 rounded-full">{selectedPlace.category_name}</p>
                            )}

                            <p className="text-sm text-gray-600 mb-2 leading-relaxed">{selectedPlace.address_name}</p>

                            {selectedPlace.phone && (
                                <p className="text-sm text-gray-500 mb-3">{selectedPlace.phone}</p>
                            )}

                            {selectedPlace.distance && (
                                <p className="text-sm text-gray-500 mb-5 font-medium">
                                    📍 {selectedPlace.distance < 1000
                                        ? `${selectedPlace.distance}m`
                                        : `${(selectedPlace.distance / 1000).toFixed(1)}km`}
                                </p>
                            )}

                            <div className="flex gap-2.5">
                                {selectedPlace.place_url && (
                                    <button
                                        onClick={() => openWebView(selectedPlace.place_url)}
                                        className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-semibold text-sm transition-all shadow-md active:scale-95"
                                    >
                                        상세보기
                                    </button>
                                )}
                                <a
                                    href={`https://map.kakao.com/link/to/${selectedPlace.place_name},${selectedPlace.y},${selectedPlace.x}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-semibold text-sm transition-all text-center shadow-md active:scale-95"
                                >
                                    길찾기
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <RouteModal
                show={showCreateModal}
                routeName={routeName}
                routeDescription={routeDescription}
                routePoints={routePoints}
                saving={saving}
                onRouteName={setRouteName}
                onRouteDescription={setRouteDescription}
                onSave={handleSaveRoute}
                onCancel={cancelRouteCreation}
            />

            {/* WebView Modal */}
            {showWebView && (
                <div className="fixed inset-0 z-50 bg-white">
                    <div className="h-full flex flex-col">
                        <div className="flex-shrink-0 bg-blue-500 text-white p-4 flex items-center justify-between border-b border-blue-600">
                            <h2 className="text-lg font-bold">상세 정보</h2>
                            <button
                                onClick={closeWebView}
                                className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-95"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>
                        <iframe
                            src={webViewUrl}
                            className="flex-1 w-full border-0"
                            title="Place Details"
                        />
                    </div>
                </div>
            )}

            {/* Error Toast */}
            {error && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md border border-red-500">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                        <p className="font-semibold text-sm">{error}</p>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-all"
                    >
                        <FaTimes className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
});

export default PetWalk;