import React from 'react';
import { useAuth } from '../hooks';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

const UserProfile: React.FC = () => {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Logout failed
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaUser className="text-3xl text-blue-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">환영합니다!</h2>
        <p className="text-gray-600">로그인이 성공적으로 완료되었습니다.</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              아이디
            </label>
            <p className="text-gray-900 font-medium">{user.username}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              계정 ID
            </label>
            <p className="text-gray-600">#{user.accountId}</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2"
      >
        <FaSignOutAlt />
        {isLoading ? '로그아웃 중...' : '로그아웃'}
      </button>
    </div>
  );
};

export default UserProfile;