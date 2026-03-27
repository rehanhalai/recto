FROM node:22-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# Copy workspace manifests first for better layer caching.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/server/package.json apps/server/package.json
COPY packages/assets/package.json packages/assets/package.json
COPY packages/types/package.json packages/types/package.json

RUN pnpm install --frozen-lockfile

# Copy only server and runtime workspace dependencies.
COPY apps/server apps/server
COPY packages/assets packages/assets
COPY packages/types packages/types

RUN pnpm --filter @recto/server build


FROM node:22-alpine AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production

RUN corepack enable

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server ./apps/server
COPY --from=builder /app/packages/assets ./packages/assets
COPY --from=builder /app/packages/types ./packages/types

EXPOSE 8080

CMD ["sh", "-c", "if [ -f /app/apps/server/dist/main.js ]; then node /app/apps/server/dist/main.js; elif [ -f /app/apps/server/dist/src/main.js ]; then node /app/apps/server/dist/src/main.js; elif [ -f /app/dist/main.js ]; then node /app/dist/main.js; else echo 'No compiled Nest entrypoint found'; find /app -maxdepth 6 -type f | grep '/main\\.js$' || true; exit 1; fi"]
