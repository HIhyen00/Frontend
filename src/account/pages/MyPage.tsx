import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { authService } from '../services/authService';
import { FaUser, FaSignOutAlt, FaUserTimes } from 'react-icons/fa';

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, setShowLogoutModal } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await authService.deleteAccount();
      await logout();
      navigate('/');
    } catch (error: any) {
      const errorMessage = error?.koreanMessage || error?.response?.data?.message || '회원탈퇴에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
              <FaUser className="text-3xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
              <p className="text-gray-600">계정 ID: {user.accountId}</p>
            </div>
          </div>
        </div>

        {/* 계정 관리 */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">계정 관리</h2>

          <div className="space-y-4">
            {/* 로그아웃 */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <FaSignOutAlt className="text-xl text-gray-600" />
                <span className="font-medium text-gray-900">로그아웃</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            {/* 회원탈퇴 */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <FaUserTimes className="text-xl text-red-600" />
                <span className="font-medium text-red-600">회원탈퇴</span>
              </div>
              <span className="text-red-400">→</span>
            </button>
          </div>
        </div>

        {/* 정보 */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">앱 정보</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>버전: 1.0.0</p>
            <p>My Real Pet - 반려동물 관리 서비스</p>
          </div>
        </div>
      </div>

      {/* 회원탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FaUserTimes className="text-2xl text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">회원탈퇴</h3>
              <p className="text-sm text-gray-600">
                정말 탈퇴하시겠습니까?<br />
                모든 데이터가 삭제되며 복구할 수 없습니다.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;