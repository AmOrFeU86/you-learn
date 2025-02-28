import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface FlashCard {
  key: string;
  value: string;
}

interface MatchingCard {
  id: number;
  content: string;
  type: 'key' | 'value';
  isMatched: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-matching-game',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './matching-game.component.html',
  styleUrls: ['./matching-game.component.scss']
})
export class MatchingGameComponent implements OnInit {
  // Key for storing flash cards in localStorage
  private readonly FLASH_CARDS_KEY = 'youlearn-flashcards';
  
  // Game state
  keyCards: MatchingCard[] = [];
  valueCards: MatchingCard[] = [];
  selectedKeyCard: MatchingCard | null = null;
  selectedValueCard: MatchingCard | null = null;
  matchedPairs = 0;
  totalPairs = 0;
  gameComplete = false;
  
  // Messages
  noCardsAvailable = false;
  successMessage = '';
  errorMessage = '';
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    this.loadFlashCards();
  }
  
  loadFlashCards(): void {
    try {
      const storedCards = localStorage.getItem(this.FLASH_CARDS_KEY);
      if (storedCards) {
        const flashCards: FlashCard[] = JSON.parse(storedCards);
        
        if (flashCards.length === 0) {
          this.noCardsAvailable = true;
          return;
        }
        
        this.totalPairs = flashCards.length;
        this.setupGame(flashCards);
      } else {
        this.noCardsAvailable = true;
      }
    } catch (error) {
      console.error('Error loading flash cards:', error);
      this.noCardsAvailable = true;
    }
  }
  
  setupGame(flashCards: FlashCard[]): void {
    // Reset game state
    this.keyCards = [];
    this.valueCards = [];
    this.selectedKeyCard = null;
    this.selectedValueCard = null;
    this.matchedPairs = 0;
    this.gameComplete = false;
    this.successMessage = '';
    this.errorMessage = '';
    
    // Create cards
    flashCards.forEach((card, index) => {
      this.keyCards.push({
        id: index,
        content: card.key,
        type: 'key',
        isMatched: false,
        isSelected: false
      });
      
      this.valueCards.push({
        id: index,
        content: card.value,
        type: 'value',
        isMatched: false,
        isSelected: false
      });
    });
    
    // Shuffle both arrays
    this.shuffleCards();
  }
  
  shuffleCards(): void {
    this.keyCards = this.shuffleArray([...this.keyCards]);
    this.valueCards = this.shuffleArray([...this.valueCards]);
  }
  
  shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  
  selectCard(card: MatchingCard): void {
    // If card is already matched or the same card is clicked again, do nothing
    if (card.isMatched || 
        (card.type === 'key' && this.selectedKeyCard === card) || 
        (card.type === 'value' && this.selectedValueCard === card)) {
      return;
    }
    
    // Clear any previous messages
    this.successMessage = '';
    this.errorMessage = '';
    
    // Select the card
    card.isSelected = true;
    
    if (card.type === 'key') {
      // If a key card was already selected, deselect it
      if (this.selectedKeyCard) {
        this.selectedKeyCard.isSelected = false;
      }
      this.selectedKeyCard = card;
    } else {
      // If a value card was already selected, deselect it
      if (this.selectedValueCard) {
        this.selectedValueCard.isSelected = false;
      }
      this.selectedValueCard = card;
    }
    
    // Check if we have a pair selected
    if (this.selectedKeyCard && this.selectedValueCard) {
      this.checkMatch();
    }
  }
  
  checkMatch(): void {
    if (!this.selectedKeyCard || !this.selectedValueCard) return;
    
    // Check if IDs match (meaning they're from the same flash card)
    if (this.selectedKeyCard.id === this.selectedValueCard.id) {
      // It's a match!
      this.selectedKeyCard.isMatched = true;
      this.selectedValueCard.isMatched = true;
      this.matchedPairs++;
      
      this.successMessage = 'Great job! That\'s a match!';
      
      // Check if game is complete
      if (this.matchedPairs === this.totalPairs) {
        this.gameComplete = true;
        this.successMessage = 'Congratulations! You\'ve matched all pairs!';
      }
    } else {
      // Not a match
      this.errorMessage = 'Sorry, that\'s not a match. Try again!';
    }
    
    // Reset selections
    setTimeout(() => {
      if (this.selectedKeyCard) this.selectedKeyCard.isSelected = false;
      if (this.selectedValueCard) this.selectedValueCard.isSelected = false;
      this.selectedKeyCard = null;
      this.selectedValueCard = null;
    }, 1000);
  }
  
  resetGame(): void {
    const storedCards = localStorage.getItem(this.FLASH_CARDS_KEY);
    if (storedCards) {
      const flashCards: FlashCard[] = JSON.parse(storedCards);
      this.setupGame(flashCards);
    }
  }
  
  navigateToFlashCardForm(): void {
    this.router.navigate(['/flash-card-form']);
  }
}
