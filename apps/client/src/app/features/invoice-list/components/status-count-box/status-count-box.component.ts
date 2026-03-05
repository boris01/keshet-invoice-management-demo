import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-status-count-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="count-box"
      [class.active]="active()"
      (click)="clicked.emit()"
    >
      <span class="count">{{ count() }}</span>
      <span class="label">{{ label() }}</span>
    </button>
  `,
  styleUrl: './status-count-box.component.css',
})
export class StatusCountBoxComponent {
  readonly count = input.required<number>();
  readonly label = input.required<string>();
  readonly active = input(false);
  readonly clicked = output<void>();
}
