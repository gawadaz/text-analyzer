---
description: Instructions for implementing and maintaining the text-analyzer-api AWS Lambda service.
applyTo: apps/text-analyzer-api/**
---

# text-analyzer-api (AWS Lambda) — Copilot Instructions

## Context
- This repository is a monorepo.
- `text-analyzer-api` is an AWS Lambda-based HTTP API used by the React UI app.
- Runtime: Node.js on AWS Lambda
- Language: TypeScript
- Invocation style: API Gateway (or Lambda Function URL) → Lambda handler → response back to UI.

## Goals
- Keep Lambda functions small, fast, secure, and easy to test.
- Use clean separation between:
  - **handlers** (AWS event/response shaping)
  - **domain/services** (business logic: analysis, validation)
  - **adapters** (S3/Dynamo/other AWS integrations, if needed)
- Prefer production-ready patterns: strict typing, structured logs, safe error handling, minimal dependencies.

---

## Folder & Code Structure (recommended)
- `src/handlers/`  
  - Entry points for each route/function (e.g., `analyzeFile.ts`, `getHistory.ts`)
  - Only translate AWS events ⇄ app inputs/outputs
- `src/services/`  
  - Pure business logic (e.g., `analyzerService.ts`, `historyService.ts`)
- `src/lib/`  
  - Shared utilities: logger, errors, response helpers, validation, config
- `src/types/`  
  - Shared type definitions (DTOs, API contracts)

**Rule:** Handlers must be thin; most logic lives in services/lib.

---

## TypeScript Rules
- Enable strict TS patterns in code you generate:
  - No `any` (use `unknown` + narrowing)
  - Prefer explicit return types on exported functions
  - Use type-safe request/response DTOs
- Prefer `const` and pure functions.
- Avoid complex generics unless needed.

---

## Lambda Handler Best Practices
### 1) Reuse resources across invocations
- Initialize heavy resources (clients, config, validators) **outside** the handler where safe.
- Avoid creating new AWS SDK clients per request if not needed.

### 2) Keep cold start in mind
- Minimize dependencies and imported modules.
- Avoid loading large libraries in the handler path unless required.

### 3) Handle async correctly
- Always `await` async operations.
- Return correct API Gateway response shape (`statusCode`, `headers`, `body`).

### 4) Timeouts & retries
- Prefer fast execution; fail quickly on invalid inputs.
- Make external calls resilient (timeouts, retries only where safe).

---

## Input Validation & Security
- Validate request:
  - method, path params, query params, headers
  - body parsing (JSON only if expected)
- Never trust the UI input.
- Sanitize and validate file-related inputs (name, size, type) if applicable.
- Enforce request size constraints (reject overly large payloads).
- Never log sensitive data (tokens, credentials, raw file content).

---

## Error Handling Pattern
- Use a consistent error model:
  - `BadRequestError` (400)
  - `UnauthorizedError` (401) if auth is introduced
  - `ForbiddenError` (403)
  - `NotFoundError` (404)
  - `ConflictError` (409)
  - `InternalError` (500)
- Handlers should:
  - catch errors
  - map known errors → correct status codes
  - return safe message to clients
  - log full context server-side (without sensitive content)

---

## API Responses (Consistency)
- Always return JSON:
  - `Content-Type: application/json`
- Use a standard response envelope:
  - Success: `{ data: ... }`
  - Error: `{ error: { code, message, requestId? } }`
- Include `requestId` (from Lambda context) in response headers and error payload when helpful.

---

## Logging & Observability
- Prefer structured logs (JSON).
- Log key fields:
  - `requestId`, route name, duration, status code
- Do NOT log raw request bodies if they may contain file contents.
- Add a small helper:
  - `withTiming(handler)` or simple `start = Date.now()` and log duration

---

## CORS
- The API is called from the UI, so enable CORS properly:
  - allow UI origin(s)
  - allow methods used (GET/POST/OPTIONS)
  - allow headers used (Content-Type, Authorization if added)
- Always respond to `OPTIONS` preflight if using API Gateway.

---

## Testing Guidance
- Prefer unit tests for services (pure logic).
- For handlers:
  - test event parsing and response mapping with sample API Gateway events
- Avoid AWS calls in unit tests; mock adapters.

---

## Implementation Style Rules (Copilot)
When implementing features in `text-analyzer-api`:
1. Start by defining the request/response DTO types.
2. Write service logic as pure functions where possible.
3. Keep handler thin: parse → validate → call service → respond.
4. Add robust error handling and consistent responses.
5. Add minimal tests for core logic + handler mapping.

---

## Example Patterns (high-level)
- `parseJsonBody(event)` that returns `unknown` and validates via a schema/type-guard.
- `jsonResponse(statusCode, payload, extraHeaders?)`
- `handleError(err, requestId)` mapping to API response
