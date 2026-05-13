import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../features/auth/services/auth.service';
import { CartService } from '../features/cart/services/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  authService = inject(AuthService);
  cartService = inject(CartService);
  
  logout() {
    this.authService.logout();
    console.log(this.authService.getCurrentUser());
  }
}
