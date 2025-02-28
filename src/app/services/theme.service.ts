import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OverlayContainer } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  
  constructor(private overlayContainer: OverlayContainer) {
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
    document.body.classList.add(isDark ? 'dark-theme' : 'light-theme');
    
    // Apply custom CSS variables based on theme
    if (isDark) {
      document.documentElement.style.setProperty('--background-color', '#303030');
      document.documentElement.style.setProperty('--text-color', '#ffffff');
    } else {
      document.documentElement.style.setProperty('--background-color', '#fafafa');
      document.documentElement.style.setProperty('--text-color', '#000000');
    }

    // Apply theme to overlay container (for dialogs, menus, etc.)
    const overlayContainerClasses = this.overlayContainer.getContainerElement().classList;
    overlayContainerClasses.remove('light-theme', 'dark-theme');
    overlayContainerClasses.add(isDark ? 'dark-theme' : 'light-theme');
  }
  
  toggleTheme(): void {
    this.setDarkTheme(!this.isDarkTheme.value);
  }
}
