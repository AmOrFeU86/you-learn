import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-study-tips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './study-tips.component.html',
  styleUrls: ['./study-tips.component.scss']
})
export class StudyTipsComponent {
  constructor() { }
}
