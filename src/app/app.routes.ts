// Le rotte sono un semplice array di oggetti, molto simile a Vue Router.
// Nota due cose moderne:
// 1) i componenti si importano direttamente e si assegnano a "component"
//    (niente più moduli "feature" con RouterModule.forChild).
// 2) la rotta di creazione task è protetta da un guard FUNZIONALE
//    (canActivateNewTask), non da una classe che implementa CanActivate
//    come si faceva 10 anni fa.
import { Routes } from '@angular/router';
import { TaskList } from './features/task-list/task-list';
import { TaskDetail } from './features/task-detail/task-detail';
import { TaskForm } from './features/task-form/task-form';
import { Login } from './features/login/login';
import { TaskSearch } from './features/task-search/task-search';
import { canActivateNewTask } from './core/auth-guard';

export const routes: Routes = [
  { path: '', component: TaskList, pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'search', component: TaskSearch },
  // withComponentInputBinding (vedi app.config.ts non serve qui perché lo
  // impostiamo tramite provideRouter) fa sì che il parametro di rotta ":id"
  // arrivi direttamente come input() nel componente, senza leggere
  // manualmente ActivatedRoute — vedi TaskDetail.
  { path: 'tasks/:id', component: TaskDetail },
  {
    path: 'new',
    component: TaskForm,
    canActivate: [canActivateNewTask],
  },
  { path: '**', redirectTo: '' },
];
