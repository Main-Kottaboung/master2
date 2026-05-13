import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-admin-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-header.html',
  styleUrl: './admin-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminHeader {
  readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
