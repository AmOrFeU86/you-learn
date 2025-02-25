import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConceptService } from '../../services/concept.service';
import { Concept } from '../../models/concept.model';

@Component({
  selector: 'app-concept-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './concept-detail.component.html',
  styleUrls: ['./concept-detail.component.scss']
})
export class ConceptDetailComponent implements OnInit {
  concept?: Concept;

  constructor(
    private route: ActivatedRoute,
    private conceptService: ConceptService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      this.conceptService.getConcept(id).subscribe(concept => {
        this.concept = concept;
      });
    });
  }
}
