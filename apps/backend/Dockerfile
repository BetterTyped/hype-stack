# syntax=docker/dockerfile:1

ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS builder
WORKDIR /app

# Install dependencies (root workspace)
COPY package.json package-lock.json nx.json tsconfig.base.json ./
COPY apps ./apps
COPY libs ./libs

RUN npm ci

# Build backend (uses Nx target)
RUN npm run backend:build

# Prune dev dependencies to keep runtime image small
RUN npm prune --omit=dev

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


