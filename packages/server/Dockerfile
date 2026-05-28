FROM node:20-slim

RUN corepack enable

ARG SLOCK_RELEASE_SHA=""
ENV SLOCK_RELEASE_SHA=$SLOCK_RELEASE_SHA

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy package manifests
COPY packages/shared/package.json packages/shared/
COPY packages/server/package.json packages/server/

# Install all dependencies (tsx needed to run TypeScript source)
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/shared/ packages/shared/
COPY packages/server/ packages/server/
COPY docs/ docs/

EXPOSE 3001

# Entrypoint: push DB schema then start server
RUN chmod +x packages/server/entrypoint.sh
CMD ["packages/server/entrypoint.sh"]
