// Modelos de autenticación para JWT

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  idRol?: number;
  fotoUrl?: string;
  fotoNombre?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface UserInfo {
  id: number;
  nombre: string;
  email: string;
  fotoUrl: string | null;
  tipoDocumento?: string;
  numeroDocumento?: string;
  telefono?: string;
  rol: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

export interface FileInfo {
  storedFileName: string;
  originalFileName: string;
  fileUrl: string;
}
