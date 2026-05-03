<h1 align="center">

<img src="./.github/assets/header.png" alt="Hype Stack" />

</h1>

<h3 align="center">Ship web + desktop apps from one codebase.<br/>Fully typed. AI-ready. Production-grade.</h3>

<p align="center">
Stop wiring together auth, permissions, realtime, and deployment targets.<br/>
Start building your product on day one.
</p>

&nbsp;

## TL;DR

- 🖥️ **One codebase** → Web, macOS, Windows, Linux apps
- 🔒 **Auth, orgs, RBAC, invitations** — wired and working
- 🔗 **True end-to-end types** — frontend imports backend contracts directly
- 🤖 **Built for AI agents** — vertical structure, Cursor rules, instant feedback loops
- ⚡ **Rust-powered tooling** — sub-second lint, format, and HMR

&nbsp;

## Preview

<!-- TODO: Add a GIF or screenshot of the running app here -->
<!-- Suggested: dashboard view, login screen, or desktop app window -->

![App Preview](./.github/assets/preview.png)

&nbsp;

<p align="center">
	<a href="https://github.com/sponsors/prc5?tier=Platinum">
		<picture>
			<img width="830" src="https://raw.githubusercontent.com/prc5/sponsors/main/assets/Platinum.png" alt="Platinum sponsor banner"/>
		</picture>
	</a>
</p>

<p align="center">
	<a href="https://github.com/sponsors/prc5?tier=Platinum">
		<picture>
			<img width="830" src="https://raw.githubusercontent.com/prc5/sponsors/main/packages/platinum/sponsorkit/sponsors.svg" alt="Platinum sponsors"/>
		</picture>
	</a>
</p>

## Quick Start

```bash
# Clone and install
git clone https://github.com/BetterTyped/hype-stack.git
cd hype-stack
pnpm install

# Start infrastructure
cd apps/backend && docker compose up -d && cd ../..

# Run migrations
pnpm --filter backend exec prisma migrate deploy
pnpm --filter backend exec prisma generate

# Launch everything
pnpm dev
```

> Web app runs on Vite. Backend on Hono. Both hot-reload instantly.

&nbsp;

## The Problem

Every new product starts the same way:

- ❌ Weeks spent wiring auth, sessions, and org management
- ❌ Separate repos for web and desktop — diverging logic, double maintenance
- ❌ Types break silently between frontend and backend
- ❌ AI tools struggle with scattered, deeply nested project structures
- ❌ "Templates" that give you a login page and nothing else

&nbsp;

## The Solution

Hype Stack gives you a **production architecture**, not a starter kit:

- ✅ Auth, OAuth, email verification, password reset — done
- ✅ Organizations, invitations, role-based access — done
- ✅ Realtime notifications over typed WebSockets — done
- ✅ File uploads with S3-compatible storage — done
- ✅ Desktop builds with signing, auto-update, and native menus — done

You write features. Everything else is already handled.

&nbsp;

<p align="center">
	<a href="https://github.com/sponsors/prc5?tier=Gold">
		<picture>
			<img width="830" src="https://raw.githubusercontent.com/prc5/sponsors/main/assets/Gold.png" alt="Gold sponsor banner"/>
		</picture>
	</a>
</p>

<p align="center">
	<a href="https://github.com/sponsors/prc5?tier=Gold">
		<picture>
			<img width="830" src="https://raw.githubusercontent.com/prc5/sponsors/main/packages/gold/sponsorkit/sponsors.svg" alt="Gold sponsors"/>
		</picture>
	</a>
</p>

## Why This Isn't Just Another Template

Most templates solve **setup**. Hype Stack solves **architecture**.

### 🧠 AI-Native Structure

