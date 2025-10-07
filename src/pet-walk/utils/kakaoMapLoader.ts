// Kakao Maps API 동적 로더
interface KakaoMapLoaderOptions {
    appKey?: string;
    libraries?: string[];
    autoload?: boolean;
}

class KakaoMapLoader {
    private static instance: KakaoMapLoader;
    private loadPromise: Promise<void> | null = null;
    private isLoaded = false;
    private isLoading = false;

    private constructor() {}

    public static getInstance(): KakaoMapLoader {
        if (!KakaoMapLoader.instance) {
            KakaoMapLoader.instance = new KakaoMapLoader();
        }
        return KakaoMapLoader.instance;
    }

    private cleanupExistingScripts(): void {
        // 기존의 Kakao Maps 관련 스크립트 제거
        const existingScripts = document.querySelectorAll('script[src*="dapi.kakao.com"], script[src*="t1.daumcdn.net/mapjsapi"], script#kakao-maps-sdk');
        existingScripts.forEach(script => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        });

        // 이미 같은 ID의 스크립트가 있는지 확인
        const existingById = document.getElementById('kakao-maps-sdk');
        if (existingById && existingById.parentNode) {
            existingById.parentNode.removeChild(existingById);
        }
    }

    public async load(options: KakaoMapLoaderOptions = {}): Promise<void> {
        if (this.isLoaded) {
            return Promise.resolve();
        }

        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.isLoading = true;

        this.loadPromise = new Promise((resolve, reject) => {
            // 기존 스크립트 정리 (document.write로 로드된 것들)
            this.cleanupExistingScripts();

            // 이미 로드된 경우
            if (window.kakao?.maps?.load) {
                // 수동 로드 실행
                window.kakao.maps.load(() => {
                    this.isLoaded = true;
                    this.isLoading = false;
                    resolve();
                });
                return;
            }

            // 스크립트 엘리먼트 생성
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.id = 'kakao-maps-sdk';
            script.async = true;
            script.defer = true;

            // 기본 설정
            const {
                appKey = import.meta.env.VITE_PETWALK_KAKAO_JAVASCRIPT_KEY || import.meta.env.VITE_KAKAO_API_JAVASCRIPT_KEY || '',
                libraries = ['services', 'clusterer', 'drawing'],
                autoload = false // 기본값을 false로 변경
            } = options;

            // URL 구성 (최신 v2 API, 최소한의 라이브러리)
            const params = new URLSearchParams({
                appkey: appKey,
                autoload: 'false',
                libraries: 'services' // 최소한만 로드
            });

            script.src = `https://dapi.kakao.com/v2/maps/sdk.js?${params.toString()}`;

            // 최대 대기 시간 설정
            const timeoutId = setTimeout(() => {
                this.isLoading = false;
                reject(new Error('Kakao Maps API 로드 타임아웃 (30초)'));
            }, 30000);

            // 로드 완료 핸들러
            script.onload = () => {
                // window.kakao 객체 존재 확인
                if (window.kakao?.maps?.load) {
                    try {
                        // 수동 로드로 document.write 완전 방지
                        window.kakao.maps.load(() => {
                            clearTimeout(timeoutId);
                            this.isLoaded = true;
                            this.isLoading = false;
                            resolve();
                        });
                    } catch (error) {
                        console.error('Kakao Maps API 초기화 오류:', error);
                        clearTimeout(timeoutId);
                        this.isLoading = false;
                        reject(error);
                    }
                } else {
                    this.isLoading = false;
                    reject(new Error('Kakao Maps API를 로드했지만 객체를 찾을 수 없습니다.'));
                }
            };

            // 에러 핸들러
            script.onerror = (error) => {
                clearTimeout(timeoutId);
                this.isLoading = false;
                reject(new Error(`Kakao Maps API 로드에 실패했습니다: ${error}`));
            };

            // DOM에 추가
            document.head.appendChild(script);
        });

        return this.loadPromise;
    }

    public isApiLoaded(): boolean {
        return this.isLoaded && !!window.kakao?.maps;
    }

    public isApiLoading(): boolean {
        return this.isLoading;
    }

    public reset(): void {
        this.loadPromise = null;
        this.isLoaded = false;
        this.isLoading = false;
    }
}

// 전역 타입 확장
declare global {
    interface Window {
        kakao: {
            maps: {
                load: (callback: () => void) => void;
                Map: any;
                LatLng: any;
                Marker: any;
                InfoWindow: any;
                LatLngBounds: any;
                MarkerImage: any;
                Size: any;
                Point: any;
                event: {
                    addListener: (target: any, type: string, handler: (...args: any[]) => void) => void;
                };
            };
        };
    }
}

// 싱글톤 인스턴스 내보내기
export const kakaoMapLoader = KakaoMapLoader.getInstance();

// 편의 함수
export const loadKakaoMaps = (options?: KakaoMapLoaderOptions) => {
    return kakaoMapLoader.load(options);
};

export const isKakaoMapsLoaded = () => {
    return kakaoMapLoader.isApiLoaded();
};

export const isKakaoMapsLoading = () => {
    return kakaoMapLoader.isApiLoading();
};