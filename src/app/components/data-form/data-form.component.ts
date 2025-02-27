import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConceptService } from '../../services/concept.service';
import { Concept } from '../../models/concept.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-data-form',
  templateUrl: './data-form.component.html',
  styleUrls: ['./data-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class DataFormComponent implements OnInit {
  conceptForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';
  
  constructor(
    private fb: FormBuilder,
    private conceptService: ConceptService,
    private router: Router
  ) {
    this.conceptForm = this.fb.group({
      conceptsJson: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Intentar cargar conceptos existentes para facilitar la edición
    const existingConceptsJson = localStorage.getItem('youlearn-concepts');
    if (existingConceptsJson) {
      this.conceptForm.patchValue({
        conceptsJson: existingConceptsJson
      });
    } else {
      // Proporcionar un ejemplo de JSON si no hay conceptos existentes
      const exampleConcepts = [
        {
          id: Date.now(),
          title: "Example Concept",
          description: "This is an example concept. Replace with your own concepts."
        }
      ];
      this.conceptForm.patchValue({
        conceptsJson: JSON.stringify(exampleConcepts, null, 2)
      });
    }
  }

  onSubmit(): void {
    if (this.conceptForm.invalid) {
      this.markFormGroupTouched(this.conceptForm);
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';

    try {
      const jsonValue = this.conceptForm.get('conceptsJson')?.value;
      let concepts: Concept[] = [];
      let parsedData: any;
      
      try {
        parsedData = JSON.parse(jsonValue);
        console.log('Parsed JSON data:', parsedData);
        
        // Handle different possible formats
        if (Array.isArray(parsedData)) {
          // If it's already an array of concepts
          concepts = parsedData;
        } else if (parsedData && parsedData.concepts && Array.isArray(parsedData.concepts)) {
          // If it's an object with a concepts property
          concepts = parsedData.concepts;
          console.log('Extracted concepts array from object:', concepts);
        } else {
          // If it's a single concept object
          concepts = [parsedData];
        }
      } catch (e) {
        console.error('Error parsing JSON:', e);
        this.submitError = 'Invalid JSON format. Please check your input.';
        this.isSubmitting = false;
        return;
      }
      
      // Ensure each concept has an ID
      concepts.forEach(concept => {
        if (!concept.id) {
          concept.id = Date.now() + Math.floor(Math.random() * 1000);
        }
      });

      console.log('Final concepts array to save:', concepts);
      
      // Save the concepts directly as an array to localStorage
      localStorage.setItem('youlearn-concepts', JSON.stringify(concepts));
      console.log('Concepts saved to localStorage');
      
      // Also save to the service
      this.conceptService.setConceptsFromLocalStorage(concepts)
        .then(() => {
          this.submitSuccess = true;
          this.isSubmitting = false;
          
          // Redirect to the concepts list after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/concepts']);
          }, 2000);
        })
        .catch((error: Error) => {
          this.submitError = 'Error saving concepts: ' + error.message;
          this.isSubmitting = false;
        });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.submitError = 'Unexpected error: ' + errorMessage;
      this.isSubmitting = false;
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
