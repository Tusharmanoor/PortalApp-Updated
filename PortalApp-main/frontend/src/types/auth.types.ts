export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
  role?: string;
}

export interface RegisterResponse {
  id: number;
  name: string;
  email: string;
  Role: string;
}
