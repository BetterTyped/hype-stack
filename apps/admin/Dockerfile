# Build context is the monorepo root, not this directory:
#   docker build -f apps/admin/Dockerfile -t hype-stack-admin --build-arg VITE_API_BASE_URL=https://api.example.com .

FROM node:24.15.0-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo

# Manifests only, so `pnpm install` stays cached until a dependency changes.
# pnpm validates --frozen-lockfile against every workspace member, so all
# manifests must be present even though we only build admin.
FROM base AS deps
# pnpm-workspace.yaml carries the publicHoistPattern the apps rely on (pnpm 12
# stopped reading it from .npmrc, which is gone), so module resolution in the
# image matches local. ELECTRON_SKIP_BINARY_DOWNLOAD avoids pulling the
# Electron binary that pnpm-workspace.yaml allows but this server never uses.
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json apps/admin/
COPY apps/admin-e2e/package.json apps/admin-e2e/
COPY apps/backend/package.json apps/backend/
COPY apps/backend-e2e/package.json apps/backend-e2e/
COPY apps/frontend/package.json apps/frontend/
COPY apps/frontend-e2e/package.json apps/frontend-e2e/
COPY packages/enums/package.json packages/enums/
# Not filtered to admin: `packages/enums` builds with the `vite` in the root
# project's devDependencies, so the root workspace must be installed too.
RUN pnpm install --frozen-lockfile

FROM deps AS build
# App tsconfigs extend the root base config, which Vite's transform resolves.
COPY tsconfig.base.json tsconfig.json ./

# @hype-stack/enums resolves to ./dist, so it has to be compiled before any app
# that imports it. Kept above the build args so changing them reuses this layer.
COPY packages/enums packages/enums
RUN pnpm --filter @hype-stack/enums build

# Vite inlines VITE_* values into the client bundle at build time, so these are
# baked into the image and cannot be changed at runtime. Anything secret must
# not go here.
ARG VITE_API_BASE_URL
ARG VITE_ENVIRONMENT=production
ARG VITE_SENTRY_DNS
ARG VITE_SENTRY_AUTH_TOKEN
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT
ENV VITE_SENTRY_DNS=$VITE_SENTRY_DNS
ENV VITE_SENTRY_AUTH_TOKEN=$VITE_SENTRY_AUTH_TOKEN

# Backend is imported for types only, but its sources must exist to resolve.
COPY apps/backend apps/backend
COPY apps/admin apps/admin
RUN pnpm --filter @hype-stack/admin build:ssr

# Nitro emits a self-contained bundle whose only external imports are node:
# builtins, so the runtime image needs no node_modules and no package.json.
FROM node:24.15.0-alpine AS runtime
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
WORKDIR /app
COPY --from=build --chown=node:node /repo/apps/admin/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
