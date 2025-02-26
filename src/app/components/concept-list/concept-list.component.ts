import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConceptService } from '../../services/concept.service';
import { Concept } from '../../models/concept.model';

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
  imports: [CommonModule, RouterLink],
  templateUrl: './concept-list.component.html',
  styleUrls: ['./concept-list.component.scss']
})
export class ConceptListComponent implements OnInit {
  allConcepts: Concept[] = [];  // Store all concepts
  concepts: Concept[] = [];     // Store filtered concepts (root or current level)
  selectedConcept: Concept | null = null;
  childConcepts: Concept[] = [];
  isListView = true;

  constructor(private conceptService: ConceptService) {}

  ngOnInit(): void {
    this.conceptService.getConcepts().subscribe(concepts => {
      this.allConcepts = concepts;
      this.filterRootConcepts();
    });
  }

  filterRootConcepts(): void {
    this.concepts = this.allConcepts.filter(concept => concept.father === null);
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
    this.selectedConcept = {
      ...concept,
      example: this.formatExample(concept.example)
    };
    // Get child concepts
    this.childConcepts = this.getChildConcepts(concept.id);
    this.isListView = false;
    // Highlight code after view updates
    setTimeout(() => {
      Prism.highlightAll();
    });
  }

  backToList(): void {
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
}
