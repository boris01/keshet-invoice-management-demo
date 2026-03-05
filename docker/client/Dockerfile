# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx nx build client

# Production stage
FROM nginx:alpine AS runner

COPY --from=builder /app/dist/apps/client/browser /usr/share/nginx/html
COPY docker/client/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
