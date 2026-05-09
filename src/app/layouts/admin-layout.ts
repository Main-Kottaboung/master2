import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Navbar } from '../ui/navbar';
import { AdminSidebar } from '../ui/admin-sidebar';

@Component({
  selector: 'admin-layout',
  imports: [CommonModule, RouterModule, Navbar, AdminSidebar, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayout {}
