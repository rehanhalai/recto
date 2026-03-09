---
description: A skill to analyze MongoDB JSON structures and guide the agent in cleanly normalizing them into relational SQL models (e.g., extracting arrays to 1NF, applying 3NF to nested objects) using Drizzle ORM.
---

# SQL Normalizer Skill

**Skill Objective:** Convert raw JSON objects/MongoDB documents into highly normalized, relational SQL database structures using Drizzle ORM schemas.

### How to use this skill

When asked to "migrate a schema," "normalize this JSON," or "create a Drizzle schema based on this object," follow these strict relational principles:

### Step 1: Analyze and Flatten (First Normal Form - 1NF)

SQL databases cannot handle arrays natively efficiently like MongoDB.

- **Identify nested arrays:** If a JSON object has an array of items (e.g., `user.addresses[]`), extract that array into an entirely new table (`addresses`).
- **Create Foreign Keys:** Link the new table back to the parent table using a foreign key (e.g., `user_id`).

### Step 2: Remove Partial and Transitive Dependencies (2NF & 3NF)

- **2NF / 3NF check:** Ensure every attribute depends _only_ on the primary key of its table.
- **Identify complex nested objects:** If a JSON object has a nested object that represents an independent entity (e.g., `user.company.name`), extract that into a new table (`companies`) and link via a foreign key in the parent table (`company_id` inside `users`).

### Step 3: Write Drizzle Schema

Translate the normalized design into a standard Drizzle ORM schema using PostgreSQL syntax.

**Example Input (MongoDB / JSON):**

```json
{
  "_id": "user123",
  "name": "Jane Doe",
  "departments": ["sales", "marketing"],
  "company": {
    "name": "Acme Corp",
    "address": "123 Main St"
  }
}
```

**Example Output (Drizzle ORM):**

```typescript
import { pgTable, serial, text, varchar, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Normalizing the nested "company" object (3NF)
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address"),
});

// The main parent entity
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  companyId: integer("company_id").references(() => companies.id),
});

// Normalizing the "departments" array (1NF/Many-to-Many via Join Table assuming departments are reused)
export const userDepartments = pgTable("user_departments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .references(() => users.id)
    .notNull(),
  departmentName: varchar("department_name", { length: 255 }).notNull(),
});

// Define Relations for easy querying
export const userRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  departments: many(userDepartments),
}));
```
