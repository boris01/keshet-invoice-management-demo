import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  effect,
  viewChild,
  ElementRef,
  DestroyRef,
  inject,
} from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';

const PDFJS_CONFIG = {
  standardFontDataUrl: '/assets/standard_fonts/',
  cMapUrl: '/assets/cmaps/',
  cMapPacked: true,
  wasmUrl: '/assets/wasm/',
  useSystemFonts: false,
  disableFontFace: true,
};

@Component({
  selector: 'app-pdf-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pdf-container">
      <div class="pdf-toolbar" [class.hidden]="!showToolbar()">
        <button class="pdf-btn" (click)="expandClicked.emit()" aria-label="Open in detail view">&#x2197;</button>
        <button class="pdf-btn" (click)="closeClicked.emit()" aria-label="Close PDF preview">&#x2715;</button>
      </div>
      <div class="pdf-canvas-wrapper" #wrapper>
        <canvas #pdfCanvas role="img" [attr.aria-label]="'PDF document, page ' + currentPage() + ' of ' + totalPages()"></canvas>
      </div>
      <div class="pdf-pagination" role="navigation" aria-label="PDF pages">
        @for (page of pages(); track page) {
          <button
            class="dot"
            [class.active]="page === currentPage()"
            [attr.aria-label]="'Page ' + page + ' of ' + totalPages()"
            [attr.aria-current]="page === currentPage() ? 'page' : null"
            (click)="goToPage(page)"
          ></button>
        }
      </div>
    </div>
  `,
  styleUrl: './pdf-viewer.component.css',
})
export class PdfViewerComponent {
  readonly fileUrl = input<string>('');
  readonly showToolbar = input(true);
  readonly expandClicked = output<void>();
  readonly closeClicked = output<void>();

  readonly pdfCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('pdfCanvas');
  readonly wrapper = viewChild.required<ElementRef<HTMLElement>>('wrapper');

  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly pages = signal<number[]>([]);

  private pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;
  private lastRenderedWidth = 0;
  private rendering = false;
  private pendingRender: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const url = this.fileUrl();
      if (url) {
        this.loadPdf(url);
      }
    });

    this.destroyRef.onDestroy(() => {
      this.resizeObserver?.disconnect();
    });
  }

  private setupResizeObserver(): void {
    this.resizeObserver?.disconnect();
    const el = this.wrapper().nativeElement;
    this.resizeObserver = new ResizeObserver(() => {
      const width = el.clientWidth;
      if (width > 0 && Math.abs(width - this.lastRenderedWidth) > 2) {
        this.renderPage(this.currentPage());
      }
    });
    this.resizeObserver.observe(el);
  }

  private async loadPdf(url: string): Promise<void> {
    try {
      this.pdfDoc = await pdfjsLib.getDocument({ url, ...PDFJS_CONFIG }).promise;
      const numPages = this.pdfDoc.numPages;
      this.totalPages.set(numPages);
      this.pages.set(Array.from({ length: numPages }, (_, i) => i + 1));
      this.currentPage.set(1);
      this.setupResizeObserver();
      await this.renderPage(1);
    } catch {
      // PDF load failed
    }
  }

  private async renderPage(pageNum: number): Promise<void> {
    if (!this.pdfDoc || this.rendering) {
      this.pendingRender = pageNum;
      return;
    }

    this.rendering = true;
    try {
      const page = await this.pdfDoc.getPage(pageNum);
      const canvas = this.pdfCanvas().nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const wrapperEl = this.wrapper().nativeElement;
      const styles = getComputedStyle(wrapperEl);
      const paddingX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const displayWidth = wrapperEl.clientWidth - paddingX;

      if (displayWidth <= 0) return;

      this.lastRenderedWidth = wrapperEl.clientWidth;

      const unscaled = page.getViewport({ scale: 1 });
      const cssScale = displayWidth / unscaled.width;
      const dpr = Math.max(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: cssScale * dpr });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${Math.round((displayWidth / unscaled.width) * unscaled.height)}px`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    } finally {
      this.rendering = false;
      const pending = this.pendingRender;
      this.pendingRender = null;
      if (pending !== null) {
        this.renderPage(pending);
      }
    }
  }

  async goToPage(pageNum: number): Promise<void> {
    this.currentPage.set(pageNum);
    await this.renderPage(pageNum);
  }
}
