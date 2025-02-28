import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <button mat-mini-fab
            class="theme-toggle-button"
            (click)="toggleTheme()"
            [matTooltip]="isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'">
      <mat-icon>{{ isDarkTheme ? 'light_mode' : 'dark_mode' }}</mat-icon>
    </button>
  `,
  styles: [`
    .theme-toggle-button {
      transition: transform 0.3s;
    }
    
    .theme-toggle-button:hover {
      transform: rotate(30deg);
    }
  `]
})
export class ThemeToggleComponent implements OnInit {
  isDarkTheme = false;

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.isDarkTheme$().subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
