# Recto Authentication Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        RECTO CLIENT                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              UI COMPONENTS LAYER                    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                      │  │
│  │  ┌─────────────────┐  ┌──────────────────────────┐ │  │
│  │  │   LoginForm     │  │  SignupForm (3 steps)   │ │  │
│  │  │                 │  │  1. Email/Password      │ │  │
│  │  │ • Email input   │  │  2. OTP Verification   │ │  │
│  │  │ • Password      │  │  3. Success            │ │  │
│  │  │ • Google OAuth  │  │                        │ │  │
│  │  └─────────────────┘  └──────────────────────────┘ │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  ForgotPasswordForm (3 steps)               │   │  │
│  │  │  1. Email request                           │   │  │
│  │  │  2. OTP Verification                        │   │  │
│  │  │  3. New Password                            │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                                                      │  │
│  │  ┌──────────────┐  ┌──────────────────────────┐    │  │
│  │  │ AuthGuard    │  │  GuestGuard             │    │  │
│  │  │              │  │  (redirects logged-in)  │    │  │
│  │  │ Protects:    │  │                        │    │  │
│  │  │ - Dashboard  │  │ Protects:              │    │  │
│  │  │ - Profile    │  │ - Login Page           │    │  │
│  │  │ - Settings   │  │ - Signup Page          │    │  │
│  │  └──────────────┘  └──────────────────────────┘    │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                             │
│                              │ Uses Hooks                  │
│                              ▼                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              HOOKS LAYER (Logic)                     │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │ useAuth()    │  │ useUser()    │  │usePassword │ │  │
│  │  │              │  │              │  │Reset()     │ │  │
│  │  │ • login()    │  │ • update()   │  │            │ │  │
│  │  │ • signup()   │  │ • check()    │  │ • request()│ │  │
│  │  │ • verify()   │  │ • change()   │  │ • verify() │ │  │
│  │  │ • logout()   │  │ • clearErr() │  │ • reset()  │ │  │
│  │  │ • refresh()  │  │              │  │ • reset()  │ │  │
│  │  │ • init()     │  │              │  │            │ │  │
│  │  │ • clearErr() │  │              │  │            │ │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │  │\n│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │\n│                              │                             │\n│                              │ Dispatches Actions          │\n│                              ▼                             │\n│  ┌──────────────────────────────────────────────────────┐  │
│  │        ZUSTAND STORE (State Management)              │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                      │  │
│  │  User Data:                                          │  │
│  │  ├─ user: User | null                               │  │
│  │  ├─ accessToken: string | null                       │  │
│  │  ├─ isAuthenticated: boolean                         │  │
│  │  ├─ isLoading: boolean                               │  │
│  │  └─ error: string | null                             │  │
│  │                                                      │  │
│  │  Persistence: localStorage                           │  │
│  │  ├─ Persists: user + isAuthenticated                 │  │
│  │  └─ Auto-hydrates on page load                       │  │
│  │                                                      │  │
│  │  Actions: login, logout, signup, refresh...         │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                             │
│                              │ Calls API                   │
│                              ▼                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           API SERVICE LAYER (auth-api.ts)           │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                      │  │
│  │  signupRequest()           → POST /signup            │  │
│  │  verifySignupOTP()         → POST /signup-verify     │  │
│  │  loginRequest()            → POST /signin            │  │
│  │  refreshAccessToken()      → POST /refresh           │  │
│  │  logoutRequest()           → POST /logout            │  │
│  │  getCurrentUser()          → GET /whoami             │  │
│  │  forgotPasswordRequest()   → POST /password-otp      │  │
│  │  verifyPasswordResetOTP()  → POST /password-otp...   │  │
│  │  setNewPassword()          → POST /new-password      │  │
│  │  updateProfile()           → PATCH /update-profile   │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                             │
│                              │ Makes HTTP Requests         │
│                              ▼                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        API CLIENT LAYER (api-client.ts)             │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                      │  │
│  │  • Automatic JWT injection (Bearer token)           │  │
│  │  • Cookie handling (credentials: include)           │  │
│  │  • Error handling (401, 5xx, network)               │  │
│  │  • Request timeout (30s)                            │  │
│  │  • Token manager integration                         │  │
│  │  • 401 auto-logout event dispatch                    │  │
│  │                                                      │  │
│  │  Methods: get(), post(), put(), patch(), delete()   │  │
│  │                                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                             │\n│                              │ HTTP                        │\n└──────────────────────────────┼─────────────────────────────┘\n                               │\n                               ▼\n                   ┌──────────────────────┐\n                   │   RECTO SERVER       │\n                   │   (Express + Mongo)  │\n                   │                      │\n                   │ /api/v1/user/*       │\n                   └──────────────────────┘\n```\n\n## Data Flow - Login Example\n\n```\nUser Input (LoginForm)\n    │\n    │ {email, password}\n    ▼\nCall useAuth().login()\n    │\n    │ Calls Store Action\n    ▼\nStore calls authApi.loginRequest()\n    │\n    │ Calls API Client\n    ▼\nAPI Client builds request\n    │\n    ├─ Headers: {Authorization: \"Bearer <token>\"}\n    ├─ Method: POST\n    ├─ URL: /api/v1/user/signin\n    ├─ Body: {email, password}\n    └─ Credentials: include (for cookies)\n    │\n    ▼\nFetch to Server\n    │\n    ▼\nServer Response: {accessToken, refreshToken, user}\n    │\n    ▼\nAPI Client handles response\n    │\n    ├─ Check status (401, 5xx, etc)\n    ├─ Parse JSON\n    └─ Return data\n    │\n    ▼\nauthApi returns response to store\n    │\n    ▼\nStore actions:\n    │\n    ├─ tokenManager.setAccessToken(accessToken)\n    ├─ tokenManager.setRefreshToken(refreshToken)\n    ├─ setState(user, isAuthenticated=true)\n    └─ setState(isLoading=false)\n    │\n    ▼\nUI Updates\n    │\n    ├─ useAuth() hook re-renders\n    ├─ isAuthenticated = true\n    ├─ user data available\n    └─ Form can redirect to dashboard\n    │\n    ▼\nUser Redirected\n```\n\n## Token Management Flow\n\n```\n┌─────────────────────────────────────────────┐\n│          DUAL TOKEN STRATEGY                │\n└─────────────────────────────────────────────┘\n\n┌──────────────────────────────────┐\n│      ACCESS TOKEN                │\n│  (Short-lived: ~15 min)          │\n├──────────────────────────────────┤\n│ • Stored: localStorage           │\n│ • Key: recto_access_token        │\n│ • Used in: Authorization header  │\n│ • Sent with: Every API request   │\n│ • Expires: Relatively quickly    │\n│ • When expires: Auto-refresh     │\n│ • Risk: XSS attack exposure      │\n│ • Mitigation: Can't be stolen    │\n│   with same-origin policy        │\n└──────────────────────────────────┘\n\n┌──────────────────────────────────┐\n│      REFRESH TOKEN               │\n│  (Long-lived: ~7 days)           │\n├──────────────────────────────────┤\n│ • Stored: httpOnly cookie        │\n│ • Fallback: localStorage         │\n│ • Key: recto_refresh_token       │\n│ • Used for: Getting new tokens   │\n│ • Sent as: Cookie (auto) + body  │\n│ • Expires: Much later            │\n│ • When expires: Force re-login   │\n│ • Security: httpOnly prevents JS │\n│   access (CSRF protected)        │\n│ • Rotation: New token on refresh │\n└──────────────────────────────────┘\n\nAPI Request Flow:\n\n  1. User makes request\n       │\n       ▼\n  2. API Client gets accessToken from localStorage\n       │\n       ▼\n  3. Add to headers: Authorization: Bearer <token>\n       │\n       ▼\n  4. Include credentials (for httpOnly cookie)\n       │\n       ▼\n  5. Send request\n       │\n       ├─ If success (200): Return response\n       │\n       └─ If 401 (unauthorized):\n          │\n          ├─ Clear accessToken\n          ├─ Call /refresh endpoint\n          │  (sends refresh token via cookie)\n          │\n          ├─ Get new accessToken\n          ├─ Store in localStorage\n          ├─ Retry original request with new token\n          │\n          └─ If refresh fails: Logout user\n```\n\n## Component Hierarchy\n\n```\nRoot Layout\n├─ ToasterProvider (for notifications)\n│\n├─ AuthGuard (for protected pages)\n│  ├─ Dashboard\n│  ├─ Profile\n│  └─ Settings\n│\n└─ GuestGuard (for auth pages)\n   ├─ /login\n   │  └─ LoginForm\n   │     └─ useAuth() hook\n   │\n   ├─ /signup\n   │  └─ SignupForm (multi-step)\n   │     ├─ Step 1: Signup\n   │     ├─ Step 2: OTP Verify\n   │     ├─ Step 3: Success\n   │     └─ useAuth() hook\n   │\n   └─ /forgot-password\n      └─ ForgotPasswordForm (multi-step)\n         ├─ Step 1: Email request\n         ├─ Step 2: OTP verify\n         ├─ Step 3: New password\n         ├─ Step 4: Success\n         └─ usePasswordReset() hook\n```\n\n## State Persistence\n\n```\nOn App Start:\n  1. Check localStorage for \"auth-storage\"\n  2. If exists: Auto-hydrate store with:\n     - user data\n     - isAuthenticated flag\n  3. If not: Start with empty state\n  4. useAuth().initializeAuth() checks:\n     - Do we have accessToken?\n     - If yes: Fetch current user from /whoami\n     - If no: Stay logged out\n\nDuring Session:\n  - Store automatically saves to localStorage\n  - Debounced (efficient)\n  - Only persists: user + isAuthenticated\n  - Does NOT persist: accessToken (for security)\n  - Does NOT persist: isLoading, error\n\nOn Page Reload:\n  - Store hydrates from localStorage\n  - User data restored\n  - initializeAuth() called\n  - Validates with server\n```\n\n## Error Handling Flow\n\n```\nAPI Call:\n  │\n  ├─ Network Error\n  │  ├─ Catch in try/catch\n  │  ├─ Set store.error\n  │  ├─ Show toast.error()\n  │  └─ Component can handle/retry\n  │\n  ├─ 400 Bad Request\n  │  ├─ Parse error from response\n  │  ├─ Display to user via toast\n  │  └─ User fixes input and retries\n  │\n  ├─ 401 Unauthorized\n  │  ├─ Clear tokens\n  │  ├─ Dispatch auth:unauthorized event\n  │  ├─ Logout user\n  │  ├─ Redirect to /login\n  │  └─ Show \"Session expired\" toast\n  │\n  ├─ 403 Forbidden\n  │  ├─ User doesn't have permission\n  │  ├─ Show error toast\n  │  └─ Redirect to home\n  │\n  └─ 5xx Server Error\n     ├─ Server error message\n     ├─ Show generic/specific error\n     ├─ Suggest retry\n     └─ Log for debugging\n\nUI Error Display:\n  - Toast notifications (default)\n  - Error in form fields (optional)\n  - Error boundary (app-level)\n```\n\n## Security Considerations\n\n```\n✅ IMPLEMENTED:\n  • JWT tokens (signed, verified by server)\n  • httpOnly cookies (CSRF protected)\n  • HTTPS recommended (enforced in production)\n  • Token expiration (short-lived access tokens)\n  • Token rotation (new tokens on refresh)\n  • Auto-logout on 401 (expired tokens)\n  • CORS configured on server\n  • Rate limiting (on server side)\n\n⚠️  MITIGATIONS:\n  • XSS: localStorage tokens subject to XSS\n    → httpOnly cookies for refresh token\n    → Content Security Policy recommended\n  • CSRF: Cookies send with requests\n    → SameSite=Lax on server\n    → Server validates origin\n  • Token theft: localStorage can be accessed\n    → Keep tokens short-lived\n    → Use httpOnly for refresh token\n    → Monitor for suspicious activity\n\n🔒 BEST PRACTICES:\n  • Store refresh token in httpOnly cookie\n  • Access token in memory or localStorage\n  • Validate tokens on every request\n  • Use HTTPS in production\n  • Implement rate limiting\n  • Monitor authentication logs\n  • Implement 2FA (future)\n  • Educate users about passwords\n```\n
```
