declare global {
  interface Window {
    Kakao: {
      init: (appKey: string) => void;
      isInitialized: () => boolean;
      Auth: {
        login: (options: {
          success: (authObj: { access_token: string; refresh_token?: string; expires_in: number; scope: string; token_type: string }) => void;
          fail: (error: any) => void;
        }) => void;
        logout: (callback?: () => void) => void;
        getAccessToken: () => string | null;
      };
    };
  }
}

export {};