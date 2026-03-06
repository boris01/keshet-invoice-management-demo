import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { PdfViewerComponent } from '../../../../shared/components/pdf-viewer/pdf-viewer.component';

@Component({
  selector: 'app-pdf-side-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PdfViewerComponent],
  template: `
    <div class="panel-card">
      <app-pdf-viewer
        [fileUrl]="fileUrl()"
        (closeClicked)="panelClose.emit()"
        (expandClicked)="expand.emit()"
      />
    </div>
  `,
  styleUrl: './pdf-side-panel.component.css',
})
export class PdfSidePanelComponent {
  readonly fileUrl = input('');
  readonly panelClose = output<void>();
  readonly expand = output<void>();
}
