---
description: This file contains instructions for generating React + TypeScript UI code in a monorepo.
applyTo: apps/token-analyzer-ui/src/**/*.tsx, apps/token-analyzer-ui/src/**/*.ts
---
# Copilot Instructions — React UI App

You are working inside a **React + TypeScript** application in a monorepo.
Your goal is to produce **production-ready, maintainable, modern UI** code.

## 1) Non-negotiables
- Use **React best practices**: functional components, hooks, composition over inheritance.
- Keep code **simple, readable, and consistent**.
- Prefer **small reusable components** over large pages.
- Avoid unnecessary abstractions or “clever” patterns.
- Always ensure **TypeScript is strict** and types are explicit where helpful.
- Never commit code that is obviously incomplete (TODOs are allowed only if explicitly asked).

---

## 2) Project structure rules (MUST follow)
Use this folder structure:

- `src/components/`  
  Reusable UI components only (buttons, cards, modals, form elements, layout parts).
  - Each component in its own folder if it has multiple files.
  - Example: `src/components/Button/Button.tsx`, `Button.css`, `index.ts`

- `src/pages/`  
  Route-level / screen components only. Pages should **compose** components from `src/components/` and call hooks/services.

- `src/hooks/`  
  Custom hooks only (e.g. `useDebounce`, `useLocalStorage`, `useFetch`).

- `src/utils/`  
  Pure functions/utilities (formatters, parsers, validators).

- `src/services/`  
  API clients / data fetching wrappers.

- `src/types/` (or `src/types.ts`)  
  Shared types/interfaces/enums for the UI.

**Do not** place UI components inside `pages/`.
**Do not** put business logic inside JSX—move it to hooks/utils/services.

---

## 3) Component design & reuse
- Components should be:
  - **Small**
  - **Reusable**
  - **Single responsibility**
- Prefer **composition**:
  - `Card`, `CardHeader`, `CardContent` rather than one giant component
- Keep props minimal; avoid “prop drilling” when a small local context makes sense.
- Use stable keys and avoid rendering-heavy patterns.

### Naming conventions
- Components: `PascalCase` (e.g. `ResultsPanel.tsx`)
- Hooks: `useSomething` (e.g. `useAnalysisHistory.ts`)
- Functions/variables: `camelCase`
- Files: match exported symbol name (`Button.tsx` exports `Button`)

---

## 4) State management guidelines
- Default to **local component state** (`useState`) first.
- Use `useReducer` when state transitions become non-trivial.
- Use memoization carefully:
  - `useMemo` and `useCallback` only when there’s an actual performance reason or prop stability is needed.
- Keep derived state derived (don’t duplicate state).

---

## 5) Side effects & data fetching
- Side effects belong in `useEffect` or custom hooks.
- Keep data fetching in `src/services/` and call it from hooks/pages.
- Always handle:
  - loading
  - error
  - empty state
- Prefer `AbortController` when fetching to prevent state updates after unmount.

---

## 6) TypeScript best practices
- Avoid `any`. Prefer `unknown` + narrowing.
- Type props explicitly:
  - `type Props = { ... }`
- Use union types for finite states:
  - `type Status = "idle" | "loading" | "success" | "error"`
- Avoid overusing generics unless it improves clarity.

---

## 7) UI/UX: clean & modern practices
- Prioritize:
  - clear hierarchy (headline → subtext → content)
  - adequate spacing (padding/margins)
  - consistent typography scale
  - responsive layout (mobile-first)
- Always implement:
  - disabled states for buttons
  - focus styles for keyboard navigation
  - accessible labels for inputs

### Accessibility (MUST)
- All interactive elements must be keyboard accessible.
- Use semantic HTML first (`button`, `label`, `main`, `section`).
- Provide:
  - `aria-label` when needed
  - `role="alert"` for error messages
  - meaningful headings order (`h1` then `h2`…)

---

## 8) Forms & validation
- Validate inputs early and show helpful messages.
- Errors should be user-friendly and actionable.
- Never allow silent failures.

---

## 9) Performance & rendering
- Avoid unnecessary re-renders:
  - Split large components
  - Use memoization only when beneficial
- Avoid storing large objects in state if it can be computed.
- For lists:
  - stable keys (not array index unless list is static)
  - keep row components small

---

## 10) Styling rules (use Chakra UI)
- Use **Chakra UI** components for all new UI work.
- Prefer Chakra style props and theming over custom CSS.
- Keep styles consistent and reusable.
- Avoid inline styles except for tiny dynamic cases.
- Use CSS Modules only when Chakra cannot meet a specific styling need.
- Ensure responsive design using Chakra’s responsive props or flexible layout primitives (grid/flex).

---

## 11) Code quality checklist (before finishing any task)
- ✅ Lint-like cleanliness: no dead code, no unused imports
- ✅ Handles loading/error/empty states
- ✅ Types are correct, no `any`
- ✅ Components are placed in correct folders
- ✅ Accessibility basics (labels, keyboard, focus, alerts)
- ✅ UI looks clean and consistent

---

## 12) When making changes
- Prefer small, safe refactors.
- If changing structure, do it in a minimal way:
  - extract component
  - move to correct folder
  - update imports
- If something is unclear, make a reasonable assumption and implement cleanly.

End goal: a production-ready React UI that is clean, modular, reusable, and accessible.
