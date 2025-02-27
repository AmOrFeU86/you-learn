import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConceptService } from '../../services/concept.service';
import { Concept } from '../../models/concept.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import Chart from 'chart.js/auto';

interface FlashCardStatus {
  conceptId: number;
  status: 'unseen' | 'bad' | 'good' | 'super_good' | 'excellent';
  lastUpdated: number; // timestamp
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
  allConcepts: Concept[] = [];
  studyQueue: Concept[] = [];
  currentCard: Concept | null = null;
  showDescription = false;
  progressStats: ProgressStats = { unseen: 0, bad: 0, good: 0, super_good: 0, excellent: 0 };
  
  @ViewChild('progressChart') progressChartRef!: ElementRef<HTMLCanvasElement>;
  progressChart: Chart | null = null;
  chartInitialized = false;
  
  // Key for storing flash card progress in localStorage
  private readonly FLASH_CARDS_PROGRESS_KEY = 'youlearn-flashcards-progress';
  
  // Track progress for each concept
  cardStatuses: FlashCardStatus[] = [];

  constructor(
    private conceptService: ConceptService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadProgress();
    this.loadConcepts();
  }
  
  ngOnDestroy(): void {
    if (this.progressChart) {
      this.progressChart.destroy();
    }
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  loadConcepts(): void {
    this.conceptService.getConcepts().subscribe({
      next: (concepts) => {
        this.allConcepts = concepts;
        this.prepareStudyQueue();
        
        // Inicializar el gráfico después de cargar los conceptos, pero solo una vez
        if (!this.chartInitialized && this.progressChartRef) {
          setTimeout(() => {
            this.calculateProgressStats();
            this.initializeChart();
          }, 500);
        }
      },
      error: (error) => {
        console.error('Error loading concepts:', error);
      }
    });
  }

  loadProgress(): void {
    const savedProgress = localStorage.getItem(this.FLASH_CARDS_PROGRESS_KEY);
    if (savedProgress) {
      try {
        const parsedData = JSON.parse(savedProgress);
        
        if (Array.isArray(parsedData)) {
          this.cardStatuses = parsedData.map((status: any) => {
            if (!('lastUpdated' in status)) {
              return {
                conceptId: status.conceptId,
                status: status.status,
                lastUpdated: Date.now()
              };
            }
            return status as FlashCardStatus;
          });
        } else {
          console.error('Invalid flash card progress data format');
          this.cardStatuses = [];
        }
      } catch (error) {
        console.error('Error loading flash card progress:', error);
        this.cardStatuses = [];
      }
    }
  }

  saveProgress(): void {
    localStorage.setItem(this.FLASH_CARDS_PROGRESS_KEY, JSON.stringify(this.cardStatuses));
  }

  prepareStudyQueue(): void {
    if (this.allConcepts.length === 0) return;
    
    this.studyQueue = this.allConcepts.filter(concept => {
      const status = this.getConceptStatus(concept.id);
      return status !== 'excellent';
    });
    
    this.shuffleArray(this.studyQueue);
    
    if (this.studyQueue.length > 0) {
      this.currentCard = this.studyQueue[0];
      this.showDescription = false;
    } else {
      this.currentCard = null;
    }
  }

  getConceptStatus(conceptId: number): 'unseen' | 'bad' | 'good' | 'super_good' | 'excellent' {
    const statusRecord = this.cardStatuses.find(status => status.conceptId === conceptId);
    return statusRecord ? statusRecord.status : 'unseen';
  }

  updateConceptStatus(status: 'bad' | 'good' | 'super_good' | 'excellent'): void {
    if (!this.currentCard) return;
    
    // Actualizar el estado en memoria
    const existingStatusIndex = this.cardStatuses.findIndex(
      s => s.conceptId === this.currentCard!.id
    );
    
    if (existingStatusIndex >= 0) {
      this.cardStatuses[existingStatusIndex].status = status;
      this.cardStatuses[existingStatusIndex].lastUpdated = Date.now();
    } else {
      this.cardStatuses.push({
        conceptId: this.currentCard.id,
        status: status,
        lastUpdated: Date.now()
      });
    }
    
    // Guardar en localStorage
    this.saveProgress();
    
    // Mover a la siguiente tarjeta primero
    this.nextCard();
    
    // Actualizar el gráfico después, para evitar bloqueos
    setTimeout(() => {
      this.calculateProgressStats();
      this.updateChart();
    }, 0);
  }

  toggleDescription(): void {
    this.showDescription = !this.showDescription;
  }

  nextCard(): void {
    if (this.currentCard) {
      const currentIndex = this.studyQueue.findIndex(c => c.id === this.currentCard!.id);
      if (currentIndex >= 0) {
        this.studyQueue.splice(currentIndex, 1);
      }
    }
    
    if (this.studyQueue.length > 0) {
      this.currentCard = this.studyQueue[0];
      this.showDescription = false;
    } else {
      this.currentCard = null;
    }
  }

  resetProgress(): void {
    if (confirm('Are you sure you want to reset all flash card progress?')) {
      this.cardStatuses = [];
      this.saveProgress();
      this.prepareStudyQueue();
      
      // Actualizar el gráfico después, para evitar bloqueos
      setTimeout(() => {
        this.calculateProgressStats();
        this.updateChart();
      }, 0);
    }
  }
  
  calculateProgressStats(): void {
    if (this.allConcepts.length === 0) return;
    
    this.progressStats = { unseen: 0, bad: 0, good: 0, super_good: 0, excellent: 0 };
    
    const totalConcepts = this.allConcepts.length;
    
    this.cardStatuses.forEach(status => {
      if (this.progressStats[status.status] !== undefined) {
        this.progressStats[status.status]++;
      }
    });
    
    const seenCount = this.cardStatuses.length;
    this.progressStats.unseen = Math.max(0, totalConcepts - seenCount);
  }
  
  initializeChart(): void {
    if (this.chartInitialized || !this.progressChartRef) return;
    
    const ctx = this.progressChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    
    try {
      this.progressChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Not Seen', 'Bad', 'Good', 'Very Good', 'Excellent'],
          datasets: [{
            data: [
              this.progressStats.unseen,
              this.progressStats.bad,
              this.progressStats.good,
              this.progressStats.super_good,
              this.progressStats.excellent
            ],
            backgroundColor: [
              '#e0e0e0', // Not seen - light gray
              '#f44336', // Bad - red
              '#4caf50', // Good - green
              '#2196f3', // Very Good - blue
              '#9c27b0'  // Excellent - purple
            ]
          }]
        },
        options: {
          responsive: true,
          animation: false, // Desactivar animaciones para mejorar rendimiento
          plugins: {
            legend: {
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.raw as number;
                  const total = context.chart.data.datasets[0].data.reduce((a, b) => (a as number) + (b as number), 0) as number;
                  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
      
      this.chartInitialized = true;
    } catch (error) {
      console.error('Error initializing chart:', error);
    }
  }
  
  updateChart(): void {
    if (!this.progressChart || !this.chartInitialized) return;
    
    try {
      // Actualizar datos sin animación
      this.progressChart.data.datasets[0].data = [
        this.progressStats.unseen,
        this.progressStats.bad,
        this.progressStats.good,
        this.progressStats.super_good,
        this.progressStats.excellent
      ];
      
      // Actualizar el gráfico con animaciones desactivadas
      this.progressChart.update('none');
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  }

  private shuffleArray(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  get totalConcepts(): number {
    return this.allConcepts.length;
  }
  
  get masteredPercentage(): number {
    if (this.totalConcepts === 0) return 0;
    return Math.round((this.progressStats.excellent / this.totalConcepts) * 100);
  }
}
