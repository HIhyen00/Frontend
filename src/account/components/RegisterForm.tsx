import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import {FaEye, FaEyeSlash, FaUser, FaLock, FaPhone} from "react-icons/fa";

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    email: '',
    name: '',
    phoneNumber: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.id || !formData.password || !formData.confirmPassword || !formData.name || !formData.phoneNumber) {
      setError('모든 필드를 입력해주세요.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }

    if (formData.password.length < 8) {
      setError('비밀번호는 8자 이상이어야 합니다.');
      return false;
    }

    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('핸드폰번호는 010-0000-0000 형식으로 입력해주세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      onSuccess?.();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error && 'response' in err &&
        typeof err.response === 'object' && err.response !== null &&
        'data' in err.response && typeof err.response.data === 'object' &&
        err.response.data !== null && 'message' in err.response.data &&
        typeof err.response.data.message === 'string'
        ? err.response.data.message
        : '회원가입에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md px-12 py-8">
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
          <span className="text-blue-600 font-semibold">반려동물</span>과 함께할<br />계정을 만들어보세요
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <FaUser />
            </div>
            <input
              type="text"
              id="id"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border-0 border-b border-gray-300 bg-transparent focus:outline-none"
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
              className="w-full pl-10 pr-10 py-2 border-0 border-b border-gray-300 bg-transparent focus:outline-none"
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

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <FaLock />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full pl-10 pr-10 py-2 border-0 border-b border-gray-300 bg-transparent focus:outline-none"
              placeholder="비밀번호를 다시 입력하세요"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <FaUser />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border-0 border-b border-gray-300 bg-transparent focus:outline-none"
              placeholder="이름을 입력하세요"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <FaPhone />
            </div>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full pl-10 pr-3 py-2 border-0 border-b border-gray-300 bg-transparent focus:outline-none"
              placeholder="핸드폰 번호를 입력하세요"
              disabled={isLoading}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 disabled:bg-green-300 text-white font-medium py-2 px-4 rounded-md transition duration-200"
        >
          {isLoading ? '회원가입 중...' : '회원가입'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            로그인
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;