import { apiInstance } from "@/lib/api";
import { config } from "@/config";
import {
  LoginCredentials,
  SignupCredentials,
  OTPVerification,
  AuthResponse,
  SignupOTPResponse,
  SignupVerifyResponse,
  ApiResponse,
  User,
  ProfileUpdate,
  ForgotPasswordRequest,
  PasswordResetOTPVerification,
  NewPasswordRequest,
  ChangePasswordRequest,
} from "../types";

/* Sign Up with OTP Flow */

export const signupRequest = async (
  credentials: SignupCredentials,
): Promise<SignupOTPResponse> => {
  return apiInstance.post<SignupOTPResponse>("/auth/signup", credentials);
};

export const verifySignupOTP = async (
  verification: OTPVerification,
): Promise<ApiResponse<SignupVerifyResponse>> => {
  return apiInstance.post<ApiResponse<SignupVerifyResponse>>(
    "/auth/signup-verify",
    verification,
  );
};

/* Sign In */

export const loginRequest = async (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  return apiInstance.post<AuthResponse>("/auth/signin", credentials);
};

/* Token Management */

export const refreshAccessToken = async (): Promise<AuthResponse> => {
  return apiInstance.post<AuthResponse>("/user/refresh-accesstoken");
};

/* Logout */

export const logoutRequest = async (): Promise<void> => {
  try {
    await apiInstance.post<ApiResponse<{}>>("/auth/logout");
  } catch (error) {
    console.error("Logout request failed:", error);
  }
};

export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  return apiInstance.get<ApiResponse<User>>("/user/whoami");
};

/* Google OAuth */

export const getGoogleAuthUrl = (): string => {
  return `${config.apiUrl}/auth/google`;
};

export const handleGoogleCallback = async (): Promise<
  Partial<AuthResponse>
> => {
  const userResponse = await getCurrentUser();

  return {
    success: true,
    statusCode: 200,
    message: "Google authentication successful",
    data: {
      user: userResponse.data,
    },
  };
};

/* Password Reset Flow */

export const forgotPasswordRequest = async (
  data: ForgotPasswordRequest,
): Promise<ApiResponse<{}>> => {
  return apiInstance.post<ApiResponse<{}>>("/auth/forgot-password", data);
};

export const verifyPasswordResetOTP = async (
  data: PasswordResetOTPVerification,
): Promise<ApiResponse<{ resetToken: string }>> => {
  return apiInstance.post<ApiResponse<{ resetToken: string }>>(
    "/auth/password-otp-verify",
    data,
  );
};

export const setNewPassword = async (
  data: NewPasswordRequest,
): Promise<ApiResponse<{}>> => {
  return apiInstance.post<ApiResponse<{}>>("/auth/reset-password", data);
};

/* User Profile Management */

export const changePassword = async (
  data: ChangePasswordRequest,
): Promise<ApiResponse<{}>> => {
  return apiInstance.post<ApiResponse<{}>>("/auth/change-password", data);
};

export const updateProfile = async (
  data: ProfileUpdate,
): Promise<ApiResponse<User>> => {
  return apiInstance.patch<ApiResponse<User>>("/user/update-profile", data);
};

export const updateProfileImage = async (
  payload?:
    | File
    | {
        avatarFile?: File | null;
        coverFile?: File | null;
        removeAvatar?: boolean;
        removeCover?: boolean;
      },
): Promise<ApiResponse<User>> => {
  const formData = new FormData();

  if (payload instanceof File) {
    formData.append("avatarImage", payload);
  } else if (payload) {
    if (payload.avatarFile) {
      formData.append("avatarImage", payload.avatarFile);
    }

    if (payload.coverFile) {
      formData.append("coverImage", payload.coverFile);
    }

    if (payload.removeAvatar) {
      formData.append("avatarImage", "remove");
    }

    if (payload.removeCover) {
      formData.append("coverImage", "remove");
    }
  }

  return apiInstance.patch<ApiResponse<User>>(
    "/user/update-profileimage",
    formData,
  );
};

export const checkUsernameAvailability = async (
  userName: string,
): Promise<ApiResponse<{ isAvailable: boolean }>> => {
  return apiInstance.get<ApiResponse<{ isAvailable: boolean }>>(
    `/user/check?userName=${encodeURIComponent(userName)}`,
  );
};

export const isAuthenticated = (): boolean => {
  return true;
};
