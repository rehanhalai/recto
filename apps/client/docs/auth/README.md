# Authentication Documentation

Complete authentication system for Recto client using Zustand and TypeScript.

## Quick Start

### 1. Install Dependencies

```bash
cd client
npm install zustand sonner
```

### 2. Configure Environment

Create `client/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Add ToasterProvider to Layout

```typescript
// client/src/app/layout.tsx
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
```

### 4. Create Auth Pages

```typescript
// client/src/app/login/page.tsx
import { GuestGuard, LoginForm } from "@/features/auth";

export default function LoginPage() {
  return (
    <GuestGuard>
      <LoginForm />
    </GuestGuard>
  );
}
```

### 5. Protect Routes

```typescript
// client/src/app/dashboard/page.tsx
import { AuthGuard } from "@/features/auth";

export default function Dashboard() {
  return (
    <AuthGuard>
      <h1>Protected Dashboard</h1>
    </AuthGuard>
  );
}
```

## Features

- **Login/Signup** - Email/password with OTP verification
- **Token Management** - Auto-refresh, dual storage (access + refresh)
- **User Management** - Profile update, password change, username check
- **Route Protection** - AuthGuard & GuestGuard components
- **Password Reset** - 3-step OTP-based flow
- **Error Handling** - Toast notifications & graceful recovery
- **Security** - JWT tokens, httpOnly cookies, CSRF protection

## Documentation Files

1. **IMPLEMENTATION.md** - Comprehensive guide with all details
2. **QUICK_REFERENCE.md** - Code examples and patterns
3. **ARCHITECTURE.md** - System design and diagrams

## Key Hooks

```typescript
import { useAuth, useUser, usePasswordReset } from "@/features/auth";

// Main auth
const { login, logout, user, isAuthenticated } = useAuth();

// User operations
const { updateProfile, changePassword } = useUser();

// Password reset
const { requestPasswordReset, verifyResetOTP, setNewPassword } =
  usePasswordReset();
```

## Components

- `<LoginForm />` - Pre-built login UI
- `<SignupForm />` - Multi-step signup with OTP
- `<ForgotPasswordForm />` - Password reset UI
- `<AuthGuard>` - Protect routes (require auth)
- `<GuestGuard>` - Guest-only routes

## API Endpoints

All endpoints use base: `/api/v1/user`

| Method | Endpoint               | Purpose                  |
| ------ | ---------------------- | ------------------------ |
| POST   | `/signup`              | Send OTP                 |
| POST   | `/signup-verify`       | Verify OTP & create user |
| POST   | `/signin`              | Login                    |
| POST   | `/logout`              | Logout                   |
| POST   | `/refresh-accesstoken` | Refresh token            |
| GET    | `/whoami`              | Get current user         |
| POST   | `/password-otp`        | Request password reset   |
| POST   | `/password-otp-verify` | Verify reset OTP         |
| POST   | `/new-password`        | Set new password         |
| POST   | `/change-password`     | Change password          |
| PATCH  | `/update-profile`      | Update profile           |
| GET    | `/check?userName=...`  | Check username           |

## File Structure

```
client/src/features/auth/
├── types/index.ts              # TypeScript interfaces
├── store/auth-store.ts         # Zustand store
├── services/auth-api.ts        # API calls
├── hooks/
│   ├── use-auth.ts            # Main auth hook
│   ├── use-user.ts            # User operations
│   └── use-password-reset.ts  # Password reset
├── components/
│   ├── auth-guard.tsx         # Route protection
│   ├── login-form.tsx         # Login UI
│   ├── signup-form.tsx        # Signup UI
│   └── forgot-password-form   # Password reset UI
└── index.ts                    # Exports

client/src/lib/
├── api-client.ts              # HTTP client
└── toast.ts                   # Toast utils

client/src/components/providers/
└── toaster-provider.tsx       # Toast UI
```

## Examples

### Login

```typescript
const { login, isLoading } = useAuth();

const handleLogin = async (email, password) => {
  try {
    await login({ email, password });
    router.push("/dashboard");
  } catch (error) {
    // Error shown in toast
  }
};
```

### Signup with OTP

```typescript
const { signup, verifyOTP } = useAuth();

// Step 1
await signup({ email, fullName, password });

// Step 2
await verifyOTP({ email, otp });
```

### Update Profile

```typescript
const { updateProfile } = useUser();

await updateProfile({
  fullName: "New Name",
  bio: "New bio",
  userName: "newusername",
});
```

### Password Reset

```typescript
const { requestPasswordReset, verifyResetOTP, setNewPassword } =
  usePasswordReset();

// Step 1
await requestPasswordReset("user@email.com");

// Step 2
await verifyResetOTP("123456");

// Step 3
await setNewPassword("newpassword");
```

### Protected Route

```typescript
import { AuthGuard } from "@/features/auth";

export default function ProtectedPage() {
  return (
    <AuthGuard redirectTo="/login">
      <h1>Only authenticated users see this</h1>
    </AuthGuard>
  );
}
```

## Configuration

- **State**: Zustand (lightweight, persistent)
- **Tokens**: Access (localStorage) + Refresh (httpOnly cookie)
- **Auto-refresh**: On 401 response
- **Persistence**: localStorage (survives page reload)
- **Notifications**: Sonner toast (industry standard)

## Security

- JWT tokens (signed, verified by server)
- httpOnly cookies (CSRF protection)
- Token expiration (short-lived)
- Token rotation (new tokens on refresh)
- Auto-logout (on 401)
- CORS configured (server-side)

## Need Help?

1. Check **IMPLEMENTATION.md** for detailed guide
2. See **QUICK_REFERENCE.md** for code examples
3. Review **ARCHITECTURE.md** for system design
4. Check component file comments
5. Review hook documentation

---

**Status**: Production-ready ✅
**Last Updated**: January 18, 2026
