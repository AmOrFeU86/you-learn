import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-nav-header',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    RouterLinkActive, 
    ThemeToggleComponent, 
    MatToolbarModule,
    MatButtonModule
  ],
  templateUrl: './nav-header.component.html',
  styleUrls: ['./nav-header.component.scss']
})
export class NavHeaderComponent {}
