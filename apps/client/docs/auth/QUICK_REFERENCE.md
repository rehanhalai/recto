/**
 * Quick Reference - Authentication in Recto Client
 * 
 * This file serves as a quick lookup for common auth tasks
 */

// ============================================
// IMPORT EVERYTHING YOU NEED
// ============================================

import {
  useAuth,                    // Main auth hook
  useUser,                    // User operations
  usePasswordReset,           // Password reset flow
  AuthGuard,                  // Protect routes
  GuestGuard,                 // Guest-only routes
  LoginForm,                  // Pre-built login UI
  SignupForm,                 // Pre-built signup UI
  ForgotPasswordForm,         // Pre-built password reset UI
  useAuthStore,               // Direct store access
  selectUser,                 // Store selector
  selectIsAuthenticated,      // Store selector
} from "@/features/auth";

// ============================================
// 1. LOGIN - THE SIMPLEST WAY
// ============================================

// Option A: Use the pre-built form component
import { LoginForm } from "@/features/auth";
export default function LoginPage() {
  return <LoginForm />;
}

// Option B: Use the hook in your own form
import { useAuth } from "@/features/auth";

function MyLoginForm() {
  const { login, isLoading, error } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    try {
      await login({ email, password });
      // Done! User is logged in
    } catch (error) {
      // Error is shown in toast automatically
    }
  };
  
  return (/* your form */);
}

// ============================================
// 2. SIGNUP - TWO-STEP PROCESS
// ============================================

// Option A: Use the pre-built form
import { SignupForm } from "@/features/auth";
export default function SignupPage() {
  return <SignupForm />;
}

// Option B: Use the hook manually
import { useAuth } from "@/features/auth";

function MySignupForm() {
  const { signup, verifyOTP, isLoading } = useAuth();
  
  // Step 1: Send credentials to signup
  const handleSignup = async (email: string, fullName: string, password: string) => {
    await signup({ email, fullName, password });
    // UI moves to OTP verification
  };
  
  // Step 2: Verify OTP
  const handleVerifyOTP = async (otp: string) => {
    await verifyOTP({ email, otp });
    // Done! Now user can login
  };
  
  return (/* ... */);
}

// ============================================
// 3. PROTECT ROUTES - REQUIRE AUTHENTICATION
// ============================================

import { AuthGuard } from "@/features/auth";

export default function Dashboard() {
  return (
    <AuthGuard>
      <h1>Protected Dashboard</h1>
    </AuthGuard>
  );
}

// With custom redirect
export default function ProfilePage() {
  return (
    <AuthGuard redirectTo="/login">
      <h1>Your Profile</h1>
    </AuthGuard>
  );
}

// ============================================
// 4. GUEST ROUTES - NO LOGIN ALLOWED
// ============================================

import { GuestGuard } from "@/features/auth";

export default function LoginPage() {
  return (
    <GuestGuard redirectTo="/dashboard">
      <LoginForm />
    </GuestGuard>
  );
}

// ============================================
// 5. ACCESS CURRENT USER
// ============================================

import { useAuthStore } from "@/features/auth";

function UserProfile() {
  // Get user data
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  if (!isAuthenticated) return <p>Please login</p>;
  
  return (
    <div>
      <h1>{user?.fullName}</h1>
      <p>{user?.email}</p>
      <p>@{user?.userName}</p>
    </div>
  );
}

// ============================================
// 6. LOGOUT
// ============================================

import { useAuth } from "@/features/auth";

function LogoutButton() {
  const { logout, isLoading } = useAuth();
  
  return (
    <button onClick={logout} disabled={isLoading}>
      Logout
    </button>
  );
}

// ============================================
// 7. PASSWORD RESET - THREE STEPS
// ============================================

// Option A: Use pre-built form
import { ForgotPasswordForm } from "@/features/auth";

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

// Option B: Use the hook manually
import { usePasswordReset } from "@/features/auth";

function MyPasswordResetForm() {
  const {
    step,
    email,
    requestPasswordReset,
    verifyResetOTP,
    setNewPassword,
    isLoading,
  } = usePasswordReset();
  
  // Step 1: Request reset code
  if (step === "request") {
    return (
      <button onClick={() => requestPasswordReset("user@email.com")}>
        Send Reset Code
      </button>
    );
  }
  
  // Step 2: Verify OTP
  if (step === "verify") {
    return (
      <button onClick={() => verifyResetOTP("123456")}>
        Verify Code
      </button>
    );
  }
  
  // Step 3: Set new password
  if (step === "reset") {
    return (
      <button onClick={() => setNewPassword("newpassword123")}>
        Reset Password
      </button>
    );
  }
  
  // Step 4: Success
  if (step === "complete") {
    return <p>Password reset successfully!</p>;
  }
}

// ============================================
// 8. UPDATE USER PROFILE
// ============================================

import { useUser } from "@/features/auth";

