---
description: Rule enforcing separation of concerns between Controllers (routing/HTTP) and Services (business logic).
---

# Controller vs Service Separation

**Rule:** Controllers must contain **zero business logic**. Their sole responsibility is to handle HTTP requests, extract parameters/body/query, map to the correct Service method, and format the HTTP response. Services are responsible for executing business rules and interacting with the database layer.

### Why?

Mixing routing logic and business logic makes testing incredibly difficult (you have to mock HTTP contexts to test simple logic) and prevents logic reusability. A Service method should be callable by a Controller, a Cron Job, or a CLI command without modification.

### Incorrect (Anti-Pattern)

```typescript
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { db } from "./db.config";

@Controller("users")
export class UserController {
  @Post()
  async createUser(@Body() body: any) {
    // ❌ BAD: Business validation in controller
    if (body.age < 18) {
      throw new HttpException("Must be 18+", HttpStatus.BAD_REQUEST);
    }

    // ❌ BAD: Database interaction in controller
    const user = await db.insert(users).values(body).returning();

    // ❌ BAD: Business logic formatting
    return { ...user, isAdult: true, timestamp: new Date() };
  }
}
```

### Correct (Pattern)

**Service (`user.service.ts`)**

```typescript
import { Injectable, BadRequestException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserRepository } from "./user.repository"; // Or inject Drizzle DB directly

@Injectable()
export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async createUser(dto: CreateUserDto) {
    // ✅ GOOD: Business logic validation
    if (dto.age < 18) {
      throw new BadRequestException("User must be 18+");
    }

    // ✅ GOOD: Database interaction
    const dbUser = await this.repo.create(dto);

    // ✅ GOOD: Business grouping/formatting
    return { ...dbUser, isAdult: true, timestamp: new Date() };
  }
}
```

**Controller (`user.controller.ts`)**

```typescript
import { Controller, Post, Body } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    // ✅ GOOD: Controller only routes the validated DTO to the service
    return await this.userService.createUser(dto);
  }
}
```
