import { Routes } from '@angular/router';
import { ConceptListComponent } from './components/concept-list/concept-list.component';
import { FlashCardsComponent } from './components/flash-cards/flash-cards.component';
import { DataFormComponent } from './components/data-form/data-form.component';
import { FlashCardFormComponent } from './components/flash-card-form/flash-card-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/concepts', pathMatch: 'full' },
  { path: 'concepts', component: ConceptListComponent },
  { path: 'flash-cards', component: FlashCardsComponent },
  { path: 'flash-card-form', component: FlashCardFormComponent },
  { path: 'data', component: DataFormComponent }
];
