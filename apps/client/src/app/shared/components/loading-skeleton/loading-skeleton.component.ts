import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="skeleton-table">
      @for (row of rows; track row) {
        <div class="skeleton-row">
          <div class="skeleton-cell skeleton-circle"></div>
          <div class="skeleton-cell skeleton-text-group">
            <div class="skeleton-line long"></div>
            <div class="skeleton-line short"></div>
          </div>
          <div class="skeleton-cell skeleton-line medium"></div>
          <div class="skeleton-cell skeleton-line small"></div>
        </div>
      }
    </div>
  `,
  styleUrl: './loading-skeleton.component.css',
})
export class LoadingSkeletonComponent {
  readonly rows = Array.from({ length: 8 }, (_, i) => i);
}
