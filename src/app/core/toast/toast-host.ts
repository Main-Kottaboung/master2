import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-host',
  imports: [CommonModule],
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastHost {
  readonly toastService = inject(ToastService);
}
