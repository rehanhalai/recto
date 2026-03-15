---
description: A skill to apply pragmatic SOLID, clean architecture, and test-first practices in TypeScript and NestJS code.
---

# Solid Skill

**Skill Objective:** Improve backend code quality through focused refactoring, strong boundaries, and behavior-first tests without over-engineering small features.

## Use This Skill When

- Implementing or refactoring service-layer business logic.
- Reviewing modules for maintainability and code smells.
- Designing new module boundaries and dependency flow.
- Adding or improving tests for critical behavior.

## Process

### 1. Start with Behavior and Risks

- Define expected behavior and edge cases first.
- If tests exist, extend them before refactor.
- For bug fixes, write a failing test that reproduces the issue.

### 2. Apply SOLID Pragmatically

- Keep each class focused on one business reason to change.
- Depend on abstractions (interfaces/contracts), not concrete helpers.
- Split oversized services into smaller collaborators when logic branches heavily.
- Avoid rigid rule chasing: optimize clarity and correctness over arbitrary line counts.

### 3. Keep Architecture Boundaries Clear

- Controllers: transport only (routing, DTO validation, status mapping).
- Services: business orchestration and domain decisions.
- Repositories/data layer: persistence concerns and query composition.
- External systems (mail, otp, auth providers): accessed through injected services.

### 4. Refactor for Readability and Safety

- Replace duplicated conditionals with named private methods.
- Make invalid states explicit with typed errors/exceptions.
- Prefer immutable local variables and narrow function signatures.
- Remove dead branches and stale comments while preserving behavior.

### 5. Verify with Focused Tests

- Cover success path, authorization/validation failures, and one edge case.
- Mock external collaborators (mail/otp/providers) at boundaries.
- Assert behavior and outcomes, not implementation details.

## Output Expectations

- Small, reviewable diffs.
- Clear naming and explicit contracts.
- Tests proving changed behavior.
- No architecture regressions (DI, strict typing, controller/service separation).

## Reference Documents

When a task touches design quality, testing, or architecture tradeoffs, consult these references before making significant changes.

- `./solid/references/solid-principles.md`
- `./solid/references/tdd.md`
- `./solid/references/testing.md`
- `./solid/references/clean-code.md`
- `./solid/references/code-smells.md`
- `./solid/references/design-patterns.md`
- `./solid/references/architecture.md`
- `./solid/references/object-design.md`
- `./solid/references/complexity.md`
