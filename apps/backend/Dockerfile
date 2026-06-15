# syntax=docker/dockerfile:1

ARG NODE_VERSION=24-alpine

FROM node:${NODE_VERSION} AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json nx.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

# Generate the Prisma client, backend exported types, and enum declarations
# before the build. Use the nx target so @hype-stack/enums:build runs first;
# `pnpm --filter @hype-stack/backend run generate` skips that dependency graph.
RUN pnpm generate

RUN pnpm nx build backend

# Drop the dev toolchain (nx, vite, etc.) but keep every workspace project's
# prod deps. Do NOT use `pnpm prune --prod` here: run from the repo root it
# only inspects the root package and deletes each workspace's node_modules,
# including the backend's @hono/node-server, which breaks the runtime require.
# `pnpm install --prod` is workspace-aware and keeps those deps. CI=true skips
# the no-TTY confirmation pnpm shows before purging modules.
RUN CI=true pnpm install --prod --frozen-lockfile --ignore-scripts

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@10 --activate

# In a pnpm monorepo the backend's deps are symlinks in apps/backend/node_modules
# pointing into the root .pnpm store, and workspace packages (e.g. @hype-stack/enums)
# resolve to their built dist in packages/. The build externalizes every
# dependency, so all three must be present at runtime: the root node_modules
# store, the packages/ workspace libs, and the backend itself. Other apps
# (admin, frontend, worker) are never reached at runtime, so we skip them.
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/backend ./apps/backend

EXPOSE 3000

CMD ["node", "apps/backend/dist/main.js"]
