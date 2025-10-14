import React, {createContext, useContext, useReducer, useEffect, type ReactNode, useState} from 'react';
import type { AuthState, LoginRequest, RegisterRequest } from '../types/auth';
import { authService } from '../services/authService';

interface AuthAction {
  type: 'LOGIN_START' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'RESTORE_AUTH' | 'REGISTER_START' | 'REGISTER_SUCCESS' | 'REGISTER_FAILURE';
  payload?: unknown;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return { ...state, isLoading: true };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    
    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };

    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
      };
    
    case 'LOGOUT':
      return initialState;
    
    case 'RESTORE_AUTH':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  login: (data: LoginRequest, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  kakaoLogin: (accessToken: string) => Promise<void>;
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    // localStorage 또는 sessionStorage에서 토큰 확인
    let token = localStorage.getItem('token') || localStorage.getItem('userToken');
    let userStr = localStorage.getItem('user');

    if (!token) {
      token = sessionStorage.getItem('token') || sessionStorage.getItem('userToken');
      userStr = sessionStorage.getItem('user');
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        dispatch({
          type: 'RESTORE_AUTH',
          payload: { user, token }
        });
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('userToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (data: LoginRequest, rememberMe: boolean = false) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await authService.login(data);

      const user = {
        accountId: response.userId,
        username: response.username,
        role: response.role,
      };

      // rememberMe에 따라 localStorage 또는 sessionStorage 사용
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', response.accessToken);
      storage.setItem('userToken', response.accessToken); // SNS용 userToken도 저장
      storage.setItem('accessToken', response.accessToken); // 하위 호환성
      storage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: response.accessToken }
      });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      dispatch({ type: 'REGISTER_START' });
      await authService.register(data);
      dispatch({ type: 'REGISTER_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'REGISTER_FAILURE' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Logout error handled silently
    } finally {
      // 양쪽 스토리지 모두 정리
      localStorage.removeItem('token');
      localStorage.removeItem('userToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const kakaoLogin = async (accessToken: string, rememberMe: boolean = true) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await authService.kakaoLogin(accessToken);

      const user = {
        accountId: response.userId,
        username: response.username,
        role: response.role,
      };

      // rememberMe에 따라 localStorage 또는 sessionStorage 사용 (카카오는 기본 true)
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', response.accessToken);
      storage.setItem('userToken', response.accessToken); // SNS용 userToken도 저장
      storage.setItem('accessToken', response.accessToken); // 하위 호환성
      storage.setItem('user', JSON.stringify(user));

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token: response.accessToken }
      });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    kakaoLogin,
    showLogoutModal,
    setShowLogoutModal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};