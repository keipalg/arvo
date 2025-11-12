FROM node:22 AS base

FROM base AS builder

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy the entire monorepo (except node_modules, dist, etc.)
COPY . .

# Install all dependencies (including workspaces)
RUN npm install

# Build shared and backend packages using workspace scripts
RUN npm run build:shared
RUN npm run build:backend

# Prune dev dependencies (optional, but recommended for production)
RUN npm prune --production

# --- Minimal runner using distroless ---
FROM gcr.io/distroless/nodejs22-debian12 AS runner
WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/backend/dist /app/dist
COPY --from=builder /app/apps/backend/package.json /app/package.json
COPY --from=builder /app/packages/shared /app/packages/shared

USER nonroot
EXPOSE 8080

CMD ["dist/index.js"]