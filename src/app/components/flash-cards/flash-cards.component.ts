import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConceptService } from '../../services/concept.service';
import { Router } from '@angular/router';

interface FlashCard {
  key: string;
  value: string;
}

interface FlashCardStatus {
  conceptId: number;
  status: 'unseen' | 'bad' | 'good' | 'super_good' | 'excellent';
  lastUpdated: number;
}

interface ProgressStats {
  unseen: number;
  bad: number;
  good: number;
  super_good: number;
  excellent: number;
}

@Component({
  selector: 'app-flash-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flash-cards.component.html',
  styleUrls: ['./flash-cards.component.scss'],
  providers: [ConceptService]
})
export class FlashCardsComponent implements OnInit, OnDestroy {
  // Key for storing flash cards in localStorage
  private readonly FLASH_CARDS_KEY = 'youlearn-flashcards';
  
  flashCards: FlashCard[] = [];
  currentCardIndex = 0;
  showAnswer = false;
  noCardsAvailable = false;
  
  constructor(private router: Router) {}
  
  ngOnDestroy(): void {
    // Cleanup if needed
  }

  ngOnInit(): void {
    this.loadFlashCards();
  }
  
  loadFlashCards(): void {
    try {
      const storedCards = localStorage.getItem(this.FLASH_CARDS_KEY);
      if (storedCards) {
        this.flashCards = JSON.parse(storedCards);
        this.noCardsAvailable = this.flashCards.length === 0;
      } else {
        this.noCardsAvailable = true;
      }
    } catch (error) {
      console.error('Error loading flash cards:', error);
      this.noCardsAvailable = true;
    }
  }
  
  get currentCard(): FlashCard | null {
    return this.flashCards.length > 0 && this.currentCardIndex < this.flashCards.length 
      ? this.flashCards[this.currentCardIndex] 
      : null;
  }
  
  toggleAnswer(): void {
    this.showAnswer = !this.showAnswer;
  }
  
  nextCard(): void {
    if (this.currentCardIndex < this.flashCards.length - 1) {
      this.currentCardIndex++;
      this.showAnswer = false;
    } else {
      // Reached the end, loop back to the beginning
      this.currentCardIndex = 0;
      this.showAnswer = false;
    }
  }
  
  previousCard(): void {
    if (this.currentCardIndex > 0) {
      this.currentCardIndex--;
      this.showAnswer = false;
    } else {
      // At the beginning, loop to the end
      this.currentCardIndex = this.flashCards.length - 1;
      this.showAnswer = false;
    }
  }
  
  navigateToAddFlashCards(): void {
    this.router.navigate(['/flash-card-form']);
  }
}
