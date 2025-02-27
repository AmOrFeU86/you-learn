import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface FlashCard {
  key: string;
  value: string;
}

@Component({
  selector: 'app-flash-card-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './flash-card-form.component.html',
  styleUrls: ['./flash-card-form.component.scss']
})
export class FlashCardFormComponent implements OnInit {
  flashCardForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';
  
  // Key for storing flash cards in localStorage
  private readonly FLASH_CARDS_KEY = 'youlearn-flashcards';
  
  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.flashCardForm = this.fb.group({
      jsonData: ['', [Validators.required, this.validateJson]]
    });
  }

  ngOnInit(): void {
    // Initialize form
  }

  validateJson(control: any) {
    if (!control.value) {
      return null;
    }
    
    try {
      const data = JSON.parse(control.value);
      
      // Check if it's an array
      if (!Array.isArray(data)) {
        return { notArray: true };
      }
      
      // Check if each item has key and value properties
      for (const item of data) {
        if (typeof item !== 'object' || !item.key || !item.value) {
          return { invalidFormat: true };
        }
      }
      
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  onSubmit(): void {
    if (this.flashCardForm.invalid) {
      this.markFormGroupTouched(this.flashCardForm);
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';

    try {
      // Parse the JSON data
      const flashCards: FlashCard[] = JSON.parse(this.flashCardForm.get('jsonData')?.value);
      
      // Save to localStorage
      localStorage.setItem(this.FLASH_CARDS_KEY, JSON.stringify(flashCards));
      
      // Show success message
      this.submitSuccess = true;
      this.isSubmitting = false;
      
      // Show success message briefly before allowing more entries
      setTimeout(() => {
        this.submitSuccess = false;
      }, 3000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.submitError = 'Error saving flash cards: ' + errorMessage;
      this.isSubmitting = false;
    }
  }

  navigateToFlashCards(): void {
    this.router.navigate(['/flash-cards']);
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
    });
  }
  
  // Helper method to provide example data
  fillWithExampleData(): void {
    const exampleData = [
      { key: "What is Angular?", value: "A platform and framework for building single-page client applications using HTML and TypeScript" },
      { key: "What is a component in Angular?", value: "The building blocks that make up an application. A component includes a TypeScript class, an HTML template, and styles" }
    ];
    
    this.flashCardForm.patchValue({
      jsonData: JSON.stringify(exampleData, null, 2)
    });
  }
}
