import React, {useEffect, useState, useCallback, useMemo, useRef} from "react";
import {FaSearch, FaMapMarkerAlt, FaChevronDown, FaChevronUp, FaTimes, FaBars} from "react-icons/fa";
import {useMaps} from "../hooks/useMaps.ts";

const PetWalk = React.memo(() => {
    // 안전한 훅 데이터 추출 (더 자세한 디버그 정보)
    console.log('PetWalk 컴포넌트 렌더링 시작');

    let mapsData;
    try {
        mapsData = useMaps();
        console.log('useMaps 훅 호출 결과:', mapsData ? '성공' : '실패');
    } catch (error) {
        console.error('useMaps 훅 호출 중 오류:', error);
        return (
            <div className="h-screen pt-16 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl mb-4">🐛</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Hooks 오류</h2>
                    <p className="text-gray-600 mb-4">useMaps 훅 실행 중 오류가 발생했습니다.</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded mb-4 text-left">
                        {error instanceof Error ? error.message : '알 수 없는 오류'}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
                    >
                        페이지 새로고침
                    </button>
                </div>
            </div>
        );
    }

    // 훅에서 데이터가 올바르게 로드되지 않았을 경우 에러 처리
    if (!mapsData) {
        console.error('useMaps가 null을 반환했습니다. useKakaoMaps 훅의 문제일 가능성이 있습니다.');
        return (
            <div className="h-screen pt-16 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">맵 데이터 로딩 오류</h2>
                    <p className="text-gray-600 mb-4">지도 서비스를 불러오는 중 문제가 발생했습니다.</p>
                    <div className="text-xs bg-gray-100 p-2 rounded mb-4">
                        <p>디버그 정보:</p>
                        <p>- useMaps 반환값: null</p>
                        <p>- Kakao API Key: {import.meta.env.VITE_PETWALK_KAKAO_JAVASCRIPT_KEY ? '설정됨' : '누락됨'}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
                    >
                        페이지 새로고침
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
        handleKeyUp,
        moveToLocation,
        setSelectedPlace,
        showWebView,
        webViewUrl,
        openWebView,
        closeWebView,
        getCurrentLocation,
        searchNearbyPlacesByMapCenter,
        handleMapDragEnd,
        moveToCurrentLocation,
        handleRadiusChange,
        clearAllMarkers,
        addSearchResultMarkers
    } = mapsData;

    const [selectedCategory, setSelectedCategory] = useState("동물병원");
    const [initialSearchDone, setInitialSearchDone] = useState(false);
    const [mapInitialSearchDone, setMapInitialSearchDone] = useState(false);
    const [lastSearchParams, setLastSearchParams] = useState<{category: string, lat: number, lng: number, radius: number} | null>(null);
    const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [recentSearches, setRecentSearches] = useState<string[]>(() => {
        const saved = localStorage.getItem('petWalk_recentSearches');
        return saved ? JSON.parse(saved) : [];
    });
    const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

    // 디바운싱을 위한 ref
    const radiusSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 최근 검색어 추가
    const addRecentSearch = useCallback((keyword: string) => {
        if (!keyword.trim()) return;

        const newRecentSearches = [
            keyword,
            ...recentSearches.filter(item => item !== keyword)
        ].slice(0, 5); // 최대 5개

        setRecentSearches(newRecentSearches);
        localStorage.setItem('petWalk_recentSearches', JSON.stringify(newRecentSearches));
    }, [recentSearches]);


    const categories = useMemo(() => [
        {id: "동물병원", label: "동물병원", emoji: "🏥", searchType: "스마트"},
        {id: "펫샵", label: "펫샵", emoji: "🛍️", searchType: "스마트"},
        {id: "애견미용", label: "애견미용", emoji: "✂️", searchType: "스마트"},
        {id: "애견공원", label: "애견공원", emoji: "🌳", searchType: "스마트"},
        {id: "애견카페", label: "애견카페", emoji: "☕", searchType: "스마트"},
        {id: "애견호텔", label: "애견호텔", emoji: "🏨", searchType: "스마트"}
    ], []);

    // 카테고리 검색 (안전성 강화 버전)
    const handleCategorySearch = useCallback(async (category: string) => {
        try {
            // 검색 중이면 무시
            if (loading) {
                console.log('이미 검색 중입니다.');
                return;
            }

            // 지도 인스턴스 준비 체크
            if (!map?.instance) {
                console.log('지도 인스턴스가 준비되지 않았습니다.');
                return;
            }

            // 검색 함수 존재 체크
            if (!searchNearbyPlacesByMapCenter) {
                console.error('검색 함수가 준비되지 않았습니다.');
                setError('검색 서비스를 초기화하는 중입니다.');
                return;
            }

            // 현재 지도 중심 좌표 및 검색 조건 확인
            const center = map.instance.getCenter();
            const currentLat = center.getLat();
            const currentLng = center.getLng();

            // 중복 검색 방지: 동일한 조건으로 검색했던 경우 스킵
            if (lastSearchParams &&
                lastSearchParams.category === category &&
                Math.abs(lastSearchParams.lat - currentLat) < 0.001 &&
                Math.abs(lastSearchParams.lng - currentLng) < 0.001 &&
                lastSearchParams.radius === searchRadius) {
                return; // 중복 검색 방지
            }

            setSelectedCategory(category);
            setSelectedPlace(null); // 이전 선택된 장소 정보 초기화

            // 검색 조건 저장
            setLastSearchParams({
                category,
                lat: currentLat,
                lng: currentLng,
                radius: searchRadius
            });

            // 항상 지도 화면 중심 기준으로 검색 (뷰포트 조정은 자동으로 처리됨)
            await searchNearbyPlacesByMapCenter(category);
        } catch (error) {
            console.error('카테고리 검색 오류:', error);

            // 실패 시 상태 초기화
            setLastSearchParams(null);
            setError('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
            setLoading?.(false);
        }
    }, [loading, map?.instance, searchRadius, lastSearchParams, searchNearbyPlacesByMapCenter, setError]);

    // 지도 초기화 및 기본 위치 검색 (안전성 강화)
    useEffect(() => {
        try {
            if (kakaoMapsLoaded && window.kakao?.maps && !map?.instance) {
                console.log('지도 초기화 시작');
                const mapContainer = document.getElementById('map');

                if (mapContainer) {
                    try {
                        const mapInstance = new window.kakao.maps.Map(mapContainer, {
                            center: new window.kakao.maps.LatLng(37.5666805, 126.9784147), // 서울 중심
                            level: 4,
                        });

                        map?.setMap(mapInstance);
                        console.log('지도 인스턴스 생성 완료');

                        // 지도 로드 후 기본 검색 실행
                        setTimeout(() => {
                            try {
                                if (!mapInitialSearchDone && handleCategorySearch) {
                                    console.log('초기 검색 실행:', selectedCategory);
                                    handleCategorySearch(selectedCategory);
                                    setMapInitialSearchDone(true);
                                }
                            } catch (searchError) {
                                console.error('초기 검색 오류:', searchError);
                                setError?.('초기 검색 중 오류가 발생했습니다.');
                            }
                        }, 1000); // 지도 로드 완료 대기
                    } catch (mapError) {
                        console.error('지도 인스턴스 생성 오류:', mapError);
                        setError?.('지도를 초기화하는 중 오류가 발생했습니다.');
                    }
                } else {
                    console.error('지도 컨테이너를 찾을 수 없습니다.');
                    setError?.('지도 컨테이너를 찾을 수 없습니다.');
                }
            }
        } catch (error) {
            console.error('지도 초기화 전체 오류:', error);
            setError?.('지도 서비스 초기화에 실패했습니다.');
        }
    }, [kakaoMapsLoaded, map, mapInitialSearchDone, handleCategorySearch, selectedCategory, setError]);

    // 현재 위치 권한 허용 시 지도 이동 및 재검색
    useEffect(() => {
        if (currentLocation && !initialSearchDone && map.instance) {
            // 지도를 현재 위치로 이동
            const moveLatLng = new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
            map.instance.panTo(moveLatLng);

            // 지도 이동 후 해당 지역 기준으로 재검색
            setTimeout(() => {
                handleCategorySearch(selectedCategory);
            }, 600); // 지도 이동 완료 후 검색

            setInitialSearchDone(true);
        }
    }, [currentLocation, initialSearchDone, map.instance, handleCategorySearch, selectedCategory]);

    // ESC 키로 WebView 모달 닫기
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && showWebView) {
                closeWebView();
            }
        };

        if (showWebView) {
            document.addEventListener('keydown', handleKeyDown);
            // 모달이 열릴 때 body 스크롤 방지
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            // 모달이 닫힐 때 body 스크롤 복원
            document.body.style.overflow = 'unset';
        };
    }, [showWebView, closeWebView]);

    // 화면 크기 변경 시 모달 위치 재계산
    useEffect(() => {
        const handleResize = () => {
            if (selectedPlacePosition) {
                // 화면 크기가 변경되면 모달 위치 재계산이 필요할 수 있음
                console.log('화면 크기 변경됨, 모달 위치 재계산 필요');
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [selectedPlacePosition]);

    // cleanup 함수
    useEffect(() => {
        return () => {
            if (radiusSearchTimeoutRef.current) {
                clearTimeout(radiusSearchTimeoutRef.current);
            }
        };
    }, []);

    // 검색 버튼 클릭 (메모이제이션)
    const handleSearchClick = useCallback(() => {
        if (searchKeyword.trim()) {
            // 키워드 검색
            addRecentSearch(searchKeyword);
            handleKeyUp({key: 'Enter'} as React.KeyboardEvent);
            setShowSearchSuggestions(false);
        } else if (selectedCategory) {
            // 카테고리 재검색
            handleCategorySearch(selectedCategory);
        }
    }, [searchKeyword, selectedCategory, handleKeyUp, handleCategorySearch, addRecentSearch]);



    // 반경 변경 시 자동 재검색 (디바운싱 강화 + 중복 검색 방지)
    const handleRadiusChangeWithSearch = useCallback((radius: number) => {
        handleRadiusChange(radius);

        // 검색 조건 초기화 (반경 변경으로 인해)
        setLastSearchParams(null);

        if (radiusSearchTimeoutRef.current) {
            clearTimeout(radiusSearchTimeoutRef.current);
        }

        if (selectedCategory && !loading) {
            radiusSearchTimeoutRef.current = setTimeout(() => {
                handleCategorySearch(selectedCategory);
            }, 600);
        }
    }, [selectedCategory, loading, handleRadiusChange, handleCategorySearch]);

    // 거리 계산 함수
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // 거리 포맷팅
    const formatDistance = (distance: number): string => {
        if (distance < 1) {
            return `${Math.round(distance * 1000)}m`;
        } else {
            return `${distance.toFixed(1)}km`;
        }
    };

    // 지도 확대/축소 (메모이제이션)
    const zoomIn = useCallback(() => {
        if (kakaoMapsLoaded && map.instance) {
            const currentLevel = map.instance.getLevel();
            if (currentLevel > 1) {
                map.instance.setLevel(currentLevel - 1);
            }
        }
    }, [kakaoMapsLoaded, map.instance]);

    const zoomOut = useCallback(() => {
        if (kakaoMapsLoaded && map.instance) {
            const currentLevel = map.instance.getLevel();
            if (currentLevel < 14) {
                map.instance.setLevel(currentLevel + 1);
            }
        }
    }, [kakaoMapsLoaded, map.instance]);

    return (
        <div className="h-screen pt-16 bg-gray-50 relative overflow-hidden">
            {/* 모바일 햄버거 메뉴 */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="fixed top-20 left-4 z-30 lg:hidden bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
                {isSidebarOpen ? <FaTimes className="w-5 h-5 text-gray-600" /> : <FaBars className="w-5 h-5 text-gray-600" />}
            </button>

            <div className="h-full flex relative">
                {/* 왼쪽 사이드바 */}
                <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    fixed lg:relative z-20 w-80 lg:w-96 bg-white shadow-2xl
                    flex flex-col h-full transition-transform duration-300 ease-in-out max-h-screen`}>
                    {/* 헤더 - 고정 */}
                    <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h1 className="text-xl font-bold text-gray-800">🐾 펫 플레이스</h1>
                                <div className="lg:hidden">
                                    <button
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <FaTimes className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            {/* 검색창 */}
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    placeholder="장소명, 주소 검색..."
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    onKeyUp={handleKeyUp}
                                    onFocus={() => setShowSearchSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                                    className="w-full bg-gray-50 rounded-xl px-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white border border-gray-200 transition-all"
                                />

                                {searchKeyword.trim() && (
                                    <button
                                        onClick={() => {
                                            setSearchKeyword('');
                                            setShowSearchSuggestions(false);
                                        }}
                                        className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <FaTimes className="w-4 h-4" />
                                    </button>
                                )}

                                <button
                                    onClick={handleSearchClick}
                                    disabled={loading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-indigo-500 hover:text-indigo-600 disabled:text-gray-300 transition-colors"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <FaSearch className="w-4 h-4"/>
                                    )}
                                </button>

                                {/* 검색 제안 드롭다운 */}
                                {showSearchSuggestions && recentSearches.length > 0 && (
                                    <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
                                        {/* 최근 검색어 */}
                                        {recentSearches.length > 0 && (
                                            <div className="p-3 border-b border-gray-100">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">최근 검색</h4>
                                                    <button
                                                        onClick={() => {
                                                            setRecentSearches([]);
                                                            localStorage.removeItem('petWalk_recentSearches');
                                                        }}
                                                        className="text-xs text-gray-400 hover:text-gray-600"
                                                    >
                                                        전체 삭제
                                                    </button>
                                                </div>
                                                <div className="space-y-1">
                                                    {recentSearches.map((keyword, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => {
                                                                setSearchKeyword(keyword);
                                                                addRecentSearch(keyword);
                                                                handleKeyUp({key: 'Enter'} as React.KeyboardEvent);
                                                                setShowSearchSuggestions(false);
                                                            }}
                                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                                                        >
                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {keyword}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 카테고리 - 항상 보이게 */}
                        <div className="px-4 pb-4">
                            <div className="grid grid-cols-3 gap-3">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategorySearch(category.id)}
                                        disabled={loading || !map.instance || kakaoMapsLoading}
                                        className={`p-3 md:p-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-2 md:gap-1 min-h-[72px] md:min-h-[64px] touch-manipulation ${
                                            selectedCategory === category.id
                                                ? "bg-indigo-500 text-white shadow-lg scale-105"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
                                        }`}
                                    >
                                        <span className="text-xl md:text-lg">{category.emoji}</span>
                                        <span className="text-xs leading-tight text-center">{category.label}</span>
                                        <span className="text-[10px] opacity-60 font-medium">
                                            {category.searchType}
                                        </span>
                                        {loading && selectedCategory === category.id && (
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 검색 설정 토글 */}
                        <button
                            onClick={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)}
                            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-sm font-medium text-gray-700 border-t border-gray-200"
                        >
                            <span>검색 설정</span>
                            {isSettingsPanelOpen ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* 검색 설정 패널 - 컴팩트하게 개선 */}
                    {isSettingsPanelOpen && (
                        <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
                            <div className="p-3 space-y-3">
                                {/* 내 위치 찾기 - 더 컴팩트하게 */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-semibold text-gray-700">위치 설정</h3>
                                        <button
                                            onClick={getCurrentLocation}
                                            disabled={locationLoading}
                                            className="flex items-center gap-1 bg-indigo-500 text-white py-1.5 px-3 rounded-lg text-xs font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {locationLoading ? (
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <FaMapMarkerAlt className="w-3 h-3"/>
                                            )}
                                            <span>{locationLoading ? '확인 중...' : '내 위치'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* 검색 반경 - 더 컴팩트하게 */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-semibold text-gray-700">검색 반경</h3>
                                        <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                                            {searchRadius >= 1000 ? `${searchRadius / 1000}km` : `${searchRadius}m`}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="500"
                                            max="5000"
                                            step="500"
                                            value={searchRadius}
                                            onChange={(e) => handleRadiusChangeWithSearch(Number(e.target.value))}
                                            className="w-full h-2 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full appearance-none cursor-pointer slider shadow-inner"
                                            style={{
                                                background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((searchRadius - 500) / (5000 - 500)) * 100}%, #e5e7eb ${((searchRadius - 500) / (5000 - 500)) * 100}%, #e5e7eb 100%)`
                                            }}
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>500m</span>
                                            <span>5km</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 검색 결과 - 최소 높이 보장 및 스크롤 개선 */}
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0" style={{ minHeight: '40vh' }}>
                        <div className="flex-shrink-0 px-4 py-2 bg-white border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-gray-700">검색 결과</h3>
                                {searchResults && searchResults.documents && (
                                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                                        {searchResults.documents.length}개
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto bg-gray-50 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 350px)' }}>
                            {/* 로딩 상태 */}
                            {loading && (
                                <div className="p-8 text-center">
                                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-200 border-t-indigo-500"></div>
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-lg mb-2">{selectedCategory} 검색 중...</h4>
                                        <p className="text-sm text-gray-600">현재 지도 영역에서 {searchRadius >= 1000 ? `${searchRadius/1000}km` : `${searchRadius}m`} 반경 내 검색중</p>
                                    </div>
                                </div>
                            )}

                            {/* 에러 상태 */}
                            {error && (
                                <div className="p-8 text-center">
                                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                        <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <div className="text-3xl">⚠️</div>
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-lg mb-3">검색에 실패했어요</h4>
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                                            <p className="text-red-700 text-sm leading-relaxed">{error}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setError(null);
                                                if (selectedCategory) {
                                                    handleCategorySearch(selectedCategory);
                                                }
                                            }}
                                            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all"
                                        >
                                            다시 시도
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 검색 결과 목록 */}
                            {searchResults && searchResults.documents && searchResults.documents.length > 0 ? (
                                <div className="p-4 space-y-3">
                                    {searchResults.documents.map((place: any, index: number) => {
                                        const distance = null; // 거리 표시 제거

                                        return (
                                            <div
                                                key={place.id || index}
                                                onClick={() => {
                                                    moveToLocation(
                                                        parseFloat(place.y),
                                                        parseFloat(place.x),
                                                        place
                                                    );
                                                    // 모바일에서 검색 결과 클릭 시 사이드바 자동 닫기
                                                    if (window.innerWidth < 1024) {
                                                        setIsSidebarOpen(false);
                                                    }
                                                }}
                                                className="group bg-white hover:bg-gradient-to-br hover:from-indigo-50 hover:to-white rounded-2xl p-5 md:p-4 cursor-pointer transition-all duration-300 border border-gray-100 hover:border-indigo-200 shadow-sm hover-lift animate-fade-in touch-feedback"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-gray-900 text-lg group-hover:text-indigo-800 transition-colors">{place.place_name}</h4>
                                                        </div>
                                                        {place.category_name && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="inline-block px-2 py-1 bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-200">
                                                                    {place.category_name.split(' > ').pop()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {distance !== null && (
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-xs bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3 py-1.5 rounded-full font-semibold shadow-sm">
                                                                {formatDistance(distance)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex items-start gap-2">
                                                        <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                                                        </svg>
                                                        <p className="text-sm text-gray-600 leading-relaxed">{place.address_name}</p>
                                                    </div>

                                                    {place.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                                                            </svg>
                                                            <p className="text-sm text-gray-500">{place.phone}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                                    <span className="text-xs text-gray-400 font-medium">지도에서 보기</span>
                                                    <svg className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* 더 많은 결과 보기 버튼 */}
                                    {searchResults.documents.length >= 15 && (
                                        <div className="p-4 text-center">
                                            <button
                                                onClick={() => {
                                                    // TODO: 페이지네이션 구현
                                                }}
                                                className="w-full bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 py-3 px-4 rounded-xl text-sm font-medium hover:from-indigo-200 hover:to-indigo-100 transition-all border border-indigo-200 hover:border-indigo-300"
                                            >
                                                더 많은 결과 보기 📱
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : !loading && !error && (
                                <div className="p-8 text-center">
                                    {searchKeyword.trim() ? (
                                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <div className="text-3xl">🔍</div>
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-lg mb-3">검색 결과가 없어요</h4>
                                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    '<span className="font-medium text-indigo-600">{searchKeyword}</span>' 검색 결과를 찾을 수 없습니다.
                                                </p>
                                            </div>
                                            <p className="text-xs text-gray-500">다른 키워드로 시도해보세요</p>
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <div className="text-3xl">🐾</div>
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-lg mb-3">검색 결과가 없어요</h4>
                                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                                <p className="text-sm text-gray-600 leading-relaxed mb-2">
                                                    이 지역에 '<span className="font-medium text-indigo-600">{selectedCategory}</span>'가 없습니다.
                                                </p>
                                                <p className="text-xs text-gray-500">검색 반경을 늘려보세요</p>
                                            </div>
                                            {searchRadius < 5000 && (
                                                <button
                                                    onClick={() => handleRadiusChangeWithSearch(Math.min(searchRadius + 1000, 5000))}
                                                    className="bg-gradient-to-r from-indigo-100 to-indigo-50 text-indigo-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:from-indigo-200 hover:to-indigo-100 transition-all border border-indigo-200 hover:border-indigo-300 flex items-center justify-center gap-2 mx-auto"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                    </svg>
                                                    반경 1km 늘리기
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 오른쪽 지도 영역 */}
                <div className="flex-1 relative bg-white" style={{ zIndex: 1 }}>
                    <div id="map" className="w-full h-full rounded-l-xl lg:rounded-l-none" style={{ zIndex: 1 }}></div>

                    {/* Kakao Maps 로딩 오버레이 */}
                    {kakaoMapsLoading && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-l-xl lg:rounded-l-none">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-200 border-t-indigo-500"></div>
                                </div>
                                <h4 className="font-bold text-gray-900 text-lg mb-2">지도를 불러오는 중...</h4>
                                <p className="text-sm text-gray-600">Kakao Maps API를 로딩하고 있습니다</p>
                            </div>
                        </div>
                    )}

                    {/* Kakao Maps 로딩 에러 오버레이 */}
                    {!kakaoMapsLoading && !kakaoMapsLoaded && error?.includes('Kakao') && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 rounded-l-xl lg:rounded-l-none">
                            <div className="text-center max-w-md">
                                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <div className="text-3xl">⚠️</div>
                                </div>
                                <h4 className="font-bold text-gray-900 text-lg mb-3">지도 로딩 실패</h4>
                                <p className="text-sm text-gray-600 mb-4">Kakao Maps API를 불러올 수 없습니다.</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg"
                                >
                                    페이지 새로고침
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 지도 컨트롤 */}
                    <div className="absolute top-4 right-4 flex flex-col bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 overflow-hidden" style={{ zIndex: 10 }}>
                        <button
                            onClick={zoomIn}
                            className="p-5 md:p-4 hover:bg-indigo-50 border-b border-gray-200 transition-all hover:text-indigo-600 group active:scale-95 touch-manipulation"
                            aria-label="확대"
                        >
                            <svg className="w-6 h-6 md:w-5 md:h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor"
                                 viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                        </button>
                        <button
                            onClick={zoomOut}
                            className="p-5 md:p-4 hover:bg-indigo-50 transition-all hover:text-indigo-600 group active:scale-95 touch-manipulation"
                            aria-label="축소"
                        >
                            <svg className="w-6 h-6 md:w-5 md:h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor"
                                 viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6"/>
                            </svg>
                        </button>
                    </div>

                    {/* 플로팅 액션 버튼들 */}
                    <div className="absolute bottom-6 right-6 flex flex-col gap-3" style={{ zIndex: 10 }}>
                        {/* 현재 위치로 이동 */}
                        <button
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="w-14 h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
                            aria-label="현재 위치"
                        >
                            {locationLoading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>

                        {/* 마커 전체 보기 */}
                        {searchMarkers.length > 0 && (
                            <button
                                onClick={() => {
                                    if (map.instance && searchMarkers.length > 0) {
                                        const bounds = new window.kakao.maps.LatLngBounds();
                                        searchMarkers.forEach(marker => {
                                            bounds.extend(marker.getPosition());
                                        });
                                        map.instance.setBounds(bounds);
                                    }
                                }}
                                className="w-14 h-14 bg-white hover:bg-gray-50 text-gray-700 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group border border-gray-200 hover:scale-110 active:scale-95"
                                aria-label="전체 마커 보기"
                            >
                                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* 선택된 장소 정보 (마커 위치 기반) */}
                    {selectedPlace && (
                        <div
                            className="absolute bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 p-5 max-w-xs animate-fade-in pointer-events-auto"
                            style={{
                                zIndex: 20,
                                left: selectedPlacePosition ? `${Math.max(10, Math.min(selectedPlacePosition.x - 140, window.innerWidth - 300))}px` : '50%',
                                top: selectedPlacePosition ? `${Math.max(80, selectedPlacePosition.y - 280)}px` : '120px',
                                transform: selectedPlacePosition ? 'none' : 'translateX(-50%)'
                            }}>
                            {/* 말풍선 꼬리 (마커를 가리키는 화살표) */}
                            {selectedPlacePosition && (
                                <div
                                    className="absolute w-4 h-4 bg-white/95 border-b border-r border-gray-200 transform rotate-45"
                                    style={{
                                        bottom: '-8px',
                                        left: '50%',
                                        marginLeft: '-8px'
                                    }}
                                ></div>
                            )}
                            {/* 헤더 - 간결하게 */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 truncate">{selectedPlace.place_name}</h3>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {selectedPlace.category_name && (
                                            <span className="inline-flex items-center px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg">
                                                {selectedPlace.category_name.split(' > ').pop()}
                                            </span>
                                        )}
                                        {selectedPlace.distance && (
                                            <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-lg">
                                                📍 {selectedPlace.distance < 1000 ? `${selectedPlace.distance}m` : `${(selectedPlace.distance / 1000).toFixed(1)}km`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPlace(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-all flex-shrink-0 ml-2"
                                >
                                    <FaTimes className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            </div>

                            {/* 주소 정보 - 간소화 */}
                            <div className="bg-gray-50 rounded-xl p-3 mb-3">
                                <div className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                                    </svg>
                                    <p className="text-sm text-gray-600 leading-relaxed">{selectedPlace.address_name}</p>
                                </div>
                                {selectedPlace.phone && (
                                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                                        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                                        </svg>
                                        <p className="text-sm text-gray-600">{selectedPlace.phone}</p>
                                    </div>
                                )}
                            </div>

                            {/* 액션 버튼들 - 간결하게 2개만 */}
                            <div className="grid grid-cols-2 gap-3">
                                {/* 길찾기 버튼 */}
                                <button
                                    onClick={() => {
                                        const url = `https://map.kakao.com/link/to/${encodeURIComponent(selectedPlace.place_name)},${selectedPlace.y},${selectedPlace.x}`;
                                        window.open(url, '_blank');
                                    }}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    길찾기
                                </button>

                                {/* 상세보기 버튼 */}
                                {selectedPlace.place_url && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log('🎯 카카오맵 상세보기 버튼 클릭:', selectedPlace.place_url);
                                            if (selectedPlace.place_url && openWebView) {
                                                openWebView(selectedPlace.place_url);
                                            } else {
                                                console.error('⚠️ place_url 또는 openWebView가 없습니다.');
                                            }
                                        }}
                                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-3 px-4 rounded-xl text-sm font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                        상세보기
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 사이드바 마스크 (모바일용) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* WebView 모달 (z-index 최대값 적용) */}
            {showWebView && webViewUrl && webViewUrl.trim() && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
                    style={{ zIndex: 999999 }}
                    onClick={(e) => {
                        // 배경 클릭 시에만 모달 닫기
                        if (e.target === e.currentTarget) {
                            closeWebView();
                        }
                    }}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col"
                        style={{ zIndex: 1000000 }}
                        onClick={(e) => e.stopPropagation()} // 이벤트 버블링 방지
                    >
                        <div className="flex items-center justify-between p-5 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">카카오맵 상세보기</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">ESC로 닫기</span>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        closeWebView();
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    aria-label="모달 닫기"
                                >
                                    <FaTimes className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            {/* 새 탭에서 열기 링크 */}
                            <div className="bg-gray-50 px-5 py-2 border-b border-gray-200">
                                <a
                                    href={webViewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    새 탭에서 열기
                                </a>
                            </div>
                            <iframe
                                src={webViewUrl}
                                className="w-full h-full border-0"
                                title="카카오맵 상세보기"
                                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
                                allow="geolocation"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

PetWalk.displayName = 'PetWalk';

// CSS 스타일 추가
const globalStyles = `
/* 카카오맵 z-index 조정 */
#map * {
  z-index: 1 !important;
}

#map .kakao-map {
  z-index: 1 !important;
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.slider::-webkit-slider-track {
  height: 12px;
  border-radius: 6px;
  background: transparent;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  height: 24px;
  width: 24px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4), 0 2px 4px rgba(0,0,0,0.1);
  border: 3px solid white;
  transition: all 0.2s ease;
  position: relative;
  top: -6px;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5), 0 4px 8px rgba(0,0,0,0.15);
}

.slider::-webkit-slider-thumb:active {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.6), 0 4px 12px rgba(0,0,0,0.2);
}

.slider::-moz-range-track {
  height: 12px;
  border-radius: 6px;
  background: transparent;
  border: none;
}

.slider::-moz-range-thumb {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  height: 24px;
  width: 24px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4), 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5), 0 4px 8px rgba(0,0,0,0.15);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 커스텀 스크롤바 */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 부드러운 그라데이션 효과 */
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-bg-alt {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

/* 글래스모피즘 효과 */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 호버 효과 강화 */
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* 터치 피드백 */
.touch-feedback {
  transition: all 0.15s ease;
}

.touch-feedback:active {
  transform: scale(0.95);
}

/* 무한 회전 애니메이션 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin 3s linear infinite;
}

/* 부드러운 플로팅 애니메이션 */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
`;

// 전역 스타일 주입
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}

export default PetWalk;