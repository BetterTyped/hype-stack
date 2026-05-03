# Packages

This directory contains reusable workspace packages for the Nx monorepo. Put code here when it is shared by multiple
apps, has a stable public API, and can be built, tested, and versioned as an independent package.

## Rules

- Keep packages focused. A package should have one clear responsibility and should not contain app-specific flows,
  routes, or UI screens.
- Export public API from `src/index.ts`. Consumers should import from the package root, not from internal files.
- Keep dependencies explicit in the package `package.json`. Do not rely on another app or package bringing a dependency
  transitively.
- Use strict TypeScript and keep package code portable. Avoid direct dependencies on app runtime state, environment
  variables, or framework globals unless that is the package purpose.
- Prefer small, composable packages over large shared buckets. If code is only used by one app, keep it close to that
  app until it is genuinely shared.
- Keep build outputs out of source control. Generated files should live in package `dist` or tool-specific output
  folders.

## Nx Workflow

Use Nx project names when working with packages:

```sh
pnpm nx build <project>
pnpm nx test <project>
pnpm nx typecheck <project>
pnpm nx graph
```

For broad checks, prefer affected or targeted Nx commands instead of manually running every package.

## Adding Or Changing Packages

- Prefer Nx generators when creating new packages so project metadata, TypeScript config, and build targets stay
  consistent.
- Name packages with the workspace scope, for example `@hype-stack/enums`.
- Configure `exports`, `types`, and build output paths in `package.json` before other projects depend on the package.
- Add tests for shared behavior and run the package build/typecheck before wiring it into apps.
- Update this README when package conventions change.
