import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Navbar } from '../ui/navbar';
import { Footer } from '../ui/footer';

@Component({
  selector: 'public-layout',
  imports: [CommonModule, RouterModule, Navbar, Footer, RouterOutlet],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.scss'
})
export class PublicLayout {}
