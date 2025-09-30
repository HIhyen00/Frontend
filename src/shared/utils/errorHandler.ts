export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  validationErrors?: Record<string, string>;
}

export class ErrorHandler {
  static handle(error: any): string {
    // Network errors
    if (!error.response) {
      return '네트워크 연결을 확인해주세요.';
    }

    const { status, data } = error.response;

    // Handle different status codes
    switch (status) {
      case 400:
        if (data?.validationErrors) {
          return Object.values(data.validationErrors).join(', ');
        }
        return data?.message || '잘못된 요청입니다.';

      case 401:
        // 디버깅을 위해 토큰 삭제 주석 처리
        console.error('401 Unauthorized - Token:', localStorage.getItem('token'));
        console.error('401 Error response:', data);
        // localStorage.removeItem('token');
        return data?.error || '인증에 실패했습니다.';

      case 403:
        return '접근 권한이 없습니다.';

      case 404:
        return '요청한 리소스를 찾을 수 없습니다.';

      case 409:
        return data?.message || '중복된 요청입니다.';

      case 429:
        return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';

      case 500:
        return '서버 내부 오류가 발생했습니다.';

      case 502:
        return '외부 서비스 연결에 실패했습니다.';

      case 503:
        return '서비스를 일시적으로 사용할 수 없습니다.';

      default:
        return data?.message || '알 수 없는 오류가 발생했습니다.';
    }
  }

  static notify(message: string, type: 'error' | 'success' | 'warning' = 'error') {
    // Simple notification system
    console.log(`[${type.toUpperCase()}] ${message}`);

    // You can replace this with a toast notification library
    if (type === 'error') {
      alert(`오류: ${message}`);
    }
  }

  static handleAndNotify(error: any): void {
    const message = this.handle(error);
    this.notify(message, 'error');
  }
}