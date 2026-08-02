// Testare un Injectable "semplice" come TaskStore non richiede quasi
// nulla di speciale: basta chiedere a TestBed di istanziarlo tramite DI
// (TestBed.inject), esattamente come farebbe l'app vera. Non serve
// nemmeno un componente o un TestBed.configureTestingModule complesso.
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { TaskStore } from './task-store';

describe('TaskStore (stato condiviso via DI)', () => {
  let store: TaskStore;

  // TestBed ricrea un injector nuovo per ogni it(): "store" qui è sempre
  // vergine, i test non condividono stato tra loro (isolamento). Senza
  // questo reset, add() in un test lascerebbe residui visibili nel test
  // successivo, e l'esito dipenderebbe dall'ordine di esecuzione — un
  // classico errore da evitare nei test.
  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(TaskStore);
  });

  it('parte vuoto', () => {
    expect(store.tasks()).toEqual([]);
    expect(store.totalCount()).toBe(0);
    expect(store.completedCount()).toBe(0);
  });

  it('add() aggiunge un task e aggiorna i signal derivati', () => {
    // Pattern AAA: Arrange è implicito (store pulito dal beforeEach),
    // Act è la riga sotto, Assert sono i vari expect() che seguono —
    // sia sullo stato diretto (tasks) sia su quello derivato
    // (totalCount/completedCount, computed da tasks).
    store.add('Ripassare Angular');

    expect(store.tasks().length).toBe(1);
    expect(store.tasks()[0].title).toBe('Ripassare Angular');
    expect(store.tasks()[0].completed).toBe(false);
    expect(store.totalCount()).toBe(1);
    expect(store.completedCount()).toBe(0);
  });

  it('toggle() inverte lo stato completed del task giusto', () => {
    store.add('Task A');
    store.add('Task B');
    // Attenzione all'ordine: la destrutturazione riflette l'ordine reale
    // dell'array, non l'ordine di inserimento. add() mette in cima
    // (vedi task-store.ts), quindi l'ultimo aggiunto (B) è il primo
    // elemento. Invertire questi due nomi per errore farebbe passare il
    // test "per caso" solo se il bug cercato non tocca questa asserzione
    // — un esempio concreto di test che sembra corretto ma verifica la
    // cosa sbagliata.
    const [taskB, taskA] = store.tasks(); // add() mette in cima, quindi B è primo

    store.toggle(taskA.id);

    expect(store.findById(taskA.id)?.completed).toBe(true);
    expect(store.findById(taskB.id)?.completed).toBe(false);
    // completedCount è un computed: deve riflettere subito il cambiamento
    expect(store.completedCount()).toBe(1);
  });

  it('remove() elimina il task e riduce i contatori derivati', () => {
    store.add('Task da rimuovere');
    const [task] = store.tasks();

    store.remove(task.id);

    expect(store.tasks()).toEqual([]);
    expect(store.totalCount()).toBe(0);
  });

  it('hydrate() sostituisce interamente la lista (usato da TaskList)', () => {
    store.hydrate([
      { id: 1, title: 'Da remoto 1', completed: false },
      { id: 2, title: 'Da remoto 2', completed: true },
    ]);

    expect(store.totalCount()).toBe(2);
    expect(store.completedCount()).toBe(1);
  });
});
