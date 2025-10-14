export interface User {
  accountId: number;
  username: string;
  role: string;
  name?: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  userId: number;
  username: string;
  role: string;
  expiresIn: string; // Duration from backend will be converted to string
}

export interface RegisterRequest {
  id: string;
  password: string;
  email: string;
  name: string;
  phoneNumber: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}