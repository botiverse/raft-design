FROM node:20-slim AS builder

RUN corepack enable

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy package manifests
COPY packages/shared/package.json packages/shared/
COPY packages/web/package.json packages/web/

# Install dependencies (skip Electron binary download — not needed for web)
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared/ packages/shared/
COPY packages/web/ packages/web/

# Build web app — VITE_API_URL is baked in at build time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter @slock-ai/web run build

# --- Production stage: nginx ---
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/packages/web/dist /usr/share/nginx/html

# Copy nginx config
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
