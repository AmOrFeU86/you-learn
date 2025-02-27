import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError, tap } from 'rxjs';
import { Concept } from '../models/concept.model';

@Injectable({
  providedIn: 'root'
})
export class ConceptService {
  private concepts: Concept[] = [];
  private useLocalStorageOnly = false;

  constructor(private http: HttpClient) {
    // Cargar conceptos desde localStorage al iniciar el servicio
    this.loadConceptsFromLocalStorage();
  }

  getConcepts(): Observable<Concept[]> {
    // Si hay conceptos en localStorage, usamos esos en lugar de los del JSON
    if (this.useLocalStorageOnly || this.concepts.length > 0) {
      console.log('Returning concepts from localStorage:', this.concepts.length);
      console.log('First few concepts:', this.concepts.slice(0, 3));
      return of(this.concepts);
    }
    
    // Si no hay conceptos en localStorage, cargamos los del JSON
    console.log('Loading concepts from JSON file');
    return this.http.get<any>('assets/data/mongodb-concepts.json').pipe(
      tap(response => {
        console.log('Raw JSON response:', response);
        console.log('Response type:', typeof response);
        if (response && response.concepts) {
          console.log('Found concepts array in response with length:', response.concepts.length);
        } else {
          console.error('No concepts array found in response or it is empty');
        }
      }),
      map(response => {
        // Check if the response has a 'concepts' property (array)
        if (response && response.concepts && Array.isArray(response.concepts)) {
          return response.concepts;
        }
        // If response is already an array
        if (Array.isArray(response)) {
          return response;
        }
        console.error('Invalid response format:', response);
        return [];
      }),
      catchError(error => {
        console.error('Error fetching concepts:', error);
        return of([]);
      })
    );
  }

  // Método para añadir conceptos
  addConcepts(newConcepts: Concept[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        console.log('Concepts being added:', newConcepts);
        
        // Check if newConcepts is an array of concepts or contains a concepts property
        let conceptsToAdd: Concept[] = [];
        
        if (Array.isArray(newConcepts)) {
          conceptsToAdd = newConcepts;
        } else if (newConcepts && (newConcepts as any).concepts && Array.isArray((newConcepts as any).concepts)) {
          conceptsToAdd = (newConcepts as any).concepts;
          console.log('Extracted concepts array from object:', conceptsToAdd);
        }
        
        // Añadir los nuevos conceptos a la lista existente
        this.concepts = [...this.concepts, ...conceptsToAdd];
        
        console.log('Updated concepts array:', this.concepts);
        
        // Guardar en localStorage
        localStorage.setItem('youlearn-concepts', JSON.stringify(this.concepts));
        
        setTimeout(() => {
          resolve();
        }, 500);
      } catch (error) {
        console.error('Error adding concepts:', error);
        reject(new Error('Error adding concepts'));
      }
    });
  }

  // Método para establecer los conceptos desde localStorage
  setConceptsFromLocalStorage(concepts: Concept[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        // Ensure we're storing an array of concepts, not an object with a concepts property
        let conceptsToStore: Concept[] = [];
        
        if (Array.isArray(concepts)) {
          conceptsToStore = concepts;
        } else if (concepts && (concepts as any).concepts && Array.isArray((concepts as any).concepts)) {
          conceptsToStore = (concepts as any).concepts;
        }
        
        this.concepts = conceptsToStore;
        this.useLocalStorageOnly = true;
        console.log('Concepts set from localStorage:', this.concepts.length);
        
        // Update localStorage with the correct format
        localStorage.setItem('youlearn-concepts', JSON.stringify(this.concepts));
        
        setTimeout(() => {
          resolve();
        }, 500);
      } catch (error) {
        reject(new Error('Error setting concepts from localStorage'));
      }
    });
  }

  // Método para obtener los conceptos añadidos en memoria
  getAddedConcepts(): Concept[] {
    return this.concepts;
  }

  // Método para cargar conceptos desde localStorage
  private loadConceptsFromLocalStorage(): void {
    try {
      const storedConcepts = localStorage.getItem('youlearn-concepts');
      if (storedConcepts) {
        const parsedData = JSON.parse(storedConcepts);
        console.log('Raw data from localStorage:', parsedData);
        
        let parsedConcepts: Concept[] = [];
        
        // Handle different possible formats
        if (Array.isArray(parsedData)) {
          parsedConcepts = parsedData;
        } else if (parsedData && parsedData.concepts && Array.isArray(parsedData.concepts)) {
          parsedConcepts = parsedData.concepts;
          console.log('Extracted concepts array from localStorage object');
        }
        
        if (parsedConcepts.length > 0) {
          this.concepts = parsedConcepts;
          this.useLocalStorageOnly = true;
          console.log('Loaded concepts from localStorage:', this.concepts.length);
          console.log('First concept:', this.concepts[0]);
          
          // Fix the localStorage format if needed
          localStorage.setItem('youlearn-concepts', JSON.stringify(this.concepts));
        }
      }
    } catch (error) {
      console.error('Error loading concepts from localStorage:', error);
    }
  }
}
