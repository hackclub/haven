# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Full dependency tree (including devDependencies) for the build
FROM base AS deps
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN npm ci

# Runtime-only dependency tree
FROM base AS prod-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM deps AS build
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY drizzle ./drizzle
COPY scripts ./scripts

# The standalone adapter binds to localhost by default, which is unreachable
# from outside the container.
ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

USER node

# Migrations run at boot, before the server accepts traffic. If they fail the
# container exits non-zero rather than serving against a stale schema.
CMD ["sh", "-c", "node ./scripts/migrate.mjs && exec node ./dist/server/entry.mjs"]
