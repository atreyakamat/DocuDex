FROM node:20-alpine AS builder
WORKDIR /app

# Copy root workspace files
COPY package*.json ./
COPY tsconfig.base.json ./

# Copy shared types
COPY packages/shared-types ./packages/shared-types

# Copy backend
COPY apps/backend ./apps/backend

# Install all dependencies
RUN npm install --workspace=packages/shared-types --workspace=apps/backend

# Build shared types then backend
RUN npm run build --workspace=packages/shared-types && \
    npm run build --workspace=apps/backend

# ─── Production image ─────────────────────────────────
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules

RUN mkdir -p /app/uploads

EXPOSE 5000
CMD ["node", "apps/backend/dist/index.js"]
