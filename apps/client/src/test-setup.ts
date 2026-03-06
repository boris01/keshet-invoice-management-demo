// Polyfill DOMMatrix for pdfjs-dist which requires it at module scope
if (typeof globalThis.DOMMatrix === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any)['DOMMatrix'] = class DOMMatrix {
    constructor() {
      return Object.create(DOMMatrix.prototype);
    }
    static fromMatrix() {
      return new DOMMatrix();
    }
  };
}

// Polyfill Path2D for pdfjs-dist
if (typeof globalThis.Path2D === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any)['Path2D'] = class Path2D {
    constructor() {
      return Object.create(Path2D.prototype);
    }
  };
}

// Polyfill IntersectionObserver for components using it (e.g. infinite scroll)
if (typeof globalThis.IntersectionObserver === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any)['IntersectionObserver'] = class IntersectionObserver {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) { /* noop stub */ }
    observe() { /* noop stub */ }
    unobserve() { /* noop stub */ }
    disconnect() { /* noop stub */ }
    takeRecords() { return []; }
  };
}
