import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Navbar } from '../ui/navbar';
import { Footer } from '../ui/footer';

@Component({
  selector: 'shop-layout',
  imports: [CommonModule, RouterModule, Navbar, Footer, RouterOutlet],
  templateUrl: './shop-layout.html',
  styleUrl: './shop-layout.scss'
})
export class ShopLayout {}
