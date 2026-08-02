// Grazie a withComponentInputBinding() (vedi app.config.ts), il parametro
// di rotta ":id" (stringa) arriva già pronto come input() chiamato "id":
// non serve iniettare ActivatedRoute e fare route.snapshot.paramMap.get().
// È l'equivalente diretto di come Vue Router passa i "props" di rotta
// quando configuri { path: '/tasks/:id', props: true }.
import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { TaskStore } from '../../core/task-store';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.html',
})
export class TaskDetail {
  // Il valore arriva come stringa dall'URL: lo teniamo così e lo
  // convertiamo dove serve, per restare espliciti.
  readonly id = input.required<string>();

  private readonly store = inject(TaskStore);
  private readonly router = inject(Router);

  // computed derivato sia dal signal "id" (input di rotta) sia dai task
  // nello store: si ricalcola automaticamente se cambia uno dei due.
  //
  // Perché funziona anche se store.findById() non è un signal: il
  // tracking automatico delle dipendenze osserva QUALI signal vengono
  // letti durante l'esecuzione, ANCHE attraverso chiamate di funzione,
  // purché sincrone. findById() legge this._tasks() al suo interno
  // (vedi task-store.ts) — quella lettura "attraversa" la chiamata e
  // viene comunque registrata come dipendenza di QUESTO computed. Stesso
  // principio dell'effect() in task-list.ts, solo meno visibile perché
  // la lettura del signal avviene dentro un metodo, non inline qui.
  protected readonly task = computed(() => this.store.findById(Number(this.id())));

  toggle(): void {
    const current = this.task();
    if (current) {
      this.store.toggle(current.id);
    }
  }

  remove(): void {
    const current = this.task();
    if (current) {
      this.store.remove(current.id);
      this.router.navigateByUrl('/');
    }
  }
}
