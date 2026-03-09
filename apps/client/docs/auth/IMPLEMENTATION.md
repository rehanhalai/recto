# Client-Side Authentication Implementation

Complete, production-ready authentication system for Recto client with Zustand state management.

## Features Implemented

### ✅ Core Authentication

- **Email/Password Login** - With access token & refresh token management
- **Email/Password Signup** - Two-step process with OTP verification
- **Token Management** - Dual token approach (localStorage + cookies)
- **Auto Token Refresh** - Automatic refresh on expiration
- **Logout** - Clear all tokens and auth state

### ✅ Advanced Features

- **Password Reset** - Three-step OTP-based password reset
- **Change Password** - For authenticated users
- **Protected Routes** - AuthGuard & GuestGuard components
- **OAuth Google** - Social login integration
- **User Profile** - View and update user information
- **Username Availability Check** - Real-time validation

### ✅ Error Handling & UX

- **Toast Notifications** - Industry-standard error/success feedback (Sonner)
- **Form Validation** - Client-side validation
- **Loading States** - Visual feedback during async operations
- **Error Recovery** - Graceful handling of auth failures
- **Auto-logout** - On token expiration (401 responses)

## Architecture

### State Management (Zustand)

```
useAuthStore
├── State
│   ├── user: User | null
│   ├── accessToken: string | null
│   ├── isAuthenticated: boolean
│   ├── isLoading: boolean
│   └── error: string | null
├── Actions
│   ├── login()
│   ├── signup()
│   ├── verifyOTP()
│   ├── logout()
│   ├── refreshToken()
│   └── getCurrentUser()
└── Persistence
    └── localStorage (auto-persist user & auth state)
```

### Token Strategy

- **Access Token**: Stored in localStorage, sent in Authorization header
- **Refresh Token**: Stored in httpOnly cookie (from server) + localStorage backup
- **Auto-Refresh**: Triggered when access token expires
- **Cookie Support**: Built-in credentials for cookie-based auth

### API Client Integration

```typescript
// Automatic JWT injection
apiClient.post("/endpoint", data);
// Includes: Authorization: Bearer <accessToken>

// Cookie support for refresh tokens
apiClient.post("/refresh", {}, { credentials: "include" });
```

## File Structure

```
src/features/auth/
├── types/
│   └── index.ts                    # All TS interfaces
├── store/
│   └── auth-store.ts              # Zustand store with persist
├── services/
│   └── auth-api.ts                # API calls
├── hooks/
│   ├── use-auth.ts                # Main auth hook
│   ├── use-user.ts                # User profile operations
│   └── use-password-reset.ts      # Password reset flow
├── components/
│   ├── auth-guard.tsx             # Protected routes
│   ├── login-form.tsx             # Login UI
│   ├── signup-form.tsx            # Signup UI (multi-step)
│   └── forgot-password-form.tsx   # Password reset UI
├── index.ts                        # Central exports
└── services/
    └── auth-api.ts               # All API endpoints

Additional:
├── lib/
│   ├── api-client.ts             # HTTP client
│   └── toast.ts                  # Toast notifications
└── components/providers/
    └── toaster-provider.tsx      # Toast UI
```

## Usage Examples

### 1. Login

```typescript
"use client";
import { useAuth } from "@/features/auth";

export function LoginPage() {
  const { login, isLoading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email: "user@example.com", password: "password" });
      // Redirect happens automatically
    } catch (error) {
      // Error is shown in toast
    }
  };

  return (
    <button onClick={handleLogin} disabled={isLoading}>
      {isLoading ? "Signing in..." : "Login"}
    </button>
  );
}
```

### 2. Signup with OTP

```typescript
"use client";
import { useAuth } from "@/features/auth";

export function SignupPage() {
  const { signup, verifyOTP, isLoading } = useAuth();

  // Step 1: Send OTP
  const handleSignup = async () => {
    await signup({
      email: "user@example.com",
      fullName: "John Doe",
      password: "securepass123"
    });
    // UI automatically moves to OTP verification step
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    await verifyOTP({
      email: "user@example.com",
      otp: "123456"
    });
    // User is ready to login
  };

  return (/* ... */);
}
```

### 3. Protected Route

```typescript
import { AuthGuard } from "@/features/auth";

export default function Dashboard() {
  return (
    <AuthGuard>
      <main>Protected Dashboard Content</main>
    </AuthGuard>
  );
}
```

### 4. Guest Route (Only for unauthenticated)

```typescript
import { GuestGuard } from "@/features/auth";

export default function LoginPage() {
  return (
    <GuestGuard redirectTo="/dashboard">
      <LoginForm />
    </GuestGuard>
  );
}
```

### 5. Password Reset

```typescript
"use client";
import { usePasswordReset } from "@/features/auth";

export function ForgotPasswordPage() {
  const {
    step,
    email,
    requestPasswordReset,
    verifyResetOTP,
    setNewPassword,
    isLoading,
    error
  } = usePasswordReset();

  // Step 1: Request
  if (step === "request") {
    return (
      <button onClick={() => requestPasswordReset("user@email.com")}>
        Send Code
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

  // Step 3: New Password
  if (step === "reset") {
    return (
      <button onClick={() => setNewPassword("newpassword123")}>
        Reset Password
      </button>
    );
  }

  return null;
}
```

