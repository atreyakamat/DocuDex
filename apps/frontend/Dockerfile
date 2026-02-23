FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages/shared-types ./packages/shared-types
COPY apps/frontend ./apps/frontend

RUN npm install --workspace=packages/shared-types --workspace=apps/frontend
RUN npm run build --workspace=packages/shared-types && \
    npm run build --workspace=apps/frontend

# ─── Serve with nginx ─────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
