---
name: Docker & Deployment
description: Best practices and coding standards for Docker & Deployment.
---

## Docker & Deployment

### 1 Multi-Stage Builds

- **Node.js server**: `node:22-alpine` builder → `node:22-alpine` runner
  - If using native modules (e.g., `better-sqlite3`), both stages need build tools: `apk add --no-cache python3 make g++`
  - Runner must `npm rebuild <native-module>` after copying `node_modules` from builder (macOS → Linux binaries are incompatible)

- **Angular client**: `node:22-alpine` builder → `nginx:alpine` runner

### 2 Native Module Cross-Platform Gotcha

> **CRITICAL**: Native `.node` binaries (like `better-sqlite3`, `sharp`, `bcrypt`) built on macOS will not run on Linux. This causes `Exec format error (ERR_DLOPEN_FAILED)` in Docker. **Always** `npm rebuild <module>` inside the Linux container.

### 3 Nginx for Angular SPA

```nginx
server {
    listen 80;

    # API proxy
    location /api/ {
        proxy_pass http://server:3000/api/;
    }

    # SPA fallback
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # Ensure .mjs files are served correctly
    types {
        application/javascript mjs;
    }
}
```

> **Gotcha**: `.mjs` files (like PDF.js workers) default to `application/octet-stream` in Nginx, which browsers reject. Add the MIME type explicitly.

---

