# Recto Client - Next.js Frontend

Modern React 19 frontend built with Next.js 16, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# 3. Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Auth pages (login, signup, etc)
│   └── layout.tsx      # Root layout with providers
├── features/           # Feature modules
│   └── auth/          # Authentication system
│       ├── components/ # LoginForm, SignupForm, etc
│       ├── hooks/     # useAuth, useUser, usePasswordReset
│       ├── services/  # auth-api.ts
│       ├── store/     # Zustand auth store
│       └── types/     # TypeScript interfaces
├── components/        # Shared components
│   └── providers/     # Sonner ToasterProvider
├── config/           # App configuration
├── hooks/            # Shared hooks
├── lib/             # Utilities (api-client, toast)
├── store/           # Global state
└── types/           # Global types
```

## 🔐 Authentication System

Complete auth implementation with:

- ✅ Email/password login & signup
- ✅ OTP verification (2-step)
- ✅ Token management (auto-refresh)
- ✅ Route protection (AuthGuard, GuestGuard)
- ✅ Password reset (3-step flow)
- ✅ User profiles

### Quick Integration

```bash
# 1. Add dependencies
npm install zustand sonner

# 2. Add ToasterProvider to src/app/layout.tsx
# Import and wrap root content with ToasterProvider

# 3. Create auth pages
# - src/app/(auth)/login/page.tsx
# - src/app/(auth)/signup/page.tsx
# - src/app/(auth)/forgot-password/page.tsx

# 4. Use authentication
import { useAuth } from "@/features/auth";

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  // ...
}
```

## 📚 Documentation

Detailed documentation in `/docs`:

- **[Auth Quick Start](../docs/auth/README.md)** - Setup & integration
- **[Implementation Guide](../docs/auth/IMPLEMENTATION.md)** - Detailed walkthrough
- **[Code Examples](../docs/auth/QUICK_REFERENCE.md)** - Real-world usage
- **[Architecture](../docs/auth/ARCHITECTURE.md)** - System design

## 🛠 Tech Stack

| Category         | Tool         | Version |
| ---------------- | ------------ | ------- |
| Framework        | Next.js      | 16      |
| Language         | TypeScript   | 5+      |
| Styling          | Tailwind CSS | 3.4+    |
| State            | Zustand      | 4.5.0   |
| UI Notifications | Sonner       | 1.8.0   |
| HTTP Client      | Fetch API    | Native  |

## ⚙️ Configuration

### Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### API Configuration

See `src/config/index.ts`:

```typescript
export const config = {
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  TOKEN_KEYS: {
    accessTokenKey: "recto_access_token",
    refreshTokenKey: "recto_refresh_token",
  },
};
```

## 🔌 API Integration

### Authentication Endpoints

All endpoints use `/api/v1/user` base path:

```typescript
// src/features/auth/services/auth-api.ts

POST   /signup                    // Send OTP
POST   /signup-verify             // Verify & create account
POST   /signin                    // Login
POST   /logout                    // Logout
POST   /refresh-accesstoken       // Refresh access token
GET    /whoami                    // Get current user
PUT    /update-profile            // Update profile
GET    /check-username/:username  // Check availability
POST   /forgot-password           // Send password reset OTP
POST   /forgot-password-verify    // Verify reset OTP
POST   /set-new-password          // Set new password
POST   /change-password           // Change current password
```

## 🎣 Custom Hooks

### useAuth

Main authentication hook - handles login, signup, logout, token refresh.

```typescript
const { user, isAuthenticated, isLoading, error, login, logout } = useAuth();
```

### useUser

User profile operations - update profile, check username, change password.

```typescript
const { isUpdating, error, updateProfile, checkUsernameAvailability } =
  useUser();
```

### usePasswordReset

Multi-step password reset flow.

```typescript
const {
  step,
  email,
  isLoading,
  error,
  requestPasswordReset,
  verifyResetOTP,
  setNewPassword,
} = usePasswordReset();
```

## 🛡️ Route Protection

### AuthGuard - Protect authenticated routes

```tsx
import { AuthGuard } from "@/features/auth";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}
```

### GuestGuard - Protect guest-only routes

```tsx
import { GuestGuard } from "@/features/auth";

export default function LoginPage() {
  return (
    <GuestGuard>
      <LoginForm />
    </GuestGuard>
  );
}
```

## 🎨 Pre-built Components

### LoginForm

Email/password login with Google OAuth button.

```tsx
import { LoginForm } from "@/features/auth";

export default function LoginPage() {
  return <LoginForm />;
}
```

### SignupForm

Multi-step signup with email, OTP, and password.

```tsx
import { SignupForm } from "@/features/auth";

export default function SignupPage() {
  return <SignupForm />;
}
```

### ForgotPasswordForm

3-step password reset flow.

```tsx
import { ForgotPasswordForm } from "@/features/auth";

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
```

## 📡 HTTP Client

Enhanced Fetch API client with automatic token management:

```typescript
// src/lib/api-client.ts

// Automatic Authorization header injection
// 401 response handling (auto-logout)
// Cookie support (credentials: "include")
// Timeout management (30s default)

const response = await apiClient("/user/profile", {
  method: "GET",
  // Token automatically added to headers
});
```

## 🔔 Toast Notifications

Sonner integration for user feedback:

```typescript
import { showToast } from "@/lib/toast";

showToast.success("Profile updated!");
showToast.error("Something went wrong");
showToast.info("Loading data...");
showToast.warning("Are you sure?");
```

## 📋 Available Scripts

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

## 🔧 Development

### Code Standards

- **100% TypeScript** - Full type coverage
- **Functional Components** - React hooks only
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first styling
- **ESLint** - Code quality

### File Naming

```
Components:     PascalCase.tsx
Hooks:          use*.ts
Utils:          kebab-case.ts
Stores:         *-store.ts
Services:       *-api.ts / *-service.ts
Types:          index.ts or *.ts
```

## 🔐 Security Features

- ✅ JWT token validation
- ✅ httpOnly cookies (CSRF protection)
- ✅ Password hashing (bcrypt on server)
- ✅ Rate limiting (on server)
- ✅ Input validation
- ✅ CORS configured
- ✅ Automatic token refresh
- ✅ Secure token storage (localStorage + cookies)

## ⚡ Performance

- Next.js App Router with Server Components
- Code splitting & lazy loading
- Image optimization
- CSS optimization with Tailwind
- Minimal dependencies

## 🐛 Debugging

### Enable Debug Mode

Set in `.env.local`:

```env
DEBUG=*
```

### Check Token Storage

```typescript
// In browser console
localStorage.getItem("recto_access_token");
localStorage.getItem("recto_refresh_token");
document.cookie; // httpOnly cookies
```

### Monitor API Calls

Open DevTools Network tab and check requests to `/api/v1/*`

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

## 🤝 Contributing

1. Follow code standards (TypeScript, Tailwind, functional components)
2. Add JSDoc comments for functions
3. Update documentation for new features
4. Test thoroughly before submitting

## 📞 Support

For detailed information:

1. Check `/docs/auth` for authentication setup
2. Review code comments
3. Check related documentation files
4. Review example implementations

---

**Next Steps:**

1. Run `npm install`
2. Create `.env.local` with API URL
3. Follow [Auth Quick Start](../docs/auth/README.md)
4. Create auth pages
5. Test authentication flows

**Last Updated:** January 18, 2026
