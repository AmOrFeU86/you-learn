import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface FlashCard {
  key: string;
  value: string;
}

interface FlashCardStatus {
  cardId: string; // Using key as the identifier
  status: 'unseen' | 'bad' | 'good' | 'very_good' | 'excellent';
  lastReviewed: number; // timestamp
}

interface ProgressStats {
  unseen: number;
  bad: number;
  good: number;
  very_good: number;
  excellent: number;
  total: number;
}

@Component({
  selector: 'app-flash-cards',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './flash-cards.component.html',
  styleUrls: ['./flash-cards.component.scss']
})
export class FlashCardsComponent implements OnInit, OnDestroy {
  // Keys for storing in localStorage
  private readonly FLASH_CARDS_KEY = 'youlearn-flashcards';
  private readonly FLASH_CARDS_STATUS_KEY = 'youlearn-flashcards-status';
  
  flashCards: FlashCard[] = [];
  flashCardStatuses: FlashCardStatus[] = [];
  currentCardIndex = 0;
  showAnswer = false;
  noCardsAvailable = false;
  progressStats: ProgressStats = {
    unseen: 0,
    bad: 0,
    good: 0,
    very_good: 0,
    excellent: 0,
    total: 0
  };
  
  constructor(private router: Router) {}
  
  ngOnDestroy(): void {
    // Cleanup if needed
  }

  ngOnInit(): void {
    this.loadFlashCards();
    this.loadFlashCardStatuses();
    this.calculateProgressStats();
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
  
  loadFlashCardStatuses(): void {
    try {
      const storedStatuses = localStorage.getItem(this.FLASH_CARDS_STATUS_KEY);
      if (storedStatuses) {
        this.flashCardStatuses = JSON.parse(storedStatuses);
      } else {
        // Initialize statuses for all cards as unseen
        this.initializeCardStatuses();
      }
    } catch (error) {
      console.error('Error loading flash card statuses:', error);
      this.initializeCardStatuses();
    }
  }
  
  initializeCardStatuses(): void {
    this.flashCardStatuses = this.flashCards.map(card => ({
      cardId: card.key,
      status: 'unseen',
      lastReviewed: 0
    }));
    this.saveFlashCardStatuses();
  }
  
  saveFlashCardStatuses(): void {
    localStorage.setItem(this.FLASH_CARDS_STATUS_KEY, JSON.stringify(this.flashCardStatuses));
  }
  
  calculateProgressStats(): void {
    if (this.flashCards.length === 0) {
      return;
    }
    
    // Reset stats
    this.progressStats = {
      unseen: 0,
      bad: 0,
      good: 0,
      very_good: 0,
      excellent: 0,
      total: this.flashCards.length
    };
    
    // Count statuses
    for (const status of this.flashCardStatuses) {
      if (status.status === 'unseen') this.progressStats.unseen++;
      else if (status.status === 'bad') this.progressStats.bad++;
      else if (status.status === 'good') this.progressStats.good++;
      else if (status.status === 'very_good') this.progressStats.very_good++;
      else if (status.status === 'excellent') this.progressStats.excellent++;
    }
  }
  
  get currentCard(): FlashCard | null {
    return this.flashCards.length > 0 && this.currentCardIndex < this.flashCards.length 
      ? this.flashCards[this.currentCardIndex] 
      : null;
  }
  
  get currentCardStatus(): FlashCardStatus | null {
    if (!this.currentCard) return null;
    
    const status = this.flashCardStatuses.find(s => s.cardId === this.currentCard?.key);
    if (status) return status;
    
    // If status not found, create a new one
    const newStatus: FlashCardStatus = {
      cardId: this.currentCard.key,
      status: 'unseen',
      lastReviewed: 0
    };
    this.flashCardStatuses.push(newStatus);
    this.saveFlashCardStatuses();
    return newStatus;
  }
  
  toggleAnswer(): void {
    this.showAnswer = !this.showAnswer;
  }
  
  updateCardStatus(status: 'bad' | 'good' | 'very_good' | 'excellent'): void {
    if (!this.currentCard || !this.currentCardStatus) return;
    
    // Update status
    this.currentCardStatus.status = status;
    this.currentCardStatus.lastReviewed = Date.now();
    
    // Save to localStorage
    this.saveFlashCardStatuses();
    
    // Recalculate stats
    this.calculateProgressStats();
    
    // Move to next card
    this.nextCard();
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
  
  navigateToMatchingGame(): void {
    this.router.navigate(['/matching-game']);
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'unseen': return 'status-unseen';
      case 'bad': return 'status-bad';
      case 'good': return 'status-good';
      case 'very_good': return 'status-very-good';
      case 'excellent': return 'status-excellent';
      default: return '';
    }
  }
  
  getStatusText(status: string): string {
    switch (status) {
      case 'unseen': return 'Not Reviewed';
      case 'bad': return 'Need More Review';
      case 'good': return 'Good';
      case 'very_good': return 'Very Good';
      case 'excellent': return 'Excellent';
      default: return '';
    }
  }
}
