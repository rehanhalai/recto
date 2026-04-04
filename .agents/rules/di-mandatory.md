---
description: Rule enforcing Mandatory Dependency Injection (avoiding manual instantiation where DI should be used).
---

# Mandatory Dependency Injection

**Rule:** You must use NestJS's Dependency Injection system for all services, providers, repositories, and utilities. **NEVER** use `new ClassName()` to instantiate objects that should be managed by the IoC container.

### Why?

Manual instantiation breaks the NestJS ecosystem. It prevents proper testing via mocking, causes lifecycle hooks (like `onModuleInit`) to be missed, breaks scoping (e.g., Request-scoped vs Singleton), and creates tight coupling.

### Incorrect (Anti-Pattern)

```typescript
import { Controller, Get } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  private userService = new UserService(); // ❌ BAD: Manual instantiation

  @Get()
  getUsers() {
    return this.userService.getAll();
  }
}
```

### Correct (Pattern)

```typescript
import { Controller, Get } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  // ✅ GOOD: constructor injection
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers() {
    return this.userService.getAll();
  }
}
```

### Exceptions

- simple Data Transfer Objects (DTOs) when used in tests (in production, they are instantiated by validation pipes).
- simple value objects or generic utility functions that do not depend on external services or configuration.
