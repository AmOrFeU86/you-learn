import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConceptService } from '../../services/concept.service';
import { Concept } from '../../models/concept.model';

@Component({
  selector: 'app-concept-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './concept-list.component.html',
  styleUrls: ['./concept-list.component.scss']
})
export class ConceptListComponent implements OnInit {
  concepts: Concept[] = [];
  selectedConcept: Concept | null = null;
  isListView = true;

  constructor(private conceptService: ConceptService) {}

  ngOnInit(): void {
    this.conceptService.getConcepts().subscribe(concepts => {
      this.concepts = concepts;
    });
  }

  showConceptDetail(concept: Concept): void {
    this.selectedConcept = concept;
    this.isListView = false;
  }

  backToList(): void {
    this.selectedConcept = null;
    this.isListView = true;
  }
}
