export interface User {
  id: string;
  email: string;
  name: string;
  avatar_uri: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  id_token: string;
}