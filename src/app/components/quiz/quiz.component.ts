import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface QuizOption {
  text: string;
  isCorrect: boolean;
  selected?: boolean;
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
  answered?: boolean;
  correct?: boolean;
}

interface QuizData {
  questions: QuizQuestion[];
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit {
  // Key for storing quiz data in localStorage
  private readonly QUIZ_DATA_KEY = 'youlearn-quiz-data';
  
  // Quiz state
  quizData: QuizData = { questions: [] };
  currentQuestionIndex = 0;
  quizStarted = false;
  quizCompleted = false;
  
  // Stats
  correctAnswers = 0;
  totalQuestions = 0;
  
  // Messages
  noQuestionsAvailable = false;
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    this.loadQuizData();
  }
  
  loadQuizData(): void {
    try {
      const storedData = localStorage.getItem(this.QUIZ_DATA_KEY);
      if (storedData) {
        this.quizData = JSON.parse(storedData) as QuizData;
        
        if (this.quizData.questions.length === 0) {
          this.noQuestionsAvailable = true;
          return;
        }
        
        this.totalQuestions = this.quizData.questions.length;
        
        // Reset any previous selections
        this.quizData.questions.forEach(question => {
          question.answered = false;
          question.correct = false;
          question.options.forEach(option => {
            option.selected = false;
          });
        });
      } else {
        this.noQuestionsAvailable = true;
      }
    } catch (error) {
      console.error('Error loading quiz data:', error);
      this.noQuestionsAvailable = true;
    }
  }
  
  get currentQuestion(): QuizQuestion | null {
    if (this.quizData.questions.length === 0 || this.currentQuestionIndex >= this.quizData.questions.length) {
      return null;
    }
    return this.quizData.questions[this.currentQuestionIndex];
  }
  
  startQuiz(): void {
    this.quizStarted = true;
    this.quizCompleted = false;
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
    
    // Shuffle questions
    this.shuffleQuestions();
  }
  
  shuffleQuestions(): void {
    this.quizData.questions = this.shuffleArray([...this.quizData.questions]);
    
    // Also shuffle options for each question
    this.quizData.questions.forEach(question => {
      question.options = this.shuffleArray([...question.options]);
    });
  }
  
  shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  selectOption(option: QuizOption): void {
    if (!this.currentQuestion || this.currentQuestion.answered) {
      return;
    }
    
    // Toggle selection for this option
    option.selected = !option.selected;
  }
  
  submitAnswer(): void {
    if (!this.currentQuestion || this.currentQuestion.answered) {
      return;
    }
    
    const question = this.currentQuestion;
    question.answered = true;
    
    // Check if answer is correct (all correct options are selected and no incorrect options are selected)
    const allCorrectSelected = question.options
      .filter(o => o.isCorrect)
      .every(o => o.selected);
      
    const noIncorrectSelected = question.options
      .filter(o => !o.isCorrect)
      .every(o => !o.selected);
    
    question.correct = allCorrectSelected && noIncorrectSelected;
    
    if (question.correct) {
      this.correctAnswers++;
    }
  }
  
  nextQuestion(): void {
    if (this.currentQuestionIndex < this.quizData.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.quizCompleted = true;
    }
  }
  
  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }
  
  resetQuiz(): void {
    this.quizStarted = false;
    this.quizCompleted = false;
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
    
    // Reset all questions and options
    this.quizData.questions.forEach(question => {
      question.answered = false;
      question.correct = false;
      question.options.forEach(option => {
        option.selected = false;
      });
    });
  }
  
  navigateToQuizForm(): void {
    this.router.navigate(['/quiz-form']);
  }
  
  getScorePercentage(): number {
    if (this.totalQuestions === 0) return 0;
    return Math.round((this.correctAnswers / this.totalQuestions) * 100);
  }
  
  getScoreClass(): string {
    const percentage = this.getScorePercentage();
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'average';
    return 'poor';
  }
}
