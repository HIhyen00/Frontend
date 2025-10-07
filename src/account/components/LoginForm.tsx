import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import {FaEye, FaEyeSlash, FaUser, FaLock} from "react-icons/fa";

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
    return localStorage.getItem('rememberMe') === 'true';
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
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <img
          src="/Logo.png"
          alt="My Real Pet Logo"
          className="mx-auto h-32 w-auto mb-3 cursor-pointer"
          onClick={() => navigate('/')}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <p className="text-2xl text-gray-600 mb-12">
          로그인해서 <span className="text-blue-600 font-semibold">반려동물</span>과<br />함께하세요
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <FaUser />
            </div>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="아이디를 입력하세요"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <FaLock />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="비밀번호를 입력하세요"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
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
          className="w-full bg-blue-500 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          )}
          {success && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isLoading ? '로그인 중...' : success ? '로그인 완료!' : '로그인'}
        </button>
      </form>

      <div className="mt-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleKakaoLogin}
          disabled={isLoading || !!success}
          className="mt-4 w-full bg-[#FEE500] hover:bg-[#FDD835] disabled:opacity-50 disabled:cursor-not-allowed text-black font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center gap-3 border border-gray-300"
          style={{ fontSize: '16px', height: '50px' }}
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

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            회원가입
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;