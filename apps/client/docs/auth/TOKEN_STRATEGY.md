# Token Storage Strategy

## Quick Answer

**Use the Hybrid Approach** (already implemented):

- **Access Token** → `localStorage` (15 min lifetime)
- **Refresh Token** → `httpOnly Cookie` (7 days lifetime)

## For Protected Routes

### Client-Side Protection

```typescript
// ✅ Check localStorage for access token
const isAuthenticated = (): boolean => {
  return tokenManager.getAccessToken() !== null;
};

// Usage in AuthGuard
if (!isAuthenticated) {
  router.push("/login");
}
```

### API Requests

```typescript
// ✅ Send access token in Authorization header
const headers = {
  Authorization: `Bearer ${tokenManager.getAccessToken()}`,
};

fetch("/api/protected-endpoint", { headers });
```

### Token Refresh

```typescript
// ✅ Refresh token automatically sent via cookie
fetch("/user/refresh-accesstoken", {
  method: "POST",
  credentials: "include", // Sends httpOnly cookie
});
```

## Comparison Table

| Feature                  | Cookies Only    | localStorage Only | **Hybrid (✅)**       |
| ------------------------ | --------------- | ----------------- | --------------------- |
| **XSS Protection**       | ✅ httpOnly     | ❌ Vulnerable     | ✅ Refresh token safe |
| **CSRF Protection**      | ❌ Need tokens  | ✅ Not vulnerable | ✅ Not vulnerable     |
| **Client Route Guards**  | ⚠️ Can read     | ✅ Easy access    | ✅ Easy access        |
| **Authorization Header** | ⚠️ Complex      | ✅ Simple         | ✅ Simple             |
| **Auto-send to API**     | ✅ Automatic    | ❌ Manual         | ⚠️ Mixed (good)       |
| **Long-term Tokens**     | ⚠️ XSS risk     | ❌ Major risk     | ✅ Safe in cookie     |
| **Short-term Tokens**    | ✅ Can use both | ✅ Fast access    | ✅ Fast access        |

## Security Analysis

### Why Access Token in localStorage is OK

```typescript
// Short expiry time = low risk window
const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes

// If XSS attack steals it:
// - Attacker has 15 minutes of access
// - Can't get refresh token (httpOnly cookie)
// - After 15 min, access token is useless
```

**Risk**: Low (15-minute window)  
**Benefit**: Fast client-side auth checks, works with REST APIs

### Why Refresh Token in Cookie is Required

```typescript
// Long expiry time = must be secure
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days

// In httpOnly cookie:
// ✅ JavaScript can't access it
// ✅ XSS can't steal it
// ✅ Only sent to same domain
// ✅ Can't be read by malicious scripts
```

**Risk**: Very Low (protected by httpOnly)  
**Benefit**: Secure long-term authentication

## Implementation Details

### 1. Login Flow

```typescript
// Server response after login
{
  "data": {
    "accessToken": "eyJhbGc...",
    "user": { /* user data */ }
  }
}

// Server sets cookie
Set-Cookie: refreshToken=xyz...; HttpOnly; Secure; SameSite=Lax

// Client stores access token
localStorage.setItem('accessToken', response.data.accessToken);
```

### 2. Protected Route Check

```typescript
// app/(protected)/home/layout.tsx
export default function ProtectedLayout({ children }) {
  return (
    <AuthGuard>
      {children}
    </AuthGuard>
  );
}

// AuthGuard checks
const isAuthenticated = tokenManager.getAccessToken() !== null;
```

### 3. API Request

```typescript
// Automatic with apiClient
const response = await apiClient.get("/books");

// Behind the scenes
fetch("/books", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
  credentials: "include", // Also sends refresh token cookie
});
```

### 4. Token Refresh (Automatic)

```typescript
// When access token expires (401 error)
try {
  await apiClient.get("/protected");
} catch (error) {
  if (error.status === 401) {
    // Try to refresh
    const response = await fetch("/user/refresh-accesstoken", {
      method: "POST",
      credentials: "include", // Sends refresh token cookie
    });

    const { accessToken } = await response.json();
    localStorage.setItem("accessToken", accessToken);

    // Retry original request
  }
}
```

## Alternative Approaches (Not Recommended)

### ❌ Option 1: Cookies Only

```typescript
// Problem: Can't easily use Authorization header
// Many REST APIs expect: Authorization: Bearer <token>

// Would need to:
// 1. Change all API endpoints to read cookies
// 2. Implement CSRF protection
// 3. Configure CORS carefully
```

