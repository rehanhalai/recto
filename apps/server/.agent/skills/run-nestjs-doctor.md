---
description: A skill equipping the agent to intentionally run the npx nestjs-doctor CLI against the codebase to discover and automatically fix hidden anti-patterns (security, correctness, architecture, performance).
---

# Run NestJS Doctor Skill

**Skill Objective:** Leverage the `nestjs-doctor` CLI as an automated reviewer during development to ensure code quality stays pristinely aligned with NextJS best practices.

### General Usage

If the user asks you to "audit the code," "run a health check," or "fix anti-patterns," execute the following workflow:

1. **Run the Diagnostic CLI Command:**
   Open a terminal and execute the `nestjs-doctor` tool in the root of the NestJS project (`server` directory usually, where `tsconfig.json` lives):

   ```bash
   npx nestjs-doctor scan .
   ```

2. **Analyze Output:**
   Read the terminal output. Pay close attention to the Health Score and the specific violations categorized under:
   - Security
   - Correctness
   - Architecture
   - Performance

3. **Take Corrective Actions:**
   - Look at the file paths and specific lines mentioned in the violation output warnings.
   - Use your codebase tools to edit the files and manually implement the correct pattern based on the findings (for example, switching synchronous `fs` methods out for their asynchronous `fs/promises` equivalents, or moving db queries from controllers to services).

4. **Re-Scan (Verification):**
   Once you've made fixes, re-run `npx nestjs-doctor scan .` to explicitly confirm to the user that the Health Score has improved and the violations are handled.

### Why is this important?

It is easy to let small anti-patterns slip through during rapid AI refactoring. `nestjs-doctor` acts as an uncompromisable mechanical reviewer that holds the code to the standards defined in the other `AGENT.md` rules.
