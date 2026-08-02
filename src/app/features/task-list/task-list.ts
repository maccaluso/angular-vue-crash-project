// ---------------------------------------------------------------------
// httpResource(): data fetching dichiarativo, senza scrivere .subscribe()
// a mano né gestire manualmente loading/error come un tempo con RxJS.
// ---------------------------------------------------------------------
// L'idea: al primo render, httpResource() lancia la richiesta HTTP e ci
// dà indietro dei signal (isLoading/error/value/hasValue) che leggiamo
// nel template. Qui usiamo l'API pubblica JSONPlaceholder solo per avere
// dati "veri" da mostrare la prima volta; da lì in poi tutte le modifiche
// (add/toggle/remove) vivono nello store condiviso (TaskStore), perché
// JSONPlaceholder non persiste davvero le scritture — in un progetto
// reale il tuo backend sostituirebbe questa URL e le mutazioni
// chiamerebbero endpoint veri (POST/PATCH/DELETE).
import { Component, ViewEncapsulation, effect, inject } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { TaskItem } from '../task-item/task-item';
import { TaskStore } from '../../core/task-store';
import { RemoteTodo } from '../../core/task.model';
import { sharedStyles } from '../../design-system/shared.styles';

@Component({
  selector: 'app-task-list',
  imports: [TaskItem],
  templateUrl: './task-list.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    sharedStyles,
    `
      .task-list {
        margin: 1rem 0 0;
        padding: 0;
        list-style: none;
        border-radius: var(--ds-radius-lg);
        border: 1px solid var(--ds-color-border);
        background: var(--ds-color-surface);
        overflow: hidden;
      }
      /* Equivalente di divide-y di Tailwind: un bordo TRA gli elementi,
         non sul primo. */
      .task-list > li + li {
        border-top: 1px solid var(--ds-color-border);
      }
      .task-list__empty {
        padding: 1.5rem 1rem;
        text-align: center;
        font-size: var(--ds-text-sm);
        color: var(--ds-color-text-subtle);
      }
    `,
  ],
})
export class TaskList {
  protected readonly store = inject(TaskStore);

  // httpResource<T>(() => url) restituisce un oggetto con dei signal:
  // isLoading(), error(), value(), hasValue(). Non serve un OnInit né un
  // ngOnDestroy per fare cleanup: se il componente viene distrutto,
  // httpResource si disiscrive da solo.
  //
  // Rapporto con RxJS/Observable: httpResource() non sostituisce gli
  // Observable, li NASCONDE. Sotto il cofano HttpClient è ancora basato
  // su Observable — qui la subscribe() la fa Angular per te e ti
  // restituisce il risultato già tradotto in signal. Se un giorno serve
  // un vero Observable con operatori RxJS (debounceTime, switchMap per
  // un tipeahead, ecc.), la funzione da usare è rxResource() (stessa
  // ergonomia a signal, ma loader basato su Observable); resource() è
  // la versione generica per qualsiasi loader asincrono, non solo HTTP.
  // toSignal()/toObservable() sono i "ponti" per convertire tra i due
  // mondi altrove nell'app (es. router.events, form.valueChanges).
  //
  // Nota anche dai test (task-list.spec.ts): finché questa richiesta è
  // pending, l'app zoneless non è "stabile" — fixture.whenStable() nel
  // test resterebbe bloccato se chiamato prima di rispondere alla
  // richiesta mock.
  protected readonly remoteTasks = httpResource<RemoteTodo[]>(
    () => 'https://jsonplaceholder.typicode.com/todos?_limit=5',
  );

  constructor() {
    // effect() reagisce ogni volta che i signal che legge al suo interno
    // cambiano — qui "aspetta" che remoteTasks abbia un valore, poi
    // idrata lo store UNA SOLA VOLTA. È l'equivalente di un
    // `watch(remoteTasks, ...)` in Vue, ma senza dover dichiarare
    // esplicitamente le dipendenze: Angular le rileva da sole leggendo
    // i signal dentro la funzione.
    //
    // Nota: il corpo legge SIA remoteTasks.value() SIA
    // store.totalCount() — quindi l'effect si riattiva anche dopo ogni
    // add()/toggle()/remove() sullo store (perché totalCount cambia),
    // non solo quando arriva la risposta HTTP. La guardia
    // `totalCount() === 0` è ciò che rende l'idratazione "una sola
    // volta": il resto delle riattivazioni non entra nell'if.
    effect(() => {
      const data = this.remoteTasks.value();
      if (data && this.store.totalCount() === 0) {
        this.store.hydrate(
          data.map((t) => ({ id: t.id, title: t.title, completed: t.completed })),
        );
      }
    });
  }
}