The codebase follows a [vertical architecture](https://tkdodo.eu/blog/the-vertical-codebase) — each feature owns its routes, UI, data access, types, and tests. AI agents work in small, isolated areas instead of navigating tangled cross-cutting layers.

Bundled Cursor rules and agent skills teach LLMs exactly how to add features, handle errors, and follow conventions.

### 🔗 Zero-Codegen Type Safety

No OpenAPI specs. No code generators. No stale types.

The frontend imports `@hype-stack/backend` as a workspace dependency. HTTP routes and WebSocket events flow through a typed bridge — change a backend response, and TypeScript catches every mismatched consumer instantly.

### 🖥️ One Product, Every Platform

Same React app runs as a web SPA and an Electron desktop app. One `VITE_APP_TYPE` flag controls the split. Electron Forge handles macOS signing, Windows installers, Linux packages, and GitHub release publishing.

### ⚡ Speed as a Feature

Vite 8, OXC linting, `oxfmt` formatting, Nx caching. The feedback loop is measured in milliseconds, not minutes — for you and for AI agents iterating on your code.

&nbsp;

<p align="center">
	<a href="https://github.com/sponsors/prc5?tier=Silver">
		<picture>
			<img width="830" src="https://raw.githubusercontent.com/prc5/sponsors/main/assets/Silver.png" alt="Silver sponsor banner"/>
		</picture>
	</a>
</p>

<p align="center">
	<a href="https://github.com/sponsors/prc5?tier=Silver">
		<picture>
			<img width="830" src="https://raw.githubusercontent.com/prc5/sponsors/main/packages/silver/sponsorkit/sponsors.svg" alt="Silver sponsors"/>
		</picture>
	</a>
</p>

## How It Works

```
┌─────────────────────────────────────────────────┐
│                   pnpm monorepo                  │
├─────────────────┬───────────────────────────────┤
│  apps/frontend  │  apps/backend                 │
│  ─────────────  │  ────────────                 │
│  React 19       │  Hono                         │
│  TanStack Router│  Prisma + Kysely              │
│  HyperFetch SDK │  WorkOS Auth                  │
│  Electron Forge │  Typed WebSockets             │
│  shadcn/ui      │  S3 Storage                   │
├─────────────────┴───────────────────────────────┤
│  packages/enums — shared permissions & config   │
└─────────────────────────────────────────────────┘
```

**Frontend** calls the backend through a fully-typed SDK generated from Hono route definitions. WebSocket events use the same type bridge. Permissions resolve from WorkOS roles into CASL abilities — enforced on both server and client.

&nbsp;

## Features

### 🔐 Authentication & Identity

- Email/password, Google OAuth (via WorkOS)
- Email verification, password reset flows
- Sealed session cookies
- Multi-organization support with org switching

### 👥 Organizations & Collaboration

- Create and manage organizations
- Invite members via email with token-based accept flow
- Role-based access control (Admin, Member — extensible)
- Permission gates on routes and UI components

### 🔔 Realtime

- WebSocket infrastructure with typed events
- Live notifications (push + mark-read)
- Invitation events for instant collaboration UX

### 📁 Storage & Uploads

- S3-compatible object storage (RustFS in dev, any S3 in production)
- Avatar uploads with size/type validation
- Typed file middleware with memory and disk strategies

### 🖥️ Desktop App

- macOS (DMG + code signing + notarization)
- Windows (Squirrel installer + auto-update)
- Linux (deb + rpm)
- Native window controls, menus, clipboard, persistent store

### 📊 Observability

- Sentry error tracking (web + Electron main/renderer)
- PostHog product analytics
- Structured logging on backend

### 🧪 Testing

- Vitest unit/integration tests for backend features
- React Testing Library for frontend components
- Playwright E2E with isolated test infrastructure
- Dedicated Docker Compose for test databases

### 🤖 AI Development Experience

- 15+ Cursor rules defining conventions for every layer
- Agent skills for brainstorming, Hono, Prisma, frontend design
- Vertical structure minimizes blast radius per change
- Fast tooling gives agents sub-second feedback

&nbsp;

## Tech Stack

| Layer      | Technology                                                |
| ---------- | --------------------------------------------------------- |
| Frontend   | React 19, TanStack Router, Tailwind v4, shadcn/ui, Motion |
| Backend    | Hono, Prisma, Kysely, Zod                                 |
| Auth       | WorkOS (sessions, OAuth, orgs)                            |
| Realtime   | Hono WebSockets, HyperFetch Sockets                       |
| Desktop    | Electron Forge (macOS, Windows, Linux)                    |
| Database   | PostgreSQL 17 + pgvector                                  |
| Cache      | Valkey (Redis-compatible)                                 |
| Storage    | S3-compatible (RustFS / AWS / any provider)               |
| Tooling    | Nx, Vite 8, OXC, pnpm, TypeScript 6                       |
| Monitoring | Sentry, PostHog                                           |

&nbsp;

## Development

### Docker Services

```bash
cd apps/backend
docker compose up -d
```

| Service        | Port | Purpose                             |
| -------------- | ---- | ----------------------------------- |
| Postgres       | 5436 | Database (PostgreSQL 17 + pgvector) |
| Valkey         | 6381 | Cache                               |
| RustFS         | 9000 | S3-compatible object storage        |
| RustFS Console | 9001 | Storage web UI                      |

### Commands

```bash
pnpm dev              # Start frontend + backend with hot-reload
pnpm build            # Production build
pnpm lint             # OXC linting
pnpm format           # OXC formatting
pnpm typecheck        # Full type checking
pnpm test             # Run all tests
```

### Testing

```bash
cd apps/backend
pnpm test:setup       # Start test containers + migrate + generate
pnpm test             # Run tests
pnpm test:clean       # Tear down test infrastructure
```

&nbsp;

## Our Sponsors

<p align="center">
	<a href="https://github.com/sponsors/prc5">
		<img src="https://raw.githubusercontent.com/prc5/sponsors/main/packages/other/sponsorkit/sponsors.svg?raw=true" alt="Sponsors" />
	</a>
</p>

&nbsp;

---

<p align="center">
<strong>Stop assembling infrastructure. Start shipping product.</strong><br/><br/>
Hype Stack gives you the architecture that takes teams months to build —<br/>
typed, tested, and ready for AI-assisted development from commit one.
</p>

## License

[MIT](https://github.com/BetterTyped/hype-stack/blob/main/License.md)
