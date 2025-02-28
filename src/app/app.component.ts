import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavHeaderComponent } from './components/nav-header/nav-header.component';
import { ThemeService } from './services/theme.service';
import { MaterialModule } from './material.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavHeaderComponent, MaterialModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'you-learn';
  
  constructor(private themeService: ThemeService) {}
  
  ngOnInit(): void {
    // Initialize theme service
    this.themeService.isDarkTheme$().subscribe();
  }
}
