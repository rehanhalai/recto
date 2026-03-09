---
description: Rule enforcing Strict TypeScript, explicitly banning the use of `any` and requiring precise type definitions.
---

# Strict TypeScript

**Rule:** You must strictly type all variables, function parameters, returns, and object properties. The use of the `any` type is **strictly forbidden**.

### Why?

Using `any` defeats the purpose of TypeScript. It disables compile-time checks, autocompletion, and refactoring safety. An application with `any` types is effectively plain JavaScript, prone to runtime crashes.

### Incorrect (Anti-Pattern)

```typescript
import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  // ❌ BAD: Using 'any' for payload and return type
  validateUser(payload: any): any {
    if (payload.id) {
      return { id: payload.id, valid: true };
    }
    return null;
  }
}
```

### Correct (Pattern)

```typescript
import { Injectable } from "@nestjs/common";

export interface JwtPayload {
  id: string;
  email: string;
}

export interface ValidationResult {
  id: string;
  valid: boolean;
}

@Injectable()
export class AuthService {
  // ✅ GOOD: Strict interfaces used
  validateUser(payload: JwtPayload): ValidationResult | null {
    if (payload.id) {
      return { id: payload.id, valid: true };
    }
    return null;
  }
}
```

### Handling Unknown Types

If a type is truly unknown at compile time (e.g., parsing a generic JSON request body before validation), use `unknown` instead of `any`. `unknown` forces you to perform type-checking before treating the variable as a specific type.
