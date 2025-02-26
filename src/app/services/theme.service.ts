import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  
  constructor() {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.setDarkTheme(savedTheme === 'dark');
    } else {
      // Check if user prefers dark mode based on system settings
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDarkTheme(prefersDark);
    }
  }
  
  isDarkTheme$(): Observable<boolean> {
    return this.isDarkTheme.asObservable();
  }
  
  setDarkTheme(isDark: boolean): void {
    this.isDarkTheme.next(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Apply theme to document body
    document.body.classList.remove('light-theme', 'dark-theme');
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }
  
  toggleTheme(): void {
    this.setDarkTheme(!this.isDarkTheme.value);
  }
}
