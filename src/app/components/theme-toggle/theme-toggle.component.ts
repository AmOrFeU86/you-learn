import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="theme-toggle-button" (click)="toggleTheme()">
      <span *ngIf="isDarkTheme">☀️</span>
      <span *ngIf="!isDarkTheme">🌙</span>
    </button>
  `,
  styles: [`
    .theme-toggle-button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.5rem;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      transition: background-color 0.3s;
    }
    
    .theme-toggle-button:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
    
    :host-context(.dark-theme) .theme-toggle-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
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
