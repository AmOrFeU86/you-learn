import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
}

interface QuizData {
  questions: QuizQuestion[];
}

@Component({
  selector: 'app-quiz-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz-form.component.html',
  styleUrls: ['./quiz-form.component.scss']
})
export class QuizFormComponent implements OnInit {
  // Key for storing quiz data in localStorage
  private readonly QUIZ_DATA_KEY = 'youlearn-quiz-data';
  
  // Form data
  quizDataJson = '';
  
  // Messages
  successMessage = '';
  errorMessage = '';
  
  // Example JSON for user reference
  exampleJson = `{
  "questions": [
    {
      "question": "What is the capital city of Brazil?",
      "options": [
        {"text": "Rio de Janeiro", "isCorrect": false},
        {"text": "São Paulo", "isCorrect": false},
        {"text": "Brasília", "isCorrect": true},
        {"text": "Salvador", "isCorrect": false}
      ]
    },
    {
      "question": "Which planet is known as the Red Planet?",
      "options": [
        {"text": "Venus", "isCorrect": false},
        {"text": "Mars", "isCorrect": true},
        {"text": "Jupiter", "isCorrect": false},
        {"text": "Saturn", "isCorrect": false}
      ]
    }
  ]
}`;
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    this.loadExistingData();
  }
  
  loadExistingData(): void {
    try {
      const storedData = localStorage.getItem(this.QUIZ_DATA_KEY);
      if (storedData) {
        // Format the JSON with proper indentation for better readability
        this.quizDataJson = JSON.stringify(JSON.parse(storedData), null, 2);
      } else {
        // If no data exists, provide the example as a starting point
        this.quizDataJson = this.exampleJson;
      }
    } catch (error) {
      console.error('Error loading existing quiz data:', error);
      this.errorMessage = 'Error loading existing data. Using example data instead.';
      this.quizDataJson = this.exampleJson;
    }
  }
  
  saveQuizData(): void {
    try {
      // Clear previous messages
      this.successMessage = '';
      this.errorMessage = '';
      
      // Validate JSON
      const quizData = JSON.parse(this.quizDataJson) as QuizData;
      
      // Basic validation
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        this.errorMessage = 'Invalid format: "questions" property must be an array.';
        return;
      }
      
      // Validate each question
      for (let i = 0; i < quizData.questions.length; i++) {
        const q = quizData.questions[i];
        
        if (!q.question || typeof q.question !== 'string') {
          this.errorMessage = `Question ${i + 1}: Missing or invalid "question" property.`;
          return;
        }
        
        if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
          this.errorMessage = `Question ${i + 1}: "options" must be a non-empty array.`;
          return;
        }
        
        // Check if at least one option is correct
        const hasCorrectOption = q.options.some((opt: QuizOption) => opt.isCorrect === true);
        if (!hasCorrectOption) {
          this.errorMessage = `Question ${i + 1}: At least one option must be marked as correct.`;
          return;
        }
        
        // Validate each option
        for (let j = 0; j < q.options.length; j++) {
          const opt: QuizOption = q.options[j];
          
          if (!opt.text || typeof opt.text !== 'string') {
            this.errorMessage = `Question ${i + 1}, Option ${j + 1}: Missing or invalid "text" property.`;
            return;
          }
          
          if (typeof opt.isCorrect !== 'boolean') {
            this.errorMessage = `Question ${i + 1}, Option ${j + 1}: "isCorrect" must be a boolean.`;
            return;
          }
        }
      }
      
      // Save to localStorage
      localStorage.setItem(this.QUIZ_DATA_KEY, JSON.stringify(quizData));
      
      this.successMessage = 'Quiz data saved successfully!';
    } catch (error) {
      console.error('Error saving quiz data:', error);
      this.errorMessage = 'Invalid JSON format. Please check your input.';
    }
  }
  
  clearForm(): void {
    this.quizDataJson = this.exampleJson;
    this.successMessage = '';
    this.errorMessage = '';
  }
  
  navigateToQuiz(): void {
    this.router.navigate(['/quiz']);
  }
}
