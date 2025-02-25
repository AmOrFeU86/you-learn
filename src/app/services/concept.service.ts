import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Concept } from '../models/concept.model';

@Injectable({
  providedIn: 'root'
})
export class ConceptService {
  constructor(private http: HttpClient) {}

  getConcepts(): Observable<Concept[]> {
    return this.http.get<{concepts: Concept[]}>('/assets/data/mongodb-concepts.json')
      .pipe(
        map(response => response.concepts)
      );
  }

  getConcept(id: number): Observable<Concept | undefined> {
    return this.getConcepts().pipe(
      map(concepts => concepts.find(concept => concept.id === id))
    );
  }
}
