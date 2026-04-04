# 🚀 NestJS AI Agent Workflow Guide

Welcome to your newly supercharged workspace! You have just implemented a robust "Agentic Flow" based on the Anthropic `agent-skills` standard, merging best practices from `Kadajett/agent-nestjs-skills` and the rigorous diagnostic standards of `RoloBits/nestjs-doctor`.

This guide will explain how to leverage this setup to drastically accelerate your pivot from Express to NestJS.

## How It Works

By putting these Markdown files in the `.agent/rules/` and `.agent/skills/` folders, and linking them via the root `AGENT.md` file, you are fundamentally changing how AI coding assistants (like Cursor, Claude Code, Antigravity, or Roo Code) interact with your project.

Instead of writing generic "average" code, the AI agent reads these instructions first. It learns that your specific project demands strict typing, dependency injection, and normalized SQL schemas before it even writes a single line of code.

---

## Scenario 1: Migrating an old Express Route

**Your Old Workflow:** You paste an old Express route and ask the AI "Convert this to NestJS". The AI probably gives you a massive controller that talks directly to MongoDB.

**Your New Agentic Workflow:**
Because the agent has the **[nest-module-gen]** skill and the **[Controller vs Service]** rule, you simply say:

> _"Migrate the old `GET /api/users/:id` Express endpoint to NestJS."_

**What the AI will do:**

1. It will automatically generate three files: `user.controller.ts`, `user.service.ts`, and `user.module.ts`.
2. It will perfectly split the logic: putting the `@Get()` routing in the controller, and moving the actual DB lookup logic into the constructor-injected service class.
3. It will strictly type the return values, refusing to use `any` due to the **[Strict TypeScript]** rule.

---

## Scenario 2: Migrating the Database (Mongo to SQL)

**Your Old Workflow:** You have a massive JSON document from MongoDB representing a user and their embedded arrays of addresses and settings. You try to blindly convert it to a SQL table.

**Your New Agentic Workflow:**
Leverage the **[sql-normalizer]** skill. You prompt:

> _"Here is a sample JSON from my old Mongo Users collection. Use your sql-normalizer skill to create the new Drizzle ORM schema for PostgreSQL."_

**What the AI will do:**

1. It will read the `sql-normalizer` protocol.
2. It will realize it cannot just dump the JSON array into a `varchar` column.
3. It will automatically split the arrays into separate tables (e.g., `user_addresses`), establish the foreign keys (`user_id`), and output clean, normalized Drizzle relations.

---

## Scenario 3: Building a New Feature with Validation

**Your New Agentic Workflow:**
You want to create a new endpoint to accept user profile updates. You prompt:

> _"Create a new endpoint to update a user's company profile. Use your dto-validator skill to ensure the payload is safe."_

**What the AI will do:**

1. It will read the `dto-validator` protocol.
2. It will generate a `UpdateCompanyDto` class.
3. Because the protocol specifically warns about nested objects, if the company profile has a nested "Address" object, the AI will automatically apply the mandatory `@Type(() => AddressDto)` and `@ValidateNested()` decorators so it doesn't fail silently at runtime.

---

## Scenario 4: Auditing and Quality Control

**Your New Agentic Workflow:**
You've been coding for a few hours and want to make sure you haven't introduced any sneaky performance bugs. You prompt:

> _"Use your run-nestjs-doctor skill to audit the codebase and fix any recent anti-patterns."_

**What the AI will do:**

1. It will open a real terminal session.
2. It will run `npx nestjs-doctor scan .` to get a health score.
3. If it sees you accidentally put a synchronous `fs.readFileSync` in a controller (violating the **[NestJS Doctor: Performance]** rule), it will actively go into the file and rewrite it to use async/await, then re-run the scan to prove the score improved.

---

## Conclusion

This setup transforms the AI from a simple auto-complete tool into a Senior Engineer pair-programmer that enforces your project's toughest standards. To keep improving it, simply add new `.md` files to the `.agent/rules/` folder whenever your team agrees on a new standard!
