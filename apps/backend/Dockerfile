# syntax=docker/dockerfile:1

ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS builder
WORKDIR /app

# Install dependencies (root workspace)
COPY package.json package-lock.json nx.json tsconfig.base.json ./
COPY apps ./apps
COPY libs ./libs

RUN npm ci


# Generate the Prisma client and prisma-kysely types before the build.
# Without this, "@prisma/client" has no PrismaClient export and the Kysely
# query-builder types are missing, so the backend build fails to typecheck.
RUN pnpm --filter @hype-stack/backend run generate

# Build backend (uses Nx target)
RUN npm run backend:build

# We need to set CI=true to limit node_modules to production dependencies.
RUN CI=true pnpm prune --prod

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy runtime artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/src/assets ./apps/backend/src/assets

EXPOSE 2138

CMD ["node", "apps/backend/dist/main.js"]


