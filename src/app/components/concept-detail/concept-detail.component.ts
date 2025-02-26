import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Concept } from '../../models/concept.model';
import { ConceptTreeComponent } from '../concept-tree/concept-tree.component';
import { ConceptService } from '../../services/concept.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Import Prism CSS theme
import 'prismjs/themes/prism-okaidia.css';
// Import Prism core
import 'prismjs';
// Import Prism languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';

declare var Prism: any;

@Component({
  selector: 'app-concept-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ConceptTreeComponent],
  templateUrl: './concept-detail.component.html',
  styleUrls: ['./concept-detail.component.scss']
})
export class ConceptDetailComponent implements OnInit {
  @Input() concept: Concept | null = null;
  @Input() childConcepts: Concept[] = [];
  @Input() allConcepts: Concept[] = [];
  @Output() goBack = new EventEmitter<void>();
  @Output() selectConcept = new EventEmitter<Concept>();

  showTreeView = false;

  constructor(private conceptService: ConceptService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    // Highlight code after view updates
    setTimeout(() => {
      Prism.highlightAll();
      
      // Debug: Log the actual HTML structure of the description
      if (this.concept && this.concept.description) {
        console.log('Description HTML structure:');
        const descriptionElement = document.querySelector('.description');
        if (descriptionElement) {
          console.log(descriptionElement.innerHTML);
          console.log('List items in description:');
          const listItems = descriptionElement.querySelectorAll('li');
          console.log('Number of list items:', listItems.length);
          listItems.forEach((li, index) => {
            console.log(`List item ${index} computed style:`, window.getComputedStyle(li));
          });
        }
      }
    }, 500);
    
    // Ensure allConcepts is populated if it's empty
    if (this.allConcepts.length === 0 && this.concept) {
      console.log('Loading concepts from service in detail component');
      this.conceptService.getConcepts().subscribe(concepts => {
        console.log('Loaded concepts from service:', concepts.length);
        this.allConcepts = concepts;
      });
    } else {
      console.log('Concepts already loaded:', this.allConcepts.length);
    }
  }

  onBack(): void {
    this.goBack.emit();
  }

  onSelectConcept(concept: Concept): void {
    this.selectConcept.emit(concept);
  }

  onTreeConceptSelect(concept: Concept): void {
    this.showTreeView = false;
    this.selectConcept.emit(concept);
  }

  onShowTree(): void {
    console.log('Show tree button clicked');
    console.log('Current concept:', this.concept);
    console.log('All concepts:', this.allConcepts.length);
    
    // Debug: Check the structure of the concepts
    if (this.concept && this.allConcepts.length > 0) {
      console.log('Concept 1 children:', this.allConcepts.find(c => c.id === 1)?.children);
      console.log('Concept 2 exists:', !!this.allConcepts.find(c => c.id === 2));
      console.log('Concept 3 exists:', !!this.allConcepts.find(c => c.id === 3));
    }
    
    // Always load fresh concepts from the service to ensure we have all of them
    console.log('Loading fresh concepts before showing tree');
    this.conceptService.getConcepts().subscribe(concepts => {
      console.log('Loaded fresh concepts from service:', concepts.length);
      this.allConcepts = concepts;
      this.showTreeView = true;
    });
  }

  getLanguageFromExample(example: string): string {
    if (!example) return 'plaintext';
    if (example.includes('db.')) return 'javascript';
    if (example.includes('use ')) return 'sql';
    return 'plaintext';
  }

  formatExample(example: string): string {
    if (!example) return '';
    return example.trim();
  }

  getSafeDescription(description: string): SafeHtml {
    if (!description) {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    
    // Find all list items and modify them
    const listItems = tempDiv.querySelectorAll('li');
    listItems.forEach(li => {
      // Cast to HTMLElement to access style property
      const liElement = li as HTMLElement;
      
      // Remove any existing styling that might be causing issues
      liElement.style.textIndent = '0';
      liElement.style.paddingLeft = '0';
      liElement.style.marginLeft = '0';
      liElement.style.display = 'list-item';
      
      // Add a custom inline style to ensure proper display
      liElement.setAttribute('style', 'display: list-item !important; text-indent: 0 !important; padding-left: 0 !important; margin-left: 0 !important;');
    });
    
    // Find all lists and modify them
    const lists = tempDiv.querySelectorAll('ul, ol');
    lists.forEach(list => {
      // Cast to HTMLElement to access style property
      const listElement = list as HTMLElement;
      
      // Set list properties directly
      listElement.style.paddingLeft = '1.5rem';
      listElement.style.listStylePosition = 'outside';
      
      // Add a custom inline style to ensure proper display
      listElement.setAttribute('style', 'padding-left: 1.5rem !important; list-style-position: outside !important;');
    });
    
    // Return the modified HTML
    return this.sanitizer.bypassSecurityTrustHtml(tempDiv.innerHTML);
  }
}
