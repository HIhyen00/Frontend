import { useState, useEffect, useCallback, useRef } from 'react';
import { loadKakaoMaps, isKakaoMapsLoaded } from '../utils/kakaoMapLoader';

interface UseKakaoMapsOptions {
    appKey?: string;
    libraries?: string[];
    autoload?: boolean;
}

interface UseKakaoMapsReturn {
    isLoaded: boolean;
    isLoading: boolean;
    error: string | null;
    loadMaps: () => Promise<void>;
}

export const useKakaoMaps = (options: UseKakaoMapsOptions = {}): UseKakaoMapsReturn => {
    const [isLoaded, setIsLoaded] = useState(() => isKakaoMapsLoaded());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const loadingRef = useRef(false);

    const loadMaps = useCallback(async () => {
        // 이미 로드되었거나 로딩 중이면 무시
        if (loadingRef.current || isKakaoMapsLoaded()) {
            return;
        }

        try {
            loadingRef.current = true;
            setIsLoading(true);
            setError(null);

            await loadKakaoMaps({
                autoload: false,
                libraries: ['services', 'clusterer'],
                ...options
            });

            setIsLoaded(true);
        } catch (err) {
            console.error('Kakao Maps API 로드 실패:', err);
            const errorMessage = err instanceof Error ? err.message : 'Kakao Maps API 로드 중 오류가 발생했습니다.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
            loadingRef.current = false;
        }
    }, [options]);

    useEffect(() => {
        // 이미 로드되었으면 무시
        if (!isKakaoMapsLoaded() && !loadingRef.current) {
            loadMaps();
        }
    }, [loadMaps]);

    return {
        isLoaded,
        isLoading,
        error,
        loadMaps
    };
};