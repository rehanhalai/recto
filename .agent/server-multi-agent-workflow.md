# 🚀 Module-by-Module Agent Workflow Guide

If parallel agents and branching feel like too much overhead right now, the absolute best alternative is a steady, linear **"Vertical Slice"** or **Module-by-Module** approach.

This keeps you entirely in control on a single branch (like `main`), moving one feature at a time. Your `.agent/rules/` will ensure the code generated is still perfect.

---

## The Workflow: "One Module at a Time"

Do not ask the AI to "migrate everything." That creates massive, messy files. Instead, pick one domain from your old Express app (e.g., `Users` or `Authentication`) and follow this exact loop:

### Step 1: The Database Schema (The Foundation)

You can't write a User Service without a User Table.
**Your Prompt to the Agent:**

> _"I want to start migrating the **User** module. Read the old Mongoose schema at `server/src/models/user.model.ts`. Use your `sql-normalizer` skill to convert this into a normalized Drizzle ORM schema and add it to our `server-nest/src/db/schema.ts` file."_

### Step 2: Scaffolding the Boilerplate

Once the table is in `schema.ts`, you build the NestJS shell.
**Your Prompt to the Agent:**

> _"Great. Now use your `nest-module-gen` skill to scaffold the `UserModule`, `UserController`, and `UserService`."_

### Step 3: Migrating the Logic (The Meat)

Now you port the actual business logic over, enforcing the new rules.
**Your Prompt to the Agent:**

> _"Now migrate the logic. Read the old Zod schemas in `server/src/validation` and use your `dto-validator` skill to create the NestJS DTOs. Then, map the old `server/src/routes/` and `server/src/services/` logic into our new Controller and Service. Remember our rule: Controllers handle routing ONLY, Services handle the actual DB calls to Drizzle."_

### Step 4: Quality Check

Before committing and moving to the next feature, act as the code reviewer.
**Your Prompt to the Agent:**

> _"Run your `run-nestjs-doctor` skill to scan the new User module. Fix any anti-patterns or performance warnings."_

---

## Why this is highly effective:

1. **Low Cognitive Load:** You are only thinking about one tiny piece of the app at a time.
2. **Constantly Shippable:** Unlike migrating "all controllers at once," when you finish the User Module, it actually _works_. You can test it in Postman immediately.
3. **No Merge Conflicts:** You don't have to worry about git branching or agents overwriting each other. Just commit and push when the module is done.

Repeat this Loop: **Schema -> Scaffold -> Logic -> Audit** for every module until the Express app is gone!
