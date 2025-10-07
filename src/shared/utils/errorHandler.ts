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
        // 한글 메시지 변환
        if (data?.message) {
          return this.translateMessage(data.message);
        }
        return '잘못된 요청입니다.';

      case 401:
        console.error('401 Unauthorized - Token:', localStorage.getItem('token'));
        console.error('401 Error response:', data);
        // 한글 메시지 변환
        if (data?.error) {
          return this.translateMessage(data.error);
        }
        if (data?.message) {
          return this.translateMessage(data.message);
        }
        return '인증에 실패했습니다. 다시 로그인해주세요.';

      case 403:
        return '접근 권한이 없습니다.';

      case 404:
        if (data?.message) {
          return this.translateMessage(data.message);
        }
        return '요청한 리소스를 찾을 수 없습니다.';

      case 409:
        if (data?.message) {
          return this.translateMessage(data.message);
        }
        return '중복된 요청입니다.';

      case 429:
        return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';

      case 500:
        if (data?.message) {
          return this.translateMessage(data.message);
        }
        return '서버 내부 오류가 발생했습니다.';

      case 502:
        return '외부 서비스 연결에 실패했습니다.';

      case 503:
        return '서비스를 일시적으로 사용할 수 없습니다.';

      default:
        if (data?.message) {
          return this.translateMessage(data.message);
        }
        return '알 수 없는 오류가 발생했습니다.';
    }
  }

  // 영어 에러 메시지를 한글로 변환
  private static translateMessage(message: string): string {
    const translations: Record<string, string> = {
      // Auth errors
      'Invalid credentials': '아이디 또는 비밀번호가 일치하지 않습니다.',
      'User not found': '사용자를 찾을 수 없습니다.',
      'Email already exists': '이미 사용 중인 이메일입니다.',
      'Username already exists': '이미 사용 중인 사용자명입니다.',
      'Invalid token': '유효하지 않은 토큰입니다.',
      'Token expired': '토큰이 만료되었습니다. 다시 로그인해주세요.',
      'Unauthorized': '인증이 필요합니다.',
      'Authorization header required': '로그인이 필요합니다.',
      'Invalid or expired token': '로그인 정보가 만료되었습니다. 다시 로그인해주세요.',

      // Walk route errors
      'Route not found': '산책로를 찾을 수 없습니다.',
      'Invalid route data': '잘못된 산책로 데이터입니다.',
      'Missing X-User-ID header': '사용자 정보가 필요합니다.',

      // Network errors
      'Network Error': '네트워크 연결을 확인해주세요.',
      'timeout': '요청 시간이 초과되었습니다.',

      // Common errors
      'Bad Request': '잘못된 요청입니다.',
      'Forbidden': '접근 권한이 없습니다.',
      'Not Found': '요청한 리소스를 찾을 수 없습니다.',
      'Internal Server Error': '서버 내부 오류가 발생했습니다.',
    };

    // 정확히 일치하는 번역이 있으면 반환
    if (translations[message]) {
      return translations[message];
    }

    // 부분 일치 검색
    for (const [eng, kor] of Object.entries(translations)) {
      if (message.toLowerCase().includes(eng.toLowerCase())) {
        return kor;
      }
    }

    // 번역이 없으면 원본 메시지 반환
    return message;
  }

  static notify(message: string, type: 'error' | 'success' | 'warning' = 'error') {
    // 로그만 출력 (alert 제거)
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  static handleAndNotify(error: any): void {
    const message = this.handle(error);
    this.notify(message, 'error');
  }
}