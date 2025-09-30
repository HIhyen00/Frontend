import React, {useEffect, useState, useCallback, useMemo, useRef} from "react";
import {FaSearch, FaMapMarkerAlt, FaTimes, FaPlus, FaTrash, FaCheck, FaRoute} from "react-icons/fa";
import {useMaps} from "../hooks/useMaps.ts";
import {getWalkRoutes, deleteWalkRoute, createWalkRoute} from "../utils/Api.ts";

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
        handleRadiusChange
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
    const radiusSearchTimeoutRef = useRef<number | null>(null);

    // Categories
    const categories = useMemo(() => [
        {id: "동물병원", label: "동물병원", emoji: "🏥"},
        {id: "펫샵", label: "펫샵", emoji: "🛍️"},
        {id: "애견미용", label: "애견미용", emoji: "✂️"},
        {id: "공원", label: "공원", emoji: "🌳"},
        {id: "애견카페", label: "애견카페", emoji: "☕"},
        {id: "애견호텔", label: "애견호텔", emoji: "🏨"}
    ], []);

    // Load saved routes
    const loadSavedRoutes = useCallback(async () => {
        try {
            setLoadingRoutes(true);
            const routes = await getWalkRoutes();
            setSavedRoutes(routes || []);
        } catch (error) {
            console.error('Failed to load routes:', error);
            setError?.('산책로를 불러오는데 실패했습니다.');
        } finally {
            setLoadingRoutes(false);
        }
    }, [setError]);

    // Delete route
    const handleDeleteRoute = useCallback(async (routeId: number) => {
        if (!confirm('이 산책로를 삭제하시겠습니까?')) return;

        try {
            await deleteWalkRoute(routeId);
            setSavedRoutes(prev => prev.filter(route => route.id !== routeId));
        } catch (error) {
            console.error('Failed to delete route:', error);
            setError?.('산책로 삭제에 실패했습니다.');
        }
    }, [setError]);

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

            setRouteName('');
            setRouteDescription('');
            setRoutePoints([]);
            setShowCreateModal(false);
            setIsDrawingMode(false);

            if (routePolyline) {
                routePolyline.setMap(null);
                setRoutePolyline(null);
            }

            // 마커들 제거
            routeMarkers.forEach(marker => marker.setMap(null));
            setRouteMarkers([]);

            loadSavedRoutes();
        } catch (error) {
            console.error('Failed to save route:', error);
            setError?.('산책로 저장에 실패했습니다.');
        } finally {
            setSaving(false);
        }
    }, [routeName, routeDescription, routePoints, routePolyline, setError, loadSavedRoutes]);

    // Category search
    const handleCategorySearch = useCallback(async (category: string) => {
        if (loading || !map?.instance || !searchNearbyPlacesByMapCenter) return;

        setSelectedCategory(category);
        setSelectedPlace(null);
        await searchNearbyPlacesByMapCenter(category);
    }, [loading, map?.instance, searchNearbyPlacesByMapCenter, setSelectedPlace]);

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
    }, [kakaoMapsLoaded, map, handleCategorySearch, selectedCategory, setError]);

    // Route drawing click handler (별도 useEffect)
    useEffect(() => {
        if (!map?.instance) return;

        const clickListener = (mouseEvent: any) => {
            // 드로잉 모드가 아닐 경우 무시
            if (!isDrawingMode) return;

            console.log('Map clicked in drawing mode');

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

                // 기존 폴리라인 제거
                if (routePolyline) {
                    routePolyline.setMap(null);
                }

                // 새 폴리라인 생성
                if (newPoints.length >= 2) {
                    const polyline = new (window.kakao.maps as any).Polyline({
                        path: newPoints.map(p => new window.kakao.maps.LatLng(p.lat, p.lng)),
                        strokeWeight: 6,
                        strokeColor: '#3b82f6',
                        strokeOpacity: 0.9,
                        strokeStyle: 'solid'
                    });
                    polyline.setMap(map.instance);
                    setRoutePolyline(polyline);
                }

                return newPoints;
            });
        };

        // 클릭 리스너 등록
        window.kakao.maps.event.addListener(map.instance, 'click', clickListener);

        // 클린업
        return () => {
            window.kakao.maps.event.removeListener(map.instance, 'click', clickListener);
        };
    }, [map?.instance, isDrawingMode, routePolyline]);

    // Load routes on tab change
    useEffect(() => {
        if (activeTab === 'routes') {
            loadSavedRoutes();
        }
    }, [activeTab, loadSavedRoutes]);

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
        if (isDrawingMode) {
            if (routePolyline) {
                routePolyline.setMap(null);
                setRoutePolyline(null);
            }
            // 마커들 제거
            routeMarkers.forEach(marker => marker.setMap(null));
            setRouteMarkers([]);
            setRoutePoints([]);
        }
        setIsDrawingMode(!isDrawingMode);
    }, [isDrawingMode, routePolyline, routeMarkers]);

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
                                    onClick={() => setActiveTab('routes')}
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
                                                {searchResults.documents.map((place, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => moveToLocation(parseFloat(place.y), parseFloat(place.x), place)}
                                                        className="w-full text-left p-4 bg-white border border-gray-200 hover:border-blue-400 rounded-2xl transition-all hover:shadow-lg active:scale-[0.98] group"
                                                    >
                                                        <h4 className="font-bold text-gray-900 mb-1.5 group-hover:text-gray-900 text-sm">{place.place_name}</h4>
                                                        <p className="text-xs text-gray-500 mb-1 font-medium">{place.category_name}</p>
                                                        <p className="text-xs text-gray-400 leading-relaxed">{place.address_name}</p>
                                                    </button>
                                                ))}
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
                                <div className="p-6 space-y-4">
                                    {/* Drawing Mode */}
                                    {isDrawingMode ? (
                                        <div className="p-4 bg-blue-50 border-2 border-blue-500 rounded-2xl space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-blue-900 text-sm">경로 그리는 중</h3>
                                                <span className="text-xs text-blue-600 font-bold px-2.5 py-1 bg-blue-100 rounded-full">{routePoints.length}개 지점</span>
                                            </div>
                                            <p className="text-sm text-blue-700 leading-relaxed">지도를 클릭하여 산책 경로를 그려보세요</p>
                                            <div className="flex gap-2.5">
                                                <button
                                                    onClick={() => setShowCreateModal(true)}
                                                    disabled={routePoints.length < 2}
                                                    className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md"
                                                >
                                                    <FaCheck className="w-3.5 h-3.5" /> 완료
                                                </button>
                                                <button
                                                    onClick={cancelRouteCreation}
                                                    className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                                                >
                                                    <FaTimes className="w-3.5 h-3.5" /> 취소
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={toggleDrawingMode}
                                            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2.5 active:scale-[0.98]"
                                        >
                                            <FaPlus className="w-4 h-4" /> 새 산책로 만들기
                                        </button>
                                    )}

                                    {/* Saved Routes */}
                                    {loadingRoutes ? (
                                        <div className="flex justify-center py-16">
                                            <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent"></div>
                                        </div>
                                    ) : savedRoutes.length > 0 ? (
                                        <div className="space-y-2.5">
                                            {savedRoutes.map((route) => (
                                                <div key={route.id} className="p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-lg transition-all group">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h4 className="font-bold text-gray-900 text-sm">{route.name}</h4>
                                                        <button
                                                            onClick={() => handleDeleteRoute(route.id)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded-lg"
                                                        >
                                                            <FaTrash className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    {route.description && (
                                                        <p className="text-xs text-gray-600 mb-2 leading-relaxed">{route.description}</p>
                                                    )}
                                                    <p className="text-xs text-gray-400 font-medium">
                                                        {new Date(route.createdAt).toLocaleDateString('ko-KR')}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <div className="text-6xl mb-4">🐾</div>
                                            <p className="text-gray-900 font-semibold mb-1.5">저장된 산책로가 없습니다</p>
                                            <p className="text-sm text-gray-500">새 산책로를 만들어보세요</p>
                                        </div>
                                    )}
                                </div>
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

            {/* Create Route Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">산책로 저장</h2>

                        <div className="space-y-5 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-900 mb-2.5 uppercase tracking-wider">
                                    이름 <span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={routeName}
                                    onChange={(e) => setRouteName(e.target.value)}
                                    maxLength={50}
                                    placeholder="예: 한강 산책로"
                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-900 mb-2.5 uppercase tracking-wider">
                                    설명
                                </label>
                                <textarea
                                    value={routeDescription}
                                    onChange={(e) => setRouteDescription(e.target.value)}
                                    maxLength={200}
                                    rows={3}
                                    placeholder="산책로에 대한 간단한 설명을 입력하세요"
                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none text-sm shadow-sm"
                                />
                            </div>

                            <div className="flex items-center gap-2.5 text-sm text-gray-600 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                                <FaMapMarkerAlt className="text-blue-500" />
                                <span className="font-semibold">{routePoints.length}개 지점</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={cancelRouteCreation}
                                className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSaveRoute}
                                disabled={saving || !routeName.trim()}
                                className="flex-1 py-3.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-2xl font-semibold text-sm transition-all shadow-lg active:scale-95"
                            >
                                {saving ? '저장 중...' : '저장'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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