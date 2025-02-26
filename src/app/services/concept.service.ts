import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Concept } from '../models/concept.model';

interface ConceptsResponse {
  concepts: Concept[];
}

@Injectable({
  providedIn: 'root'
})
export class ConceptService {
  constructor(private http: HttpClient) {}

  getConcepts(): Observable<Concept[]> {
    return this.http.get<ConceptsResponse>('assets/data/mongodb-concepts.json')
      .pipe(
        map(response => response.concepts)
      );
  }
}
