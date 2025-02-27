import { Routes } from '@angular/router';
import { ConceptListComponent } from './components/concept-list/concept-list.component';
import { FlashCardsComponent } from './components/flash-cards/flash-cards.component';
import { DataFormComponent } from './components/data-form/data-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/concepts', pathMatch: 'full' },
  { path: 'concepts', component: ConceptListComponent },
  { path: 'flash-cards', component: FlashCardsComponent },
  { path: 'data', component: DataFormComponent }
];
