import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface FlashCard {
  key: string;
  value: string;
}

@Component({
  selector: 'app-flash-card-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './flash-card-form.component.html',
  styleUrls: ['./flash-card-form.component.scss']
})
export class FlashCardFormComponent implements OnInit {
  // Key for storing flash cards in localStorage
  private readonly FLASH_CARDS_KEY = 'youlearn-flashcards';
  
  jsonInput: string = '';
  isValidJson: boolean = true;
  jsonError: string = '';
  successMessage: string = '';
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    this.loadExistingData();
  }
  
  loadExistingData(): void {
    try {
      const storedCards = localStorage.getItem(this.FLASH_CARDS_KEY);
      if (storedCards) {
        const cards = JSON.parse(storedCards);
        this.jsonInput = JSON.stringify(cards, null, 2);
        this.validateJson();
      }
    } catch (error) {
      console.error('Error loading existing flash cards:', error);
    }
  }
  
  validateJson(): void {
    if (!this.jsonInput.trim()) {
      this.isValidJson = false;
      this.jsonError = 'JSON input is required';
      return;
    }
    
    try {
      const parsedJson = JSON.parse(this.jsonInput);
      
      if (!Array.isArray(parsedJson)) {
        this.isValidJson = false;
        this.jsonError = 'Input must be an array of objects';
        return;
      }
      
      for (let i = 0; i < parsedJson.length; i++) {
        const item = parsedJson[i];
        if (!item.key || !item.value) {
          this.isValidJson = false;
          this.jsonError = `Item at index ${i} is missing required 'key' or 'value' property`;
          return;
        }
        
        if (typeof item.key !== 'string' || typeof item.value !== 'string') {
          this.isValidJson = false;
          this.jsonError = `Item at index ${i}: 'key' and 'value' must be strings`;
          return;
        }
      }
      
      this.isValidJson = true;
      this.jsonError = '';
    } catch (error) {
      this.isValidJson = false;
      this.jsonError = 'Invalid JSON format: ' + (error as Error).message;
    }
  }
  
  fillExampleData(): void {
    const exampleData = [
      { key: "What is Angular?", value: "A platform and framework for building single-page client applications using HTML and TypeScript" },
      { key: "What is a component in Angular?", value: "The building blocks that make up an application. A component includes a TypeScript class, an HTML template, and styles" }
    ];
    
    this.jsonInput = JSON.stringify(exampleData, null, 2);
    this.validateJson();
  }
  
  onSubmit(): void {
    this.validateJson();
    
    if (this.isValidJson) {
      try {
        const flashCards = JSON.parse(this.jsonInput);
        localStorage.setItem(this.FLASH_CARDS_KEY, JSON.stringify(flashCards));
        this.successMessage = 'Flash cards saved successfully!';
        
        // Clear the success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      } catch (error) {
        console.error('Error saving flash cards:', error);
      }
    }
  }
  
  navigateBack(): void {
    this.router.navigate(['/flash-cards']);
  }
}
