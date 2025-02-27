import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Concept } from '../../models/concept.model';

@Component({
  selector: 'app-debug-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="debug-container" *ngIf="showDebug">
      <div class="debug-section">
        <h3>Debug Information</h3>
        <p>Loading: {{ loading }}</p>
        <p>Error: {{ errorMessage || 'None' }}</p>
        <p>All Concepts: {{ allConcepts?.length || 0 }}</p>
        <p>Root Concepts: {{ concepts?.length || 0 }}</p>
        <p>Filtered Concepts: {{ filteredConcepts?.length || 0 }}</p>
        <div class="debug-actions">
          <button (click)="toggleDebug()">Hide Debug</button>
          <button (click)="clearLocalStorage()" class="danger">Clear LocalStorage</button>
          <button (click)="fixLocalStorage()" class="warning">Fix LocalStorage</button>
          <button (click)="reloadPage()" class="warning">Reload Page</button>
        </div>
      </div>
    </div>
    <button *ngIf="!showDebug" (click)="toggleDebug()" class="debug-toggle">Show Debug</button>
  `,
  styles: [`
    .debug-container {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .debug-section {
      margin-bottom: 10px;
    }
    .debug-section h3 {
      margin-top: 0;
      margin-bottom: 10px;
    }
    .debug-toggle {
      position: fixed;
      bottom: 10px;
      right: 10px;
      z-index: 1000;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 5px 10px;
      cursor: pointer;
    }
    .debug-actions {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    .danger {
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 5px 10px;
      cursor: pointer;
    }
    .warning {
      background-color: #ffc107;
      color: black;
      border: none;
      border-radius: 4px;
      padding: 5px 10px;
      cursor: pointer;
    }
  `]
})
export class DebugInfoComponent {
  @Input() loading: boolean = false;
  @Input() errorMessage: string = '';
  @Input() allConcepts: Concept[] = [];
  @Input() concepts: Concept[] = [];
  @Input() filteredConcepts: Concept[] = [];
  
  showDebug: boolean = false;
  
  toggleDebug(): void {
    this.showDebug = !this.showDebug;
  }
  
  clearLocalStorage(): void {
    if (confirm('Are you sure you want to clear localStorage? This will remove all saved concepts.')) {
      localStorage.removeItem('youlearn-concepts');
      console.log('LocalStorage cleared');
      alert('LocalStorage cleared. Reload the page to see changes.');
    }
  }
  
  fixLocalStorage(): void {
    try {
      const storedData = localStorage.getItem('youlearn-concepts');
      if (!storedData) {
        alert('No data found in localStorage.');
        return;
      }
      
      const parsedData = JSON.parse(storedData);
      console.log('Current localStorage data:', parsedData);
      
      let conceptsArray: Concept[] = [];
      
      if (Array.isArray(parsedData)) {
        // If it's already an array, check if each item is a concept or has a concepts property
        conceptsArray = parsedData.flatMap(item => {
          if (item && item.concepts && Array.isArray(item.concepts)) {
            return item.concepts;
          }
          return item;
        });
      } else if (parsedData && parsedData.concepts && Array.isArray(parsedData.concepts)) {
        // If it's an object with a concepts property
        conceptsArray = parsedData.concepts;
      } else {
        // Unknown format
        alert('Unknown data format in localStorage. Unable to fix.');
        return;
      }
      
      // Save the fixed array back to localStorage
      localStorage.setItem('youlearn-concepts', JSON.stringify(conceptsArray));
      console.log('Fixed localStorage data:', conceptsArray);
      alert('LocalStorage data fixed. Reload the page to see changes.');
    } catch (error) {
      console.error('Error fixing localStorage:', error);
      alert('Error fixing localStorage: ' + (error as Error).message);
    }
  }
  
  reloadPage(): void {
    window.location.reload();
  }
}
