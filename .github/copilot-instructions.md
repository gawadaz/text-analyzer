# Copilot Instructions (Monorepo)

You are working in an **Nx monorepo**. Keep all changes **minimal, correct, and production-ready**.

## General rules
- Prefer **clarity over cleverness**.
- Avoid over-engineering and unnecessary abstractions.
- Follow existing project conventions (linting, formatting, naming).
- Use **TypeScript strictly**:
  - Avoid `any`
  - Prefer `unknown` + explicit narrowing when needed
- Do not introduce new dependencies unless explicitly requested.

## Repo structure
- `apps/*` → deployable applications
- `libs/*` → shared, reusable code
- Do not duplicate logic across apps; extract to `libs/*` when reused.

## Application boundaries
- Each app owns its domain logic.
- Shared domain logic and types belong in `libs/*`.
- Avoid circular dependencies between apps or libs.

## Backend / services (if applicable)
- Keep handlers/controllers thin.
- Move business logic to services or domain modules.
- Always validate inputs.
- Return consistent and predictable error responses.

## Code quality checklist (before finishing)
- No unused imports or dead code
- Types are correct and explicit where helpful
- Files are placed in the correct app/lib
- Changes are small, readable, and focused