**Why Not**: More complex, CSRF vulnerability, harder with REST APIs

### ❌ Option 2: localStorage Only

```typescript
// Problem: Long-lived tokens in localStorage
localStorage.setItem("refreshToken", token); // ⚠️ DANGEROUS

// If XSS steals this:
// - Attacker has 7 days of access
// - Can generate infinite access tokens
// - Complete account takeover
```

**Why Not**: Major security risk for refresh tokens

### ❌ Option 3: SessionStorage Only

```typescript
// Problem: Lost on tab close
sessionStorage.setItem("accessToken", token);

// User closes tab → loses authentication
// No "remember me" functionality
```

**Why Not**: Poor UX, no persistent auth

## Best Practices

### ✅ DO

1. **Access Token in localStorage** (short-lived)

   ```typescript
   localStorage.setItem("accessToken", token); // 15 min
   ```

2. **Refresh Token in httpOnly Cookie** (long-lived)

   ```typescript
   // Server sets it
   res.cookie("refreshToken", token, { httpOnly: true });
   ```

3. **Check localStorage for Route Protection**

   ```typescript
   if (!localStorage.getItem("accessToken")) {
     router.push("/login");
   }
   ```

4. **Use Authorization Header for APIs**

   ```typescript
   headers: { 'Authorization': `Bearer ${accessToken}` }
   ```

5. **Clear Both on Logout**
   ```typescript
   localStorage.removeItem("accessToken");
   await fetch("/logout", { credentials: "include" }); // Clears cookie
   ```

### ❌ DON'T

1. **Don't store refresh token in localStorage**

   ```typescript
   localStorage.setItem("refreshToken", token); // ❌ NO!
   ```

2. **Don't rely only on cookies for client-side checks**

   ```typescript
   // ❌ Slow and doesn't work with Authorization header
   const token = getCookie("accessToken");
   ```

3. **Don't store sensitive data in tokens**

   ```typescript
   // ❌ Tokens should only have user ID, not password
   const token = jwt.sign({ userId, password }); // NO!
   ```

4. **Don't use super long access token expiry**
   ```typescript
   // ❌ Defeats the purpose of refresh tokens
   const ACCESS_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // NO!
   ```

## Your Current Implementation ✅

You're already using the hybrid approach correctly:

### Server ([user.controller.ts](../../server/src/controller/user.controller.ts))

```typescript
// ✅ Sets refresh token as httpOnly cookie
res.cookie("refreshToken", newRefreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// ✅ Returns access token in response body
res.json({
  data: {
    accessToken,
    user: {
      /* ... */
    },
  },
});
```

### Client ([auth-api.ts](../src/features/auth/services/auth-api.ts))

```typescript
// ✅ Stores access token in localStorage
if (response.data.accessToken) {
  tokenManager.setAccessToken(response.data.accessToken);
}

// ✅ Refresh token in cookie is sent automatically
const response = await apiClient.post(
  "/user/refresh-accesstoken",
  {},
  {
    credentials: "include", // Sends httpOnly cookie
  },
);
```

### Protected Routes ([auth-guard.tsx](../src/features/auth/components/auth-guard.tsx))

```typescript
// ✅ Checks localStorage for authentication
const isAuthenticated = tokenManager.getAccessToken() !== null;

if (!isAuthenticated) {
  router.push("/login");
}
```

## Summary

**For Protected Routes: Check localStorage**

```typescript
// ✅ Simple, fast, works offline
const canAccess = localStorage.getItem("accessToken") !== null;
```

**For API Requests: Use Bearer Token**

```typescript
// ✅ Standard REST API pattern
headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
```

**For Token Refresh: Use httpOnly Cookie**

```typescript
// ✅ Secure, automatic, prevents XSS
fetch("/refresh", { credentials: "include" });
```

### The Strategy:

| Token Type  | Storage         | Lifetime | Purpose                    |
| ----------- | --------------- | -------- | -------------------------- |
| **Access**  | localStorage    | 15 min   | API requests, route guards |
| **Refresh** | httpOnly Cookie | 7 days   | Get new access tokens      |

This hybrid approach gives you:

- 🔒 **Security**: Long-lived tokens protected from XSS
- 🚀 **Performance**: Fast client-side auth checks
- 🎯 **Simplicity**: Works with standard REST APIs
- ✅ **Best Practice**: Industry-standard pattern

**You're already doing it right!** Just continue using `localStorage` for protected route checks and the httpOnly cookie will handle refresh automatically.
