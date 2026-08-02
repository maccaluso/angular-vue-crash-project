// Test "smoke" del componente radice: verifica solo che si crei senza
// esplodere. È il minimo indispensabile, utile soprattutto come esempio
// di setup TestBed con Vitest per un componente standalone.
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { App } from './app';

describe('App (componente radice)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // I componenti standalone si "importano" nel TestBed esattamente
      // come nel decoratore @Component di un altro componente: non serve
      // dichiarare nulla.
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        // Il componente usa routerLink/router-outlet, quindi il router
        // deve essere disponibile anche nel contesto di test.
        provideRouter([]),
      ],
    }).compileComponents();
  });

  // "Smoke test": il test più basilare possibile, verifica solo che
  // qualcosa "si accenda" senza errori — non la logica di business. Se
  // createComponent() incontra un errore nel costruttore, nella DI, o
  // nel template, lancia un'eccezione prima ancora di arrivare a
  // expect(). Utile perché in un progetto reale, se si rompe la
  // configurazione dei provider globali in app.config.ts, questo è il
  // test che fallisce per primo e indica subito dove guardare.
  it('si crea correttamente', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('mostra il titolo nel template', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const heading = fixture.nativeElement.querySelector('h1');
    expect(heading?.textContent).toContain('Task Board');
  });
});
