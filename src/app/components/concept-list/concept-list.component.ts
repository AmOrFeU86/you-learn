import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ConceptService } from '../../services/concept.service';
import { Concept } from '../../models/concept.model';
import { ConceptDetailComponent } from '../concept-detail/concept-detail.component';
import { DebugInfoComponent } from './debug-info.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Import Prism CSS theme
import 'prismjs/themes/prism-okaidia.css';
// Import Prism core
import 'prismjs';
// Import Prism languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';

declare var Prism: any;

@Component({
  selector: 'app-concept-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    ConceptDetailComponent, 
    DebugInfoComponent,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './concept-list.component.html',
  styleUrls: ['./concept-list.component.scss'],
  providers: [ConceptService]
})
export class ConceptListComponent implements OnInit {
  allConcepts: Concept[] = [];  // Store all concepts
  concepts: Concept[] = [];     // Store filtered concepts (root or current level)
  filteredConcepts: Concept[] = []; // Store filtered concepts
  selectedConcept: Concept | null = null;
  childConcepts: Concept[] = [];
  isListView = true;
  loading = false;
  errorMessage = '';

  constructor(private conceptService: ConceptService, private router: Router) {
    console.log('ConceptListComponent initialized');
  }

  ngOnInit(): void {
    console.log('ConceptListComponent ngOnInit');
    this.loadConcepts();
  }

  loadConcepts(): void {
    console.log('Loading concepts...');
    this.loading = true;
    this.conceptService.getConcepts().subscribe({
      next: (concepts) => {
        console.log('Concepts loaded successfully:', concepts);
        console.log('Number of concepts:', concepts.length);
        console.log('First few concepts:', concepts.slice(0, 3));
        
        this.allConcepts = concepts;
        
        // More flexible filtering for root concepts
        // Consider a concept as root if father is null, undefined, 0, or doesn't exist
        this.concepts = concepts.filter(concept => {
          const isFatherMissing = concept.father === null || 
                                concept.father === undefined || 
                                concept.father === 0 || 
                                !('father' in concept);
          
          console.log(`Concept ${concept.id} - ${concept.title} has father: ${concept.father}, isFatherMissing: ${isFatherMissing}`);
          
          return isFatherMissing;
        });
        
        console.log('Root concepts (flexible filtering):', this.concepts);
        console.log('Number of root concepts:', this.concepts.length);
        
        // If still no root concepts, just show all concepts
        if (this.concepts.length === 0 && concepts.length > 0) {
          console.log('No root concepts found, displaying all concepts');
          this.concepts = [...concepts];
        }
        
        this.filteredConcepts = [...this.concepts];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading concepts:', error);
        this.loading = false;
        this.errorMessage = 'Error loading concepts. Please try again later.';
      }
    });
  }

  getChildConcepts(parentId: number): Concept[] {
    return this.allConcepts.filter(concept => 
      typeof concept.father === 'number' && concept.father === parentId
    );
  }

  formatExample(example: string): string {
    if (!example) return '';
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(example);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // If not JSON, check if it's MongoDB command
      if (example.includes('db.') || example.includes('$')) {
        // Format MongoDB commands with proper indentation
        return example
          .split('\n')
          .map(line => line.trim())
          .join('\n');
      }
      // For regular JavaScript, return as is with trimmed lines
      return example
        .split('\n')
        .map(line => line.trim())
        .join('\n');
    }
  }

  getLanguageFromExample(example: string): string {
    if (!example) return 'javascript';
    if (example.includes('db.') || example.includes('$')) {
      return 'javascript'; // Use javascript highlighting for MongoDB
    }
    try {
      JSON.parse(example);
      return 'json';
    } catch {
      return 'javascript';
    }
  }

  showConceptDetail(concept: Concept): void {
    console.log('Showing concept detail:', concept);
    this.selectedConcept = concept;
    this.childConcepts = this.getChildConcepts(concept.id);
    console.log('Child concepts:', this.childConcepts);
    this.isListView = false;
    
    // Make sure we have all concepts loaded
    console.log('showConceptDetail - allConcepts:', this.allConcepts.length);
    
    // Highlight code after view updates
    setTimeout(() => {
      Prism.highlightAll();
    });
  }

  onBack(): void {
    if (this.selectedConcept && this.selectedConcept.father !== null) {
      // If current concept has a father, show the father concept
      const fatherConcept = this.allConcepts.find(c => c.id === this.selectedConcept?.father);
      if (fatherConcept) {
        this.showConceptDetail(fatherConcept);
        return;
      }
    }
    // If no father or at root level, go back to root list
    this.selectedConcept = null;
    this.childConcepts = [];
    this.isListView = true;
    this.filterRootConcepts();
  }

  filterRootConcepts(): void {
    this.concepts = this.allConcepts.filter(concept => concept.father === null);
  }

  navigateToDataForm(): void {
    this.router.navigate(['/data']);
  }
}