function EditProfile() {
  const { user, updateProfile, isUpdating, error } = useUser();
  
  const handleUpdate = async () => {
    try {
      await updateProfile({
        fullName: "New Name",
        bio: "New bio",
        userName: "newusername",
      });
      // Done! User data updated
    } catch (error) {
      // Error shown in toast
    }
  };
  
  return (
    <div>
      <p>Current: {user?.fullName}</p>
      <button onClick={handleUpdate} disabled={isUpdating}>
        Update
      </button>
    </div>
  );
}

// ============================================
// 9. CHANGE PASSWORD (FOR LOGGED-IN USERS)
// ============================================

import { useUser } from "@/features/auth";

function ChangePasswordForm() {
  const { changePassword, isUpdating } = useUser();
  
  const handleChangePassword = async () => {
    try {
      await changePassword("oldPassword123", "newPassword456");
      // Success! Shown in toast
    } catch (error) {
      // Error shown in toast
    }
  };
  
  return (
    <button onClick={handleChangePassword} disabled={isUpdating}>
      Change Password
    </button>
  );
}

// ============================================
// 10. CHECK USERNAME AVAILABILITY
// ============================================

import { useUser } from "@/features/auth";

function UsernameInput() {
  const { checkUsernameAvailability } = useUser();
  const [available, setAvailable] = useState<boolean | null>(null);
  
  const handleCheck = async (userName: string) => {
    const isAvailable = await checkUsernameAvailability(userName);
    setAvailable(isAvailable);
  };
  
  return (
    <div>
      <input onChange={(e) => handleCheck(e.target.value)} />
      {available === true && <p>✓ Available</p>}
      {available === false && <p>✗ Taken</p>}
    </div>
  );
}

// ============================================
// 11. GOOGLE OAUTH LOGIN
// ============================================

import { config } from "@/config";

function OAuthButton() {
  return (
    <a href={config.google.authUrl}>
      Continue with Google
    </a>
  );
}

// ============================================
// 12. HANDLE ERRORS WITH TOASTS
// ============================================

import { useAuth } from "@/features/auth";
import { showToast } from "@/lib/toast";

function LoginForm() {
  const { login, error, clearError } = useAuth();
  
  const handleLogin = async () => {
    clearError();
    try {
      await login({ email: "...", password: "..." });
    } catch (error) {
      // Error automatically shown as toast
      // But you can also access it:
      if (error) {
        console.log(error);
      }
    }
  };
  
  return (/* ... */);
}

// Manual toast notifications
import { showToast } from "@/lib/toast";

showToast.success("Login successful!");
showToast.error("Something went wrong");
showToast.info("Please wait...");
showToast.warning("This is important");

// ============================================
// 13. INITIALIZE AUTH ON APP LOAD
// ============================================

// Usually done in a root layout or app component

"use client";

import { useAuth } from "@/features/auth";
import { useEffect } from "react";

function RootLayout({ children }) {
  const { initializeAuth } = useAuth();
  
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);
  
  return <>{children}</>;
}

// ============================================
// 14. COMMON PATTERNS
// ============================================

// Pattern 1: Conditional rendering based on auth
import { useAuthStore } from "@/features/auth";

function Header() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  return (
    <header>
      {isAuthenticated ? (
        <button>Logout</button>
      ) : (
        <button>Login</button>
      )}
    </header>
  );
}

// Pattern 2: Loading state while checking auth
import { useAuth } from "@/features/auth";

function App() {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return <div>App content</div>;
}

// Pattern 3: Redirect after login
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";

function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const handleLogin = async (credentials) => {
    await login(credentials);
    router.push("/dashboard"); // Redirect
  };
  
  return (/* ... */);
}

// ============================================
// 15. ENVIRONMENT SETUP
// ============================================

// .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

// Layout with ToasterProvider
import { ToasterProvider } from "@/components/providers/toaster-provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}

// ============================================
// STATE STRUCTURE (What's stored)
// ============================================

/*
useAuthStore state:
{
  user: {
    _id: string
    fullName: string
    email: string
    userName: string
    bio?: string
    avatarImage?: string
    coverImage?: string
    role: "user" | "admin" | "moderator"
    isVerified: boolean
    followersCount: number
    followingCount: number
    postsCount: number
    createdAt: string
    updatedAt: string
  } | null
  
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
*/

// ============================================
// API ENDPOINTS USED
// ============================================

/*
POST   /user/signup                   - Send OTP
POST   /user/signup-verify            - Verify OTP & create user
POST   /user/signin                   - Login
POST   /user/refresh-accesstoken      - Refresh token
POST   /user/logout                   - Logout
GET    /user/whoami                   - Get current user
POST   /user/password-otp             - Request password reset
POST   /user/password-otp-verify      - Verify password reset OTP
POST   /user/new-password             - Set new password
POST   /user/change-password          - Change password (authenticated)
PATCH  /user/update-profile           - Update user profile
GET    /user/check?userName=...       - Check username availability
GET    /user/google                   - OAuth redirect
GET    /user/google/callback          - OAuth callback
*/
