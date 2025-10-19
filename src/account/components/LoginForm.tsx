import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import {FaEye, FaEyeSlash, FaUser, FaLock, FaPaw} from "react-icons/fa";

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { login, kakaoLogin, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    const saved = localStorage.getItem('rememberMe');
    return saved !== 'false'; // 기본값 true (명시적으로 false가 아닌 경우)
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.username || !formData.password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      await login(formData, rememberMe);

      // 로그인 상태 유지 설정 저장 (사용자명만 저장)
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedUsername', formData.username);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedUsername');
      }

      setSuccess('로그인이 완료되었습니다!');
      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (err: any) {
      // koreanMessage가 이미 인터셉터에서 추가됨
      const errorMessage = err?.koreanMessage || err?.response?.data?.message || '로그인에 실패했습니다.';
      setError(errorMessage);
    }
  };

  const handleKakaoLogin = async () => {
    try {
      // 카카오 인증 SDK 동적 로드
      if (!window.Kakao) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = '//developers.kakao.com/sdk/js/kakao.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('카카오 SDK 로드 실패'));
          document.head.appendChild(script);
        });
      }

      // 카카오 SDK 초기화
      if (!window.Kakao.isInitialized()) {
        const kakaoKey = import.meta.env.VITE_ACCOUNT_KAKAO_JAVASCRIPT_KEY;
        if (!kakaoKey) {
          throw new Error('Account용 카카오 API 키가 설정되지 않았습니다.');
        }
        window.Kakao.init(kakaoKey);
      }

      // 카카오 로그인
      window.Kakao.Auth.login({
        success: async (authObj: any) => {
          try {
            // accessToken으로 백엔드 카카오 로그인 API 호출
            await kakaoLogin(authObj.access_token);
            setSuccess('카카오 로그인이 완료되었습니다!');
            setTimeout(() => {
              onSuccess?.();
            }, 1000);
          } catch (err: unknown) {
            console.error('Kakao login error:', err);
            setError('카카오 로그인 처리 중 오류가 발생했습니다.');
          }
        },
        fail: (error: any) => {
          setError('카카오 로그인에 실패했습니다.');
        }
      });
    } catch (error) {
      setError('카카오 로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-6 cursor-pointer" onClick={() => navigate('/')}>
          <FaPaw className="text-3xl text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">MyRealPet</h1>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          로그인
        </h2>
        <p className="text-gray-600">
          반려동물과 함께하는 일상을 시작하세요
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">아이디</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <FaUser />
            </div>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="아이디를 입력하세요"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <FaLock />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="비밀번호를 입력하세요"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isLoading}
            />
            <span className="text-sm text-gray-600">로그인 상태 유지</span>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !!success}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3.5 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-95"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          )}
          {success && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isLoading ? '로그인 중...' : success ? '로그인 완료!' : '로그인'}
        </button>
      </form>

      <div className="mt-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-200">또는</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleKakaoLogin}
          disabled={isLoading || !!success}
          className="mt-4 w-full bg-[#FEE500] hover:bg-[#FDD835] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-4 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></div>
          ) : success ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0C4.477 0 0 3.71 0 8.286c0 2.971 1.969 5.582 4.9 7.002L3.8 19.2c-.1.4.3.7.7.5l4.8-2.4c.2 0 .3 0 .5 0h.4c5.523 0 10-3.71 10-8.286C20 3.71 15.523 0 10 0z" fill="#3C1E1E"/>
            </svg>
          )}
          {isLoading ? '로그인 중...' : success ? '로그인 완료!' : '카카오로 로그인'}
        </button>

      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <a href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
            회원가입
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;