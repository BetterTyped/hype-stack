# Backend Features

Feature code should be organized vertically: group code by the domain capability it serves, not by file kind alone. This
mirrors the frontend `src/features` guidance: code that changes together should live together.

This README documents conventions that should stay useful even when the example product features are removed or
replaced.

These guidelines are mirrored for Cursor in `.cursor/rules/backend-features.mdc`.

## What Belongs Here

Use `src/features/*` for product domains and backend behavior with a clear domain owner. A domain can contain modules,
db access, schemas, types, helpers, constants, tests, jobs, webhook handling, and other code that changes with that
domain.

Keep generic infrastructure outside features:

- HTTP route composition belongs in `src/routes`.
- Global middleware belongs in `src/middleware`.
- Shared config belongs in `src/config`.
- Database clients and generated database types belong in `src/db`.
- Cache clients belong in `src/cache`.
- Broad third-party setup, generic internal utilities, and shared infrastructure (e.g. WebSocket connection manager)
  belong in `src/libs`.
- **Do NOT create a `src/services/` directory.** Everything that would go there belongs in `src/libs` instead.

Do not put code here just because it is reusable. Reusable code belongs here only when it has a clear feature/domain
owner.

## Core Rule

Routes are the HTTP boundary. Features are the application boundary. Database files are the persistence boundary.

- A route validates transport input, reads request context, calls module functions, and returns a response.
- A module function expresses a use case and coordinates domain logic, cross-feature calls, and db calls.
- A query reads data.
- A mutation writes data or changes state.
- Raw database logic should not be hidden inside route handlers or use-case functions when it belongs in the db layer.

## Suggested Shape

```txt
src/features/example/
  modules/
    create-example/
      index.ts
      schemas/
        create-example.schema.ts
      types/
    get-example/
      index.ts
  db/
    queries/
      get-by-id.query.ts
      get-many.query.ts
    mutations/
      create-example.mutation.ts
      update-example.mutation.ts
  schemas.ts
  types/
  helpers/
  constants/
  cron/
  webhooks/
  ws/
  __tests__/
```

This shape is a starting point, not a requirement. Use only the folders a domain actually needs. Small domains might
only need a `schemas.ts` file or one module folder. Infrastructure-style domains might not need a `db` folder.

### WebSocket (`ws/`)

When a domain needs real-time capabilities, add a `ws/` folder inside the feature. This mirrors the `db/` pattern:

- `ws/emitters.ts` -- functions to push data to connected users via the global `wsManager` from
  `@backend/libs/websocket`.
- `ws/handlers.ts` -- incoming WebSocket message handlers for domain-specific topics.

Feature `ws/` code should only import from `@backend/libs/websocket` -- never use raw WebSocket internals directly.

## Modules

Use `modules/<module-name>/` for domain use cases and capabilities.

Each module should have:

- `index.ts` as the module entrypoint.
- Supporting folders with clear purpose when needed, such as `schemas/`, `types/`, `helpers/`, `mappers/`, or
  `constants/`.
- Tests colocated with the code they cover, either beside a file or in `__tests__/` for larger flows.

Avoid loose supporting files directly inside the module when a folder communicates purpose better. Prefer this:

```txt
modules/signup/
  index.ts
  schemas/
    signup.schema.ts
  types/
    email-verification-required.type.ts
```

Over this:

```txt
modules/signup/
  index.ts
  signup.schema.ts
  email-verification-required.type.ts
```

Keep `index.ts` focused on the public module behavior. If it grows large, extract private helpers into clearly named
folders inside the same module before reaching for a broader shared abstraction.

## Routes

Domain HTTP endpoints should live in `src/routes/<domain>/index.ts`.

Route files should stay thin:

- Use the app's authenticated Hono helper for authenticated route groups.
- Use a plain Hono app for public route groups.
- Import schemas and module functions from the owning domain.
- Validate request bodies, query params, route params, headers, and form data before using them.
- Read validated input through the validation middleware's typed API.
- Use descriptive route params such as `:resourceId` or `:membershipId`; avoid generic `:id`.
- Throw typed application errors and let global error middleware serialize them.
- Move logic into the owning module when a route handler starts doing more than request/response coordination.

When adding a routed domain, mount it in the central routes registry and update any exported route/client types that are
used by the frontend or SDK consumers.

## Validation And Schemas

Use Zod for request and operation validation.

Preferred schema locations:

- `modules/<module>/schemas/<module>.schema.ts` for schemas specific to one module.
- `db/mutations/*.mutation.ts` for schemas tightly coupled to a write operation.
- `db/queries/*.query.ts` for schemas tightly coupled to a read/filter operation.
- `schemas.ts` for domain-wide schemas shared by multiple modules or routes.

