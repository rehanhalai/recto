/**
 * Minimal frontend auth user shape.
 * Keep this intentionally small because it is persisted to localStorage.
 */
export interface User {
  id: string;
  userName: string;
  fullName: string | null;
  email: string;
  avatarImage?: string | null;
  coverImage?: string | null;
  role: "user" | "admin" | "moderator";
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Signup credentials (step 1: send OTP)
 */
export interface SignupCredentials {
  email: string;
  password: string;
}

/**
 * OTP verification
 */
export interface OTPVerification {
  email: string;
  otp: string;
}

/**
 * Signup verification response (includes tokens + user)
 */
export interface SignupVerifyResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

/**
 * Auth response from server
 */
export interface AuthResponse {
  statusCode: number;
  data: {
    user: User;
    accessToken?: string;
    refreshToken?: string;
  };
  message: string;
  success: boolean;
}

/**
 * Signup OTP response
 */
export interface SignupOTPResponse {
  statusCode: number;
  data: {
    message: string;
  };
  message: string;
  success: boolean;
}

/**
 * User profile update
 */
export interface ProfileUpdate {
  fullName?: string;
  bio?: string;
  userName?: string;
}

/**
 * Password reset - forgot password
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Password reset - verify OTP
 */
export interface PasswordResetOTPVerification {
  email: string;
  code: string;
}

/**
 * Password reset - new password
 */
export interface NewPasswordRequest {
  resetToken: string;
  password: string;
}

/**
 * Change password (authenticated)
 */
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * Generic API response
 */
export interface ApiResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

/**
 * Auth state for Zustand store
 */
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  verifyOTP: (verification: OTPVerification) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  reset: () => void;
}
