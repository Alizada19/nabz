# ---- Build stage ----
FROM node:24.18.1-slim AS builder

WORKDIR /app

RUN npm install -g pnpm@11

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# ---- Production stage ----
FROM node:24.18.1-slim AS production

ENV NODE_ENV=production

WORKDIR /app

RUN npm install -g pnpm@11

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile --prod --ignore-scripts \
    && npx --yes prisma@5 generate

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
