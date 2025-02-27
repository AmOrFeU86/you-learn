import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface QuizOption {
  text: string;
  isCorrect: boolean;
  selected: boolean;
}

interface QuizQuestion {
  question: string;
  options: QuizOption[];
  answered: boolean;
  correct: boolean;
}

interface QuizData {
  title: string;
  description: string;
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
  // Quiz data
  quizData: QuizData = {
    title: 'Sample Quiz',
    description: 'Test your knowledge with this sample quiz',
    questions: []
  };
  
  // Key for storing quiz data in localStorage
  private readonly QUIZ_DATA_KEY = 'youlearn-quiz-data';

  // Quiz state
  quizStarted = false;
  quizCompleted = false;
  currentQuestionIndex = 0;
  currentQuestion: QuizQuestion | null = null;
  
  // Stats
  correctAnswers = 0;
  totalQuestions = 0;
  score = 0;
  
  // Messages
  noQuestionsAvailable = false;
  errorMessage = '';
  successMessage = '';
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    // Load quiz data
    this.loadQuizData();
  }
  
  loadQuizData(): void {
    try {
      // Try to load quiz data from localStorage
      const storedData = localStorage.getItem(this.QUIZ_DATA_KEY);
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        // Check if the parsed data has the expected structure
        if (parsedData && parsedData.questions && Array.isArray(parsedData.questions)) {
          this.quizData = parsedData;
          
          // Ensure all questions have the required properties
          this.quizData.questions.forEach(question => {
            question.answered = false;
            question.correct = false;
            
            // Ensure all options have the required properties
            if (question.options && Array.isArray(question.options)) {
              question.options.forEach(option => {
                option.selected = false;
              });
            }
          });
          
          this.noQuestionsAvailable = this.quizData.questions.length === 0;
          this.totalQuestions = this.quizData.questions.length;
          return;
        }
      }
      
      // If no valid data in localStorage, use fallback data
      this.useFallbackData();
    } catch (error) {
      console.error('Error loading quiz data from localStorage:', error);
      // Use fallback data if there's an error
      this.useFallbackData();
    }
  }
  
  useFallbackData(): void {
    // Fallback quiz data if nothing is in localStorage
    this.quizData = {
      title: 'Angular Quiz',
      description: 'Test your knowledge of Angular',
      questions: [
        {
          question: 'What is Angular?',
          options: [
            { text: 'A JavaScript library for building user interfaces', isCorrect: false, selected: false },
            { text: 'A JavaScript framework for building web applications', isCorrect: true, selected: false },
            { text: 'A CSS framework', isCorrect: false, selected: false },
            { text: 'A database management system', isCorrect: false, selected: false }
          ],
          answered: false,
          correct: false
        },
        {
          question: 'Which of the following is not an Angular directive?',
          options: [
            { text: 'ngFor', isCorrect: false, selected: false },
            { text: 'ngIf', isCorrect: false, selected: false },
            { text: 'ngSwitch', isCorrect: false, selected: false },
            { text: 'ngLoop', isCorrect: true, selected: false }
          ],
          answered: false,
          correct: false
        },
        {
          question: 'What is the purpose of Angular services?',
          options: [
            { text: 'To provide styling for components', isCorrect: false, selected: false },
            { text: 'To share data and functionality across components', isCorrect: true, selected: false },
            { text: 'To create HTML templates', isCorrect: false, selected: false },
            { text: 'To handle routing only', isCorrect: false, selected: false }
          ],
          answered: false,
          correct: false
        }
      ]
    };
    
    this.noQuestionsAvailable = this.quizData.questions.length === 0;
    this.totalQuestions = this.quizData.questions.length;
  }
  
  startQuiz(): void {
    // Reset quiz state
    this.quizStarted = true;
    this.quizCompleted = false;
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
    this.score = 0;
    
    // Reset all questions and options
    this.quizData.questions.forEach(question => {
      question.answered = false;
      question.correct = false;
      question.options.forEach(option => {
        option.selected = false;
      });
    });
    
    // Shuffle questions
    this.shuffleQuestions();
    
    // Set the current question
    if (this.quizData.questions.length > 0) {
      this.currentQuestion = this.quizData.questions[0];
    }
  }
  
  shuffleQuestions(): void {
    this.quizData.questions = this.shuffleArray(this.quizData.questions);
  }
  
  shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  selectOption(option: QuizOption): void {
    if (!this.currentQuestion) return;
    
    // Reset all options to unselected first
    this.currentQuestion.options.forEach((opt: QuizOption) => {
      opt.selected = false;
    });
    
    // Mark the clicked option as selected
    option.selected = true;
  }

  checkAnswer(): void {
    if (!this.currentQuestion) return;
    
    // Find the selected option
    const selectedOption = this.currentQuestion.options.find((opt: QuizOption) => opt.selected);
    
    if (!selectedOption) {
      this.errorMessage = 'Please select an option before checking the answer.';
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
      return;
    }
    
    // Mark the question as answered
    this.currentQuestion.answered = true;
    
    // Check if the selected option is correct
    if (selectedOption.isCorrect) {
      this.successMessage = 'Correct answer!';
      this.score++;
      this.currentQuestion.correct = true;
    } else {
      this.errorMessage = 'Incorrect answer. Try again!';
      this.currentQuestion.correct = false;
    }
    
    // Clear messages after 3 seconds
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }
  
  nextQuestion(): void {
    if (this.currentQuestionIndex < this.quizData.questions.length - 1) {
      this.currentQuestionIndex++;
      this.currentQuestion = this.quizData.questions[this.currentQuestionIndex];
    } else {
      this.finishQuiz();
    }
  }
  
  finishQuiz(): void {
    this.quizCompleted = true;
    this.correctAnswers = this.score;
    this.totalQuestions = this.quizData.questions.length;
  }
  
  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.currentQuestion = this.quizData.questions[this.currentQuestionIndex];
    }
  }
  
  resetQuiz(): void {
    this.quizCompleted = false;
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
    this.score = 0;
    
    // Reset all questions and options
    this.quizData.questions.forEach(question => {
      question.answered = false;
      question.correct = false;
      question.options.forEach(option => {
        option.selected = false;
      });
    });
    
    this.quizStarted = false;
  }
  
  goHome(): void {
    this.router.navigate(['/']);
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
  
  navigateToQuizForm(): void {
    this.router.navigate(['/quiz-form']);
  }
}
