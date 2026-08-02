// ---------------------------------------------------------------------
// Questo componente dimostra ENTRAMBE le tecniche di comunicazione:
// - il dato "task" arriva dal padre come input() (come una prop Vue)
// - ma l'AZIONE di toggle/remove non passa da un output() che risale
//   fino al padre: TaskItem inietta TaskStore direttamente e chiama i
//   suoi metodi. Se TaskItem fosse annidato 5 livelli più in profondità,
//   non cambierebbe nulla: nessun componente intermedio dovrebbe
//   conoscere l'esistenza di questo evento.
import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Task } from '../../core/task.model';
import { TaskStore } from '../../core/task-store';

@Component({
  selector: 'app-task-item',
  imports: [RouterLink],
  templateUrl: './task-item.html',
})
export class TaskItem {
  // input() sostituisce @Input(). required: true equivale a una prop
  // obbligatoria in Vue (senza valore di default).
  //
  // Nota: questo NON corrisponde all'oggetto `props` che ottieni da
  // defineProps() in Vue (un'unica entità reattiva che raggruppa tutte
  // le prop). Angular non ha un "props bag" unico: ogni input() è il
  // suo signal indipendente. L'equivalente Vue più preciso non è
  // `props.task`, ma `toRef(props, 'task').value` — l'estrazione di un
  // singolo campo reattivo.
  readonly task = input.required<Task>();

  // inject() funziona solo in un injection context: qui come
  // inizializzatore di campo, oppure nel costruttore, oppure in una
  // funzione factory. Non è chiamabile dentro un metodo qualsiasi come
  // toggle()/remove() sotto — a differenza di un composable Vue tipo
  // useTaskStore(), che puoi invocare più liberamente nel setup().
  private readonly store = inject(TaskStore);

  toggle(): void {
    this.store.toggle(this.task().id);
  }

  remove(): void {
    this.store.remove(this.task().id);
  }
}
