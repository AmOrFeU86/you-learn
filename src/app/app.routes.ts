import { Routes } from '@angular/router';
import { ConceptListComponent } from './components/concept-list/concept-list.component';
import { FlashCardsComponent } from './components/flash-cards/flash-cards.component';
import { DataFormComponent } from './components/data-form/data-form.component';
import { FlashCardFormComponent } from './components/flash-card-form/flash-card-form.component';
import { MatchingGameComponent } from './components/matching-game/matching-game.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { QuizFormComponent } from './components/quiz-form/quiz-form.component';
import { StudyTipsComponent } from './components/study-tips/study-tips.component';

export const routes: Routes = [
  { path: '', redirectTo: '/concepts', pathMatch: 'full' },
  { path: 'concepts', component: ConceptListComponent },
  { path: 'flash-cards', component: FlashCardsComponent },
  { path: 'flash-card-form', component: FlashCardFormComponent },
  { path: 'matching-game', component: MatchingGameComponent },
  { path: 'quiz', component: QuizComponent },
  { path: 'quiz-form', component: QuizFormComponent },
  { path: 'study-tips', component: StudyTipsComponent },
  { path: 'data', component: DataFormComponent }
];
