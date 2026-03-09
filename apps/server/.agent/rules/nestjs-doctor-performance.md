---
description: Rule explicitly forbidding synchronous I/O and blocking constructors, ensuring high throughput based on `nestjs-doctor` checks.
---

# NestJS Doctor: Performance Rules

**Rule:** NestJS is built on Node.js and relies heavily on its asynchronous event loop for performance. You must absolutely avoid blocking the event loop with synchronous operations.

### 1. No Synchronous I/O

**Never** use synchronous methods from built-in modules like `fs`, `child_process`, or `crypto` during standard request lifecycles.

```typescript
// ❌ BAD: Blocking the event loop
import * as fs from 'fs';

@Get('data')
getData() {
  // Every request waits for this file read to finish!
  const content = fs.readFileSync('large-file.json', 'utf8');
  return JSON.parse(content);
}

// ✅ GOOD: Non-blocking async I/O
import * as fs from 'fs/promises';

@Get('data')
async getData() {
  const content = await fs.readFile('large-file.json', 'utf8');
  return JSON.parse(content);
}
```

### 2. No Blocking Operations in Constructors

Constructors in NestJS runs when the application bootstraps and should only be used for Dependency Injection assignments. Do not perform any heavy lifting, asynchronous work, or blocking operations in the `constructor`.

```typescript
// ❌ BAD
@Injectable()
export class DataService {
  constructor() {
    this.heavyComputation(); // Slows down entire app startup
  }
}

// ✅ GOOD: Use OnModuleInit lifecycle hook
import { Injectable, OnModuleInit } from "@nestjs/common";

@Injectable()
export class DataService implements OnModuleInit {
  async onModuleInit() {
    await this.heavyComputationAsync();
  }
}
```
