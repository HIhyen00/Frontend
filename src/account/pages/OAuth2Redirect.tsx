import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks';
import { authService } from '../services';

const OAuth2Redirect: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuth2Callback = async () => {
      try {
        // URL에서 파라미터 추출
        const token = searchParams.get('token');
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');

        // 에러가 있는 경우
        if (error) {
          setError('로그인 중 오류가 발생했습니다.');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
          return;
        }

        // 백엔드에서 JWT 토큰을 직접 전달하는 경우
        if (token) {
          localStorage.setItem('token', token);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }

          // 사용자 정보 조회
          try {
            const userInfo = await authService.getCurrentUser();
            const user = {
              accountId: userInfo.accountId,
              username: userInfo.username,
            };
            localStorage.setItem('user', JSON.stringify(user));

            // AuthProvider의 상태 복원을 위해 페이지 새로고침
            window.location.href = '/';
            return;
          } catch (userError) {
            // 토큰이 있어도 사용자 정보를 가져올 수 없으면 다시 로그인
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          }
        }

        // accessToken이 있는 경우 (백엔드에서 카카오 토큰을 직접 전달)
        if (accessToken) {
          // 카카오 토큰을 백엔드로 전송하여 JWT 토큰 교환
          try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/kakao/token`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                accessToken,
                refreshToken
              }),
            });

            if (!response.ok) {
              throw new Error('토큰 교환 실패');
            }

            const data = await response.json();

            localStorage.setItem('token', data.token);
            if (data.refreshToken) {
              localStorage.setItem('refreshToken', data.refreshToken);
            }

            const user = {
              accountId: data.accountId,
              username: data.username,
            };
            localStorage.setItem('user', JSON.stringify(user));

            // AuthProvider의 상태 복원을 위해 페이지 새로고침
            window.location.href = '/';
            return;
          } catch (tokenError) {
            setError('로그인 처리 중 오류가 발생했습니다.');
          }
        }

        // 필요한 파라미터가 없는 경우
        setError('로그인 정보가 올바르지 않습니다.');
        setTimeout(() => navigate('/login', { replace: true }), 2000);

      } catch (err) {
        setError('로그인 처리 중 오류가 발생했습니다.');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      }
    };

    handleOAuth2Callback();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {error ? (
          <div>
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <p className="text-red-600 mb-4">{error}</p>
            <p className="text-gray-500">잠시 후 로그인 페이지로 이동합니다...</p>
          </div>
        ) : (
          <div>
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">로그인 처리 중...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuth2Redirect;