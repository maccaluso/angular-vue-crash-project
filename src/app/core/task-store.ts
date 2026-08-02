// ---------------------------------------------------------------------
// QUESTO FILE è la risposta pratica alla tua domanda sul prop drilling.
// ---------------------------------------------------------------------
//
// TaskStore è un Injectable "qualsiasi": una classe con dei signal dentro.
// Grazie a `providedIn: 'root'`, Angular crea UN'UNICA istanza condivisa
// per tutta l'applicazione (esattamente come un singolo store Pinia).
//
// Qualunque componente, a qualsiasi profondità nell'albero, può fare
// `private store = inject(TaskStore)` e leggere/scrivere lo stato
// condiviso — senza che i componenti intermedi debbano passarselo con
// @Input()/@Output(). Questo è il meccanismo nativo di Angular (DI
// gerarchica) che sostituisce sia il prop drilling sia, per stati più
// semplici, anche una libreria come Pinia.
//
// In Vue scriveresti l'equivalente come uno store Pinia:
//
//   export const useTaskStore = defineStore('tasks', () => {
//     const tasks = ref<Task[]>([]);
//     const completedCount = computed(() => tasks.value.filter(t => t.completed).length);
//     function add(title: string) { tasks.value.push({ id: ..., title, completed: false }); }
//     return { tasks, completedCount, add };
//   });
//
// La versione Angular con i signal è concettualmente identica.

import { Injectable, computed, signal } from '@angular/core';
import { Task } from './task.model';

@Injectable({ providedIn: 'root' })
export class TaskStore {
  // Stato privato: il segnale "grezzo" non è esposto in scrittura libera
  // all'esterno, solo tramite i metodi sotto (stesso principio di
  // incapsulamento che useresti in un composable Vue con un ref privato).
  //
  // ATTENZIONE — niente reactive() qui: a differenza di Vue, i signal
  // NON hanno reattività "deep". Non c'è un Proxy che intercetta le
  // mutazioni a proprietà annidate: Angular decide se notificare i
  // consumer confrontando (Object.is) il vecchio e il nuovo riferimento
  // di livello superiore. Mutare `_tasks()[0].completed = true` non
  // scatenerebbe alcun aggiornamento — per questo ogni metodo sotto
  // (hydrate/add/toggle/remove) costruisce sempre un NUOVO array invece
  // di mutare quello esistente. Non è stile, è l'unico modo per far
  // funzionare la reattività.
  private readonly _tasks = signal<Task[]>([]);

  // Esposto in sola lettura (come Vue fa con readonly(tasks) in alcuni
  // composable): i consumer possono leggere ma non riassegnare tasks.set(...).
  //
  // Nota tecnica: `tasks` e `_tasks` sono due FUNZIONI DISTINTE
  // (tasks !== _tasks), non lo stesso riferimento JS. asReadonly() crea
  // un nuovo "accessor" che punta alla stessa cella di stato interna di
  // _tasks: leggono sempre lo stesso valore corrente perché guardano lo
  // stesso posto in ogni istante, non perché sono la stessa variabile.
  readonly tasks = this._tasks.asReadonly();

  // Stato derivato: si ricalcola automaticamente quando `tasks` cambia,
  // esattamente come un computed() in Vue.
  readonly completedCount = computed(
    () => this._tasks().filter((t) => t.completed).length,
  );

  readonly totalCount = computed(() => this._tasks().length);

  /** Sostituisce l'intera lista (usato per idratare lo store con i dati
   *  arrivati da httpResource in TaskList). */
  hydrate(tasks: Task[]): void {
    this._tasks.set(tasks);
  }

  /** Aggiunge un nuovo task in cima alla lista. */
  add(title: string): void {
    const nextId = Math.max(0, ...this._tasks().map((t) => t.id)) + 1;
    this._tasks.update((current) => [
      { id: nextId, title, completed: false },
      ...current,
    ]);
  }

  /** Inverte lo stato "completed" di un task dato il suo id. */
  toggle(id: number): void {
    this._tasks.update((current) =>
      current.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }

  /** Rimuove un task dato il suo id. */
  remove(id: number): void {
    this._tasks.update((current) => current.filter((t) => t.id !== id));
  }

  /** Recupera un singolo task per id (usato da TaskDetail). Non è un
   *  signal: è una lettura puntuale, calcolata al momento della chiamata. */
  findById(id: number): Task | undefined {
    return this._tasks().find((t) => t.id === id);
  }
}
