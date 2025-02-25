import { Routes } from '@angular/router';
import { ConceptListComponent } from './components/concept-list/concept-list.component';
import { FlashCardsComponent } from './components/flash-cards/flash-cards.component';

export const routes: Routes = [
  { path: '', redirectTo: '/concepts', pathMatch: 'full' },
  { path: 'concepts', component: ConceptListComponent },
  { path: 'flash-cards', component: FlashCardsComponent }
];