### 6. Update Profile

```typescript
"use client";
import { useUser } from "@/features/auth";

export function ProfilePage() {
  const { user, updateProfile, isUpdating } = useUser();

  const handleUpdate = async () => {
    await updateProfile({
      fullName: "John Updated",
      bio: "New bio",
      userName: "johndoe"
    });
  };

  return (
    <div>
      <p>Current User: {user?.fullName}</p>
      <button onClick={handleUpdate} disabled={isUpdating}>
        Update Profile
      </button>
    </div>
  );
}
```

### 7. Access Current User

```typescript
"use client";
import { useAuthStore } from "@/features/auth";

export function UserInfo() {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  if (!isAuthenticated) return <p>Not logged in</p>;

  return (
    <div>
      <p>Name: {user?.fullName}</p>
      <p>Email: {user?.email}</p>
      <p>Username: {user?.userName}</p>
    </div>
  );
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd client
npm install
# or
yarn install
```

### 2. Update Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Add ToasterProvider to Root Layout

```typescript
// app/layout.tsx
import { ToasterProvider } from "@/components/providers/toaster-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
```

### 4. Create Auth Pages

```typescript
// app/login/page.tsx
import { GuestGuard, LoginForm } from "@/features/auth";

export default function LoginPage() {
  return (
    <GuestGuard>
      <LoginForm />
    </GuestGuard>
  );
}

// app/signup/page.tsx
import { GuestGuard, SignupForm } from "@/features/auth";

export default function SignupPage() {
  return (
    <GuestGuard>
      <SignupForm />
    </GuestGuard>
  );
}

// app/forgot-password/page.tsx
import { GuestGuard, ForgotPasswordForm } from "@/features/auth";

export default function ForgotPasswordPage() {
  return (
    <GuestGuard>
      <ForgotPasswordForm />
    </GuestGuard>
  );
}
```

## API Endpoints Used

| Method | Endpoint | Purpose |\n|--------|----------|----------|\n| POST | `/user/signup` | Send OTP |\n| POST | `/user/signup-verify` | Verify OTP & create user |\n| POST | `/user/signin` | Login |\n| POST | `/user/refresh-accesstoken` | Refresh token |\n| POST | `/user/logout` | Logout |\n| GET | `/user/whoami` | Get current user |\n| POST | `/user/password-otp` | Request password reset |\n| POST | `/user/password-otp-verify` | Verify password reset OTP |\n| POST | `/user/new-password` | Set new password |\n| POST | `/user/change-password` | Change password (authenticated) |\n| PATCH | `/user/update-profile` | Update user profile |\n| GET | `/user/check?userName=...` | Check username availability |\n| GET | `/user/google` | OAuth redirect |\n| GET | `/user/google/callback` | OAuth callback |\n\n## Token Flow Diagram\n\n`\nLOGIN REQUEST\n     |\n     v\n  [API Call]\n     |\n     v\n[Success] --> Set accessToken (localStorage)\n  |\n  v\n[Store User Data] (Zustand + localStorage)\n  |\n  v\n[User Logged In]\n\n\nREQUEST WITH TOKEN\n     |\n     v\n[Build Headers]\n     |\n     v\n[Get accessToken from localStorage]\n     |\n     v\n[Add: Authorization: Bearer <token>]\n     |\n     v\n[Send Request]\n\n\nTOKEN EXPIRED (401 Response)\n     |\n     v\n[Refresh Request] --> Include refreshToken from cookie\n     |\n     v\n[Get New Tokens]\n     |\n     v\n[Update localStorage]\n     |\n     v\n[Retry Original Request]\n`

## Error Handling Strategy

`typescript\n// Automatic error display\nconst { error } = useAuth();\n// Errors automatically show as toasts\n\n// Manual error handling\ntry {\n  await login(credentials);\n} catch (error) {\n  // Error already shown in toast\n  // Additional handling if needed\n}\n\n// 401 Auto-logout\nwindow.addEventListener('auth:unauthorized', () => {\n  // User automatically logged out\n  // State cleared\n  // Redirect to login\n});\n`\n\n## Best Practices\n\n1. **Always use hooks** - Never directly call API services\n2. **Let store handle state** - Don't manage auth state locally\n3. **Use AuthGuard** - For protected routes\n4. **Handle errors** - Toast notifications are automatic\n5. **Initialize auth** - Call `initializeAuth()` on app load\n6. **Secure tokens** - Access token in localStorage, refresh in httpOnly cookie\n7. **Auto-redirect** - Forms redirect after success\n8. **Check isLoading** - Disable buttons during requests\n\n## Future Enhancements\n\n- [ ] Two-factor authentication (2FA)\n- [ ] Session management UI\n- [ ] OAuth providers (GitHub, Microsoft)\n- [ ] Biometric authentication\n- [ ] Device trust/recognition\n- [ ] Login activity logs\n- [ ] Account recovery options\n- [ ] Email verification\n
