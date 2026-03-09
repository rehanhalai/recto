---
description: Rule enforcing security best practices to prevent `eval` usage, prevent exposed stack traces, and manage secrets securely based on `nestjs-doctor` checks.
---

# NestJS Doctor: Security Rules

**Rule:** Ensure high security standards by explicitly avoiding dynamic code execution, preventing stack trace leaks, and adhering to strict secret management practices as defined by `nestjs-doctor` tools.

### 1. No `eval()`

**Never** use `eval()`, `new Function()`, `setTimeout(string)`, or `setInterval(string)`. This allows arbitrary code execution, often leading to Remote Code Execution (RCE) vulnerabilities.

```typescript
// ❌ BAD
eval(userInput);
setTimeout("console.log('" + userInput + "')", 1000);

// ✅ GOOD
const funcMap = { actionA: () => doActionA() };
if (funcMap[userInput]) funcMap[userInput]();
setTimeout(() => console.log(userInput), 1000);
```

### 2. No Stack Trace Exposure

Ensure unhandled exceptions do not leak stack traces to the client in production. Use a global Exception Filter to sanitize error outputs.

```typescript
// ✅ GOOD: Global Filter Example (main.ts or app.module.ts)
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      // Do NOT include the stack trace here in production
      message:
        httpStatus === HttpStatus.INTERNAL_SERVER_ERROR
          ? "Internal server error"
          : (exception as any).message,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
```

### 3. Proper CSRF and Input Sanitization

Use `helmet` for HTTP headers and enable standard NestJS CORS protection. When accepting HTML, explicitly sanitize it using libraries like `DOMPurify` before storing it in the PostgreSQL database.
