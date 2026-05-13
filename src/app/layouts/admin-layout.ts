import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AdminHeader } from '../features/admin/components/admin-header';
import { AdminSidebar } from '../features/admin/components/admin-sidebar';
import { ToastHost } from '../core/toast/toast-host';

@Component({
  selector: 'admin-layout',
  imports: [CommonModule, RouterModule, RouterOutlet, AdminHeader, AdminSidebar, ToastHost],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayout {}
