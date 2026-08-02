// Le rotte sono un semplice array di oggetti, molto simile a Vue Router.
// Nota tre cose moderne:
// 1) i componenti si importano direttamente e si assegnano a "component"
//    (niente più moduli "feature" con RouterModule.forChild).
// 2) la rotta di creazione task è protetta da un guard FUNZIONALE
//    (canActivateNewTask), non da una classe che implementa CanActivate
//    come si faceva 10 anni fa. È protetta anche in uscita da un guard
//    CanDeactivate (canDeactivateTaskForm) — vedi core/can-deactivate.guard.ts.
// 3) tutte le rotte tranne quella di default usano loadComponent invece
//    di component: il codice di quella feature finisce in un chunk JS
//    SEPARATO, scaricato solo quando l'utente ci naviga davvero (o in
//    anticipo, se è attivo il preloading — vedi app.config.ts). TaskList
//    resta invece "eager" (component diretto): è la home, si carica
//    comunque all'avvio, non ha senso separarla in un chunk a parte.
import { Routes } from '@angular/router';
import { TaskList } from './features/task-list/task-list';
import { canActivateNewTask } from './core/auth-guard';
import { canDeactivateTaskForm } from './core/can-deactivate.guard';

export const routes: Routes = [
  { path: '', component: TaskList, pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'search',
    loadComponent: () => import('./features/task-search/task-search').then((m) => m.TaskSearch),
  },
  // withComponentInputBinding (vedi app.config.ts non serve qui perché lo
  // impostiamo tramite provideRouter) fa sì che il parametro di rotta ":id"
  // arrivi direttamente come input() nel componente, senza leggere
  // manualmente ActivatedRoute — vedi TaskDetail.
  {
    path: 'tasks/:id',
    loadComponent: () =>
      import('./features/task-detail/task-detail').then((m) => m.TaskDetail),
  },
  {
    path: 'new',
    loadComponent: () => import('./features/task-form/task-form').then((m) => m.TaskForm),
    canActivate: [canActivateNewTask],
    canDeactivate: [canDeactivateTaskForm],
  },
  { path: '**', redirectTo: '' },
];
