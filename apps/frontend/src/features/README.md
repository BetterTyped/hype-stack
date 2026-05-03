# Features

Feature code should be organized vertically: group code by what it does, not by what kind of file it is. This follows
the approach described in [The Vertical Codebase](https://tkdodo.eu/blog/the-vertical-codebase): code that changes
together should live together.

## What Belongs Here

Use `src/features/<domain>/<feature>` for product features and domain-specific frontend behavior. The first folder names
the domain that owns the work, and the second folder names the specific feature or vertical. A feature can contain
components, hooks, queries, schemas, types, utils, tests, and local assets when they belong to the same user-facing
capability.

Keep truly generic building blocks outside features. Shared layout, design-system primitives, and app shell code should
stay in `src/components`, `src/routes`, or another clearly shared area.

## Rules

- Create one folder per feature or vertical under its owning domain, for example `src/features/auth/login` or
  `src/features/projects/project-selector`.
- Do not add new features as flat `src/features/<feature>` folders. If a domain has only one feature today, still create
  the explicit `<domain>/<feature>` boundary.
- **Pages belong in `src/routes/`, NOT in features.** Route files import feature components and render them. Features
  never contain "page" files.
- Colocate feature-specific files inside that feature folder instead of splitting them across global `components`,
  `hooks`, `utils`, or `types` folders.
- **Hooks are scoped to where they're needed:** feature-level in `<feature>/hooks/` when only one feature uses them,
  domain-level in `<domain>/hooks/` when shared across features in the domain, global in `src/hooks/` when truly
  app-wide.
- **No flat files at the domain level** except domain-scoped shared folders (`hooks/`, `listeners/`, `types/`,
  `constants/`).
- Expose a small public API from the feature root when other parts of the app need to use it. Avoid importing from deep
  internal feature paths.
- Keep private implementation details inside the feature. If another feature starts depending on internals, promote the
  shared behavior to a clearer shared vertical or package.
- Prefer feature-owned tests near the code they cover.
- Do not put code here just because it is reusable. Reusable code belongs here only when it has a clear feature/domain
  owner.
- Keep feature folders understandable. If a feature grows too large, split it into smaller verticals with explicit
  boundaries.

## Suggested Shape

```txt
src/features/domain/example-feature/
  index.ts
  components/
  hooks/
  queries/
  schemas/
  tests/
  utils/
```

This shape is a starting point, not a requirement. Use only the folders a feature actually needs.

## Agentic Rules

These guidelines are also mirrored for Cursor in `.cursor/rules/frontend-features.mdc`.

When an AI agent changes feature code:

- Start by identifying the feature boundary and keep edits inside it when possible.
- Prefer colocating new code with the feature that owns the behavior.
- Do not create broad shared utilities until at least two real feature owners need them.
- Preserve public feature APIs. If an export from `index.ts` changes, update all consumers and tests in the same change.
- Check imports for boundary leaks. Imports from another feature should use that feature's public API, not its
  internals.
- Run targeted checks for the affected feature when available, then broader Nx checks when the change crosses feature
  boundaries.
