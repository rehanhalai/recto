---
description: A skill to auto-generate class-validator and class-transformer based DTOs for type-safe payload validation.
---

# DTO Validator Skill

**Skill Objective:** Ensure all incoming HTTP data in NestJS is validated strictly using `class-validator` and types are safely transformed using `class-transformer` BEFORE it touches the Controller logic.

### Process

When asked to create Data Transfer Objects for a resource, apply the following strict rules:

### 1. Always Use Decorators

All properties in a DTO must have explicit `class-validator` decorators. If a property is optional, use `@IsOptional()` alongside the type decorator.

```typescript
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsInt,
  Min,
  IsOptional,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @IsEmail()
  readonly email: string;

  // Use Type from class-transformer when expecting converted primitives like numbers
  @IsInt()
  @Min(18)
  @Type(() => Number)
  readonly age: number;

  @IsString()
  @IsOptional()
  readonly bio?: string;
}
```

### 2. Nesting Objects

If a payload contains a nested object, you must use `@ValidateNested()` and explicitly tell `class-transformer` to convert the raw JS object into instances of the nested DTO class using `@Type()`.

```typescript
import { IsString, IsNotEmpty, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class AddressDto {
  @IsString()
  @IsNotEmpty()
  readonly street: string;
}

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  readonly companyName: string;

  // 🚨 CRITICAL: Both decorators are REQUIRED for nested validation to work 🚨
  @ValidateNested()
  @Type(() => AddressDto)
  readonly address: AddressDto;
}
```

### 3. Array of Objects

Similarly, if accepting an array of nested objects, inform `@ValidateNested` using `{ each: true }`.

```typescript
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  readonly locations: AddressDto[];
```
