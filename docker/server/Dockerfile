# Build stage
FROM node:22-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx nx build server
RUN npx nx build shared

# Production stage
FROM node:22-alpine AS runner

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY --from=builder /app/dist/apps/server ./
COPY --from=builder /app/node_modules ./node_modules

RUN npm rebuild better-sqlite3

EXPOSE 3000

CMD ["node", "main.js"]
