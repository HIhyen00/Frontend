import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import {FaEye, FaEyeSlash, FaUser, FaLock, FaPhone, FaEnvelope, FaCheck, FaTimes, FaPaw} from "react-icons/fa";

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
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 비밀번호 강도 계산
  const passwordStrength = useMemo(() => {
    const password = formData.password;
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { score, label: '약함', color: 'bg-red-500' };
    if (score <= 3) return { score, label: '보통', color: 'bg-yellow-500' };
    if (score <= 4) return { score, label: '강함', color: 'bg-green-500' };
    return { score, label: '매우 강함', color: 'bg-blue-500' };
  }, [formData.password]);

  // 전화번호 자동 포맷팅
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, '');

    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // 전화번호는 자동 포맷팅
    let finalValue = value;
    if (name === 'phoneNumber') {
      finalValue = formatPhoneNumber(value);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    setError(null);

    // 실시간 필드 검증
    const newFieldErrors = { ...fieldErrors };
    delete newFieldErrors[name];

    if (name === 'id' && value && value.length < 4) {
      newFieldErrors[name] = '아이디는 4자 이상이어야 합니다';
    }
    if (name === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      newFieldErrors[name] = '올바른 이메일 형식이 아닙니다';
    }
    if (name === 'password' && value && value.length < 8) {
      newFieldErrors[name] = '비밀번호는 8자 이상이어야 합니다';
    }
    if (name === 'confirmPassword' && value && value !== formData.password) {
      newFieldErrors[name] = '비밀번호가 일치하지 않습니다';
    }
    if (name === 'phoneNumber' && finalValue && !/^010-\d{4}-\d{4}$/.test(finalValue)) {
      newFieldErrors[name] = '올바른 전화번호를 입력해주세요';
    }

    setFieldErrors(newFieldErrors);
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
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    if (Object.keys(fieldErrors).length > 0) {
      setError('입력 정보를 다시 확인해주세요.');
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      setSuccess('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다...');
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err: any) {
      // koreanMessage가 이미 인터셉터에서 추가됨
      const errorMessage = err?.koreanMessage || err?.response?.data?.message || '회원가입에 실패했습니다.';
      setError(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 px-12 py-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-6 cursor-pointer" onClick={() => navigate('/')}>
          <FaPaw className="text-3xl text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">MyRealPet</h1>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          회원가입
        </h2>
        <p className="text-gray-600">
          반려동물과 함께할 계정을 만들어보세요
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
              id="id"
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              className={`w-full pl-11 pr-11 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                fieldErrors.id ? 'border-red-300 bg-red-50' : formData.id && !fieldErrors.id ? 'border-green-300 bg-green-50' : 'border-gray-200'
              }`}
              placeholder="아이디를 입력하세요 (4자 이상)"
              disabled={isLoading}
            />
            {formData.id && !fieldErrors.id && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500">
                <FaCheck className="text-sm" />
              </div>
            )}
          </div>
          {fieldErrors.id && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <FaTimes className="text-xs" />
              {fieldErrors.id}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">이메일 (선택)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <FaEnvelope />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full pl-11 pr-11 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                fieldErrors.email ? 'border-red-300 bg-red-50' : formData.email && !fieldErrors.email ? 'border-green-300 bg-green-50' : 'border-gray-200'
              }`}
              placeholder="이메일을 입력하세요"
              disabled={isLoading}
            />
            {formData.email && !fieldErrors.email && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500">
                <FaCheck className="text-sm" />
              </div>
            )}
          </div>
          {fieldErrors.email && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <FaTimes className="text-xs" />
              {fieldErrors.email}
            </p>
          )}
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
              className={`w-full pl-11 pr-11 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
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
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <FaTimes className="text-xs" />
              {fieldErrors.password}
            </p>
          )}
          {formData.password && !fieldErrors.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">비밀번호 강도:</span>
                <span className={`text-xs font-semibold ${
                  passwordStrength.score <= 2 ? 'text-red-600' :
                  passwordStrength.score <= 3 ? 'text-yellow-600' :
                  passwordStrength.score <= 4 ? 'text-green-600' : 'text-blue-600'
                }`}>{passwordStrength.label}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">비밀번호 확인</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <FaLock />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">이름</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <FaUser />
            </div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="이름을 입력하세요"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">핸드폰 번호</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <FaPhone />
            </div>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className={`w-full pl-11 pr-11 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                fieldErrors.phoneNumber ? 'border-red-300 bg-red-50' : formData.phoneNumber && !fieldErrors.phoneNumber ? 'border-green-300 bg-green-50' : 'border-gray-200'
              }`}
              placeholder="핸드폰 번호를 입력하세요"
              disabled={isLoading}
              maxLength={13}
            />
            {formData.phoneNumber && !fieldErrors.phoneNumber && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-green-500">
                <FaCheck className="text-sm" />
              </div>
            )}
          </div>
          {fieldErrors.phoneNumber && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <FaTimes className="text-xs" />
              {fieldErrors.phoneNumber}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center gap-2">
            <FaTimes />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm flex items-center gap-2">
            <FaCheck />
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={
            isLoading ||
            !!success ||
            Object.keys(fieldErrors).length > 0 ||
            !formData.id ||
            !formData.password ||
            !formData.confirmPassword ||
            !formData.name ||
            !formData.phoneNumber
          }
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-95"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          )}
          {success && <FaCheck />}
          {isLoading ? '회원가입 중...' : success ? '회원가입 완료!' : '회원가입'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            로그인
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;