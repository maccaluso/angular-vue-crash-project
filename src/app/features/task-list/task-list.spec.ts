// Testare un componente che usa httpResource() richiede di controllare
// la rete finta: provideHttpClientTesting() sostituisce l'HttpClient
// reale con uno "spiabile" tramite HttpTestingController, così possiamo
// decidere noi cosa risponde la richiesta, senza contattare davvero
// JSONPlaceholder durante i test.
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskList } from './task-list';
import { TaskStore } from '../../core/task-store';

describe('TaskList (httpResource + TaskStore condiviso)', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskList],
      providers: [
        provideZonelessChangeDetection(),
        // Richiesto perché TaskItem (renderizzato dentro TaskList) usa
        // routerLink, che inietta ActivatedRoute — senza questo provider
        // il test falliva con NG0201 "No provider found for ActivatedRoute".
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica che non siano rimaste richieste HTTP "orfane" non gestite.
    httpMock.verify();
  });

  it('idrata TaskStore con i dati restituiti da httpResource', async () => {
    const fixture = TestBed.createComponent(TaskList);
    fixture.detectChanges();

    // NON mettere qui un `await fixture.whenStable()` prima di rispondere
    // alla richiesta: httpResource() registra la GET come "pending task"
    // per la stabilità dell'app zoneless, quindi whenStable() resterebbe
    // bloccato in attesa di una richiesta che nessuno ha ancora evaso —
    // un deadlock (era il bug originale di questo test, andava in
    // timeout dopo 5s). L'ordine corretto è: detectChanges() per far
    // partire la richiesta, POI intercettarla ed evaderla con
    // httpMock, SOLO DOPO aspettare whenStable().

    // httpResource ha effettuato una GET reale (intercettata dal mock):
    // la assecondiamo con una risposta finta di due "todo".
    const req = httpMock.expectOne(
      'https://jsonplaceholder.typicode.com/todos?_limit=5',
    );
    expect(req.request.method).toBe('GET');
    req.flush([
      { id: 1, title: 'Todo remoto 1', completed: false },
      { id: 2, title: 'Todo remoto 2', completed: true },
    ]);

    // Dopo la risposta, l'effect() nel componente idrata lo store.
    await fixture.whenStable();
    fixture.detectChanges();

    const store = TestBed.inject(TaskStore);
    expect(store.totalCount()).toBe(2);
    expect(store.completedCount()).toBe(1);

    // E il template deve aver renderizzato due <app-task-item>. Basta un
    // solo salto in .shadowRoot: qui cerchiamo i TAG <app-task-item>
    // dentro lo shadow root DI TaskList, non dentro quello (separato) di
    // ciascun TaskItem — per contare quanti elementi sono stati creati
    // non serve entrare nel loro shadow root individuale.
    const items = fixture.nativeElement.shadowRoot!.querySelectorAll('app-task-item');
    expect(items.length).toBe(2);
  });
});
