---
name: Nx Monorepo
description: Best practices and coding standards for Nx Monorepo.
---

## Nx Monorepo

### 1 Shared Libraries

Place shared DTOs, enums, and interfaces in `libs/shared/`. Configure path aliases in `tsconfig.base.json`:

```json
"paths": {
  "@my-workspace/shared": ["libs/shared/src/index.ts"]
}
```

### 2 Asset Configuration

When bundling static files (e.g., Web Worker scripts) into the Angular build, add them to `project.json`:

```json
{
  "glob": "pdf.worker.min.mjs",
  "input": "node_modules/pdfjs-dist/build",
  "output": "/assets"
}
```

### 3 Build Commands

```bash
npx nx build <project> --prod    # Production build
npx nx serve <project>           # Dev server
npx nx test <project>            # Unit tests
npx nx lint <project>            # Linting
```

---

