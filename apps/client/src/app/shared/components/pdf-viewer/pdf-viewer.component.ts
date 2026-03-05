import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  effect,
  viewChild,
  ElementRef,
} from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';

@Component({
  selector: 'app-pdf-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pdf-container">
      <div class="pdf-toolbar">
        <button class="pdf-btn" (click)="expandClicked.emit()" title="Expand">&#x2197;</button>
        <button class="pdf-btn" (click)="closeClicked.emit()" title="Close">&#x2715;</button>
      </div>
      <div class="pdf-canvas-wrapper">
        <canvas #pdfCanvas></canvas>
      </div>
      <div class="pdf-pagination">
        @for (page of pages(); track page) {
          <button
            class="dot"
            [class.active]="page === currentPage()"
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
  readonly expandClicked = output<void>();
  readonly closeClicked = output<void>();

  readonly pdfCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('pdfCanvas');

  readonly currentPage = signal(1);
  readonly totalPages = signal(0);
  readonly pages = signal<number[]>([]);

  private pdfDoc: pdfjsLib.PDFDocumentProxy | null = null;

  constructor() {
    effect(() => {
      const url = this.fileUrl();
      if (url) {
        this.loadPdf(url);
      }
    });
  }

  private async loadPdf(url: string): Promise<void> {
    try {
      this.pdfDoc = await pdfjsLib.getDocument(url).promise;
      const numPages = this.pdfDoc.numPages;
      this.totalPages.set(numPages);
      this.pages.set(Array.from({ length: numPages }, (_, i) => i + 1));
      this.currentPage.set(1);
      await this.renderPage(1);
    } catch {
      // PDF load failed
    }
  }

  private async renderPage(pageNum: number): Promise<void> {
    if (!this.pdfDoc) return;

    const page = await this.pdfDoc.getPage(pageNum);
    const canvas = this.pdfCanvas().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const viewport = page.getViewport({ scale: 1.2 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  }

  async goToPage(pageNum: number): Promise<void> {
    this.currentPage.set(pageNum);
    await this.renderPage(pageNum);
  }
}