Avoid large route-local schemas when the shape belongs to the domain. A small route-only schema is fine when it only
adapts an external transport shape and does not represent domain behavior.

## Database Access

Keep persistence code explicit and easy to find:

- Put reads in `db/queries`.
- Put writes and state changes in `db/mutations`.
- Use the app's ORM for inserts by default, unless a transaction or complex setup calls for a lower-level query builder.
- Use the app's query builder for complex reads and composed queries.
- Use the shared pagination helper for paginated reads when available.
- Keep request/transport concerns out of db files.

Module functions should call db functions instead of reaching directly into ORM/query-builder APIs unless the module is
deliberately acting as low-level infrastructure and the local pattern already supports that.

## Errors And Permissions

Use the shared error classes from `src/middleware/error` instead of hand-rolled response objects.

- Use application errors for domain failures such as not found, invalid state, or bad request.
- Use auth errors for authentication/session failures.
- Use authorization errors for missing permissions.
- Let validation errors come from schema parsing and validation middleware.
- Map database failures only when callers need a clearer application-level error.

Do not add broad `try/catch` blocks just to return JSON. Let errors bubble to the global Hono error handler unless the
route must translate an external service failure into a specific application error.

Use the shared permission middleware when a route needs an explicit action/subject check. Authentication establishes who
the user is; permission checks decide whether that user can perform the action.

## Context And External Services

Shared runtime services should be initialized centrally and exposed through app context or a clearly owned service
layer. Module code should depend on the smallest useful surface:

- Pass identifiers and domain data into module functions instead of passing the entire request context by default.
- Keep external provider SDK details in adapters, services, or module-owned helpers.
- Keep long-lived clients and connection setup outside module use cases.
- Prefer explicit input objects for module functions so call sites show what the use case depends on.

## Cross-Feature Dependencies

Cross-feature calls are allowed when one domain clearly orchestrates another domain's public capability. Keep the
dependency intentional and easy to name.

Prefer this:

```txt
feature-a/modules/do-thing -> feature-b/modules/public-use-case
```

Avoid this:

```txt
feature-a/modules/do-thing -> feature-b/db/mutations/private-detail
feature-a/modules/do-thing -> feature-b/modules/some-use-case/helpers/internal-helper
```

If two domains start sharing significant internal code, promote the shared behavior into a clearer owner: a shared
feature, domain helper, service, library, or package.

## Testing

Tests should stay close to the code they cover.

- Put unit tests next to the source file as `*.test.ts`.
- Put integration or end-to-end tests inside `modules/<module>/__tests__/`.
- Use Vitest globals directly when the project config provides them.
- Prefer Arrange-Act-Assert structure for test bodies.
- Create test data dynamically through real db mutations and queries.
- Prefer real db-layer functions from `db/queries` and `db/mutations` over mocked database calls.
- Keep tests type-safe. Do not use `as any` or `: any`.

Scale tests with risk. A simple schema change may only need focused unit coverage. A cross-feature flow, state
transition, database constraint, or public route contract should have broader tests.

## Adding A New Domain

Use this checklist when adding a new backend domain:

1. Create `src/features/<domain>`.
2. Add only the folders the domain needs.
3. Create `src/routes/<domain>/index.ts` if the domain has an HTTP surface.
4. Mount the route group in the central routes registry.
5. Keep schemas, module functions, db queries, and db mutations in their owning layers.
6. Export or document the smallest public surface other domains should call.
7. Add focused tests for behavior that is stateful, shared, risky, or part of a public contract.

## Adding A New Use Case

Use this checklist when adding a module use case to an existing domain:

1. Identify the owning domain.
2. Add `modules/<module>/index.ts`.
3. Add colocated `schemas/`, `types/`, or other purpose folders when supporting files are needed.
4. Add reads to `db/queries` and writes to `db/mutations`.
5. Keep the route thin: validate, read context, call the module, return JSON.
6. Throw typed application errors instead of hand-rolled error responses.
7. Add or update co-located tests when the behavior warrants it.

## Agentic Rules

When an AI agent changes backend feature code:

- Start by identifying the feature boundary and keep edits inside it when possible.
- Read the owning route file and the relevant module/db files before editing behavior.
- Do not put business logic in routes when it belongs in a module function.
- Do not put raw db access in module functions when it belongs in `db/queries` or `db/mutations`.
- Prefer existing schemas, helpers, and db functions before adding new ones.
- Preserve public route behavior. If a route response or path changes, update consumers and tests in the same change.
- Check imports for boundary leaks. Cross-feature imports should target clear public modules, not incidental internals.
- Run the most targeted available backend checks for the affected feature, then broaden checks when changes cross
  feature or route boundaries.
