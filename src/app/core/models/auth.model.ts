export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'MERCHANT' | 'ADMIN';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  acceptTerms?: boolean;
}

export interface RegisterResponse {
  message: string;
  userId: string;
  requiresPhoneVerification?: boolean;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

export interface SendPhoneOtpRequest {
  phone: string;
}

export interface SendPhoneOtpResponse {
  message: string;
  cooldownSeconds?: number;
}

export interface VerifyPhoneOtpRequest {
  phone: string;
  otp: string;
}

export interface VerifyPhoneOtpResponse {
  message: string;
  verified: boolean;
  user?: PublicUser;
}
