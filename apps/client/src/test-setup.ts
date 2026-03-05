// Polyfill DOMMatrix for pdfjs-dist which requires it at module scope
if (typeof globalThis.DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = class DOMMatrix {
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
  (globalThis as any).Path2D = class Path2D {
    constructor() {
      return Object.create(Path2D.prototype);
    }
  };
}

// Polyfill IntersectionObserver for components using it (e.g. infinite scroll)
if (typeof globalThis.IntersectionObserver === 'undefined') {
  (globalThis as any).IntersectionObserver = class IntersectionObserver {
    constructor(private callback: IntersectionObserverCallback, private options?: IntersectionObserverInit) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  };
}
