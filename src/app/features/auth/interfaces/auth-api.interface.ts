export type UserRole = 'user' | 'admin';

export interface AuthState {
  user: AuthUserDto | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthUserDto {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: AuthUserDto;
  token: string;
}


export interface ApiErrorResponse {
  status?: number;
  message?: string;
  errors?: Record<string, unknown> | string[];
}

export interface BackendLoginResponse {
  data: AuthUserDto;
  token: string;
}

// Backend can return either nested or flattened auth payloads.
//export type BackendLoginResponse = LoginResponse | (AuthUserDto & { token: string });