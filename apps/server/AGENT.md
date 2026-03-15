# Agent Workspace Configuration

Welcome to the `recto-server` Agent Configuration. This file defines the core behaviors, strict rules, and specialized skills that any autonomous AI agent must follow when operating within this repository.

Our overarching goal is to pivot from a legacy Express/MongoDB architecture to a highly normalized, strictly typed, dependency-injected **NestJS & PostgreSQL (Drizzle ORM)** application.

## 📜 Core Architecture Rules

When writing or refactoring code, you **MUST** strictly adhere to the following rules defined in `.agent/rules/`. Do not deviate from these patterns under any circumstances.

1. **[Mandatory Dependency Injection](./.agent/rules/di-mandatory.md)**: All services, repositories, and utilities must be injected via the constructor. Manual instantiation (`new Class()`) is forbidden.
2. **[Strict TypeScript](./.agent/rules/ts-strict.md)**: The `any` type is strictly banned. All boundaries (parameters, returns) must be strongly typed with interfaces or DTOs.
3. **[Controller vs Service Separation](./.agent/rules/arch-controller-service.md)**: Controllers handle HTTP routing only. Business logic and database interactions must exclusively live in Services.
4. **[NestJS Doctor: Security](./.agent/rules/nestjs-doctor-security.md)**: Strict avoidance of `eval()`, leaked stack traces, and unescaped HTML inputs.
5. **[NestJS Doctor: Performance](./.agent/rules/nestjs-doctor-performance.md)**: Explicit prohibition of synchronous I/O operations and blocking code in class constructors.

## 🛠️ Specialized Agent Skills

You have been equipped with specialized procedural skills defined in `.agent/skills/`. Use these exact workflows when performing the corresponding tasks.

- **[nest-module-gen](./.agent/skills/nest-module-gen.md)**: Use this skill to scaffold new features. It dictates exactly how modules, controllers, and services should be structured.
- **[dto-validator](./.agent/skills/dto-validator.md)**: Use this skill to auto-generate request validation layers relying heavily on `class-validator` and `class-transformer`.
- **[sql-normalizer](./.agent/skills/sql-normalizer.md)**: Crucial for the database pivot. Use this skill to convert legacy MongoDB JSON structures into highly normalized (1NF-3NF) relational PostgreSQL schemas using Drizzle ORM.
- **[run-nestjs-doctor](./.agent/skills/run-nestjs-doctor.md)**: Use this skill to run diagnostic checks via the `nestjs-doctor` CLI to automatically flag and fix hidden anti-patterns in the codebase.
- **[solid](./.agent/skills/solid.md)**: Use this skill for refactors and new backend logic where SOLID, clean architecture, and test-first workflows improve maintainability.
