export interface User {
  accountId: number;
  username: string;
  name?: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  id: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  accountId: number;
  username: string;
  expiresInSeconds: number;
  refreshToken?: string;
}

export interface RegisterRequest {
  id: string;
  password: string;
  name: string;
  phoneNumber: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}