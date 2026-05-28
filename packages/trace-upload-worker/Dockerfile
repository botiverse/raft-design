FROM node:20-slim

RUN corepack enable

ARG SLOCK_RELEASE_SHA=""
ENV SLOCK_RELEASE_SHA=$SLOCK_RELEASE_SHA

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.json ./
COPY packages/trace-upload-worker/package.json packages/trace-upload-worker/

ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
RUN pnpm install --frozen-lockfile

COPY packages/trace-upload-worker/ packages/trace-upload-worker/

EXPOSE 3000

CMD ["pnpm", "--filter", "@slock-ai/trace-upload-worker", "start"]
