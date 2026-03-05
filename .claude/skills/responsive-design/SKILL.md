---
name: Responsive Design
description: Best practices and coding standards for Responsive Design.
---

## Responsive Design

### 1 Mobile-First CSS Strategy

Design for the **smallest screen first**, then add complexity for larger viewports:

```css
/* Base: mobile (< 768px) */
.layout {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: var(--space-sm);
}

.sidebar {
  width: 100%;
  order: -1; /* sidebar stacks on top on mobile */
}

/* Tablet (≥ 768px) */
@media (min-width: 768px) {
  .layout {
    flex-direction: row;
  }
  .sidebar {
    width: 50%;
    order: initial;
  }
}

/* Desktop (≥ 1024px) */
@media (min-width: 1024px) {
  .sidebar {
    width: 35%;
  }
}

/* Wide desktop (≥ 1440px) */
@media (min-width: 1440px) {
  .layout {
    max-width: 1400px;
    margin: 0 auto;
  }
}
```

### 2 Responsive Patterns

| Pattern                          | Mobile                                        | Desktop                       |
| -------------------------------- | --------------------------------------------- | ----------------------------- |
| **Split layout** (list + detail) | Stack vertically, detail on top               | Side-by-side                  |
| **Navigation**                   | Hamburger menu or bottom tabs                 | Full horizontal nav bar       |
| **Data tables**                  | Hide non-essential columns, horizontal scroll | Full columns                  |
| **Modals/Dialogs**               | Full-screen overlays                          | Centered floating dialogs     |
| **Forms**                        | Single column                                 | Two-column grid               |
| **Dropdowns**                    | `position: fixed` full-width                  | `position: absolute` anchored |

### 3 Angular-Specific Responsive Tips

```typescript
// ✅ Use CSS, not TypeScript, for responsive layout
// Avoid: checking window.innerWidth in components
// Prefer: @media queries + CSS custom properties

// ✅ If you truly need screen size in logic, use a signal-based service:
@Injectable({ providedIn: 'root' })
export class BreakpointService {
  readonly isMobile = signal(window.innerWidth < 768);

  constructor() {
    const mq = window.matchMedia('(max-width: 767px)');
    mq.addEventListener('change', (e) => this.isMobile.set(e.matches));
  }
}
```

### 4 CSS Best Practices for Responsive

- Use `rem` / `em` for spacing and font sizes — never `px` for text
- Use `min()`, `max()`, `clamp()` for fluid sizing: `font-size: clamp(0.875rem, 2vw, 1.125rem)`
- Use `border-inline-start/end` instead of `left/right` for RTL compatibility
- Use CSS Grid for page layouts, Flexbox for component layouts
- Test at 320px, 768px, 1024px, and 1440px breakpoints minimum
- Use `overflow-x: auto` on tables and horizontal lists for mobile
- Touch targets must be at least **44×44px** (Apple HIG) / **48×48dp** (Material)
- Use `@media (hover: hover)` to apply hover effects only on devices that support them:

```css
@media (hover: hover) {
  .btn:hover {
    background-color: var(--color-primary-hover);
  }
}
```

---

