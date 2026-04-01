---
description: A skill to scaffold NestJS Modules, Services, and Controllers accurately according to the architecture rules.
---

# NestJS Module Generator Skill

**Skill Objective:** Rapidly scaffold the boilerplate for new domain entities (e.g., users, products) strictly adhering to the project's separation of concerns rules.

### Process

When asked to create a new module (e.g., "Create an authentication module"), generate the three core files as described below. Do not mix database logic into controllers, and do not forget to export the service from the module if necessary.

#### 1. Generate Controller (`[entity].controller.ts`)

- Must rely entirely on constructor-injected Services.
- Handles routing, `@Body()`, `@Param()`, `@Query()` extraction, and HTTP status codes.

```typescript
import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ExampleService } from "./example.service";
import { CreateExampleDto } from "./dto/create-example.dto";

@Controller("examples")
export class ExampleController {
  constructor(private readonly exampleService: ExampleService) {}

  @Post()
  create(@Body() dto: CreateExampleDto) {
    return this.exampleService.create(dto);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.exampleService.findById(id);
  }
}
```

#### 2. Generate Service (`[entity].service.ts`)

- Contains all business rules, orchestration of database calls, and error throwing (e.g., `NotFoundException`).
- Uses constructor injection for the database connection (Drizzle ORM).

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateExampleDto } from "./dto/create-example.dto";

@Injectable()
export class ExampleService {
  // Inject Drizzle DB here
  constructor() {}

  async create(dto: CreateExampleDto) {
    // DB INSERT logic here
    return { id: "new-id", ...dto };
  }

  async findById(id: string) {
    // DB SELECT logic here
    const item = null; // Mock DB call
    if (!item) throw new NotFoundException("Example not found");
    return item;
  }
}
```

#### 3. Generate Module (`[entity].module.ts`)

- Registers the controller and the service.

```typescript
import { Module } from "@nestjs/common";
import { ExampleController } from "./example.controller";
import { ExampleService } from "./example.service";

@Module({
  controllers: [ExampleController],
  providers: [ExampleService],
  exports: [ExampleService], // Optional: Export if other modules need it
})
export class ExampleModule {}
```
