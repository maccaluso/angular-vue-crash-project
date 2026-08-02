// Test di componente "completo": renderizza il template, simula input
// dell'utente sul campo del form, e verifica sia la validazione
// (Signal Forms) sia l'effetto collaterale (TaskStore.add chiamato).
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TaskForm } from './task-form';
import { TaskStore } from '../../core/task-store';

describe('TaskForm (Signal Forms)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskForm],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    }).compileComponents();
  });

  it('il form è invalido finché il titolo è vuoto', async () => {
    const fixture = TestBed.createComponent(TaskForm);
    fixture.detectChanges();
    await fixture.whenStable();

    const submitButton: HTMLButtonElement =
      fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(true);
  });

  it('mostra l\'errore di lunghezza minima se il titolo è troppo corto', async () => {
    const fixture = TestBed.createComponent(TaskForm);
    fixture.detectChanges();
    await fixture.whenStable();

    // Non esiste un modo per "chiamare" [formField] direttamente da un
    // test: è una direttiva che ascolta eventi DOM nativi, come farebbe
    // un v-model di Vue sotto il cofano. Per simulare "l'utente scrive"
    // bisogna impostare .value come farebbe il browser E sparare
    // manualmente l'evento — senza dispatchEvent('input') Angular non si
    // accorgerebbe del cambio, perché non osserva .value, osserva
    // l'evento.
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#title');
    input.value = 'ab'; // 2 caratteri: sotto il minimo di 3
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur')); // serve a marcare il campo "touched"
    // In zoneless nulla si propaga "da solo" nei test: dopo ogni evento
    // simulato serve sempre detectChanges() + whenStable() prima di
    // poter leggere il DOM aggiornato in modo affidabile (non serve
    // nell'app reale, è specifico dei test).
    fixture.detectChanges();
    await fixture.whenStable();

    const errorText = fixture.nativeElement.querySelector('.error')?.textContent;
    expect(errorText).toContain('almeno 3 caratteri');
  });

  it('alla submit valida chiama TaskStore.add() e naviga alla lista', async () => {
    const fixture = TestBed.createComponent(TaskForm);
    const store = TestBed.inject(TaskStore);
    const router = TestBed.inject(Router);
    // Uno spy avvolge un metodo reale per OSSERVARE le chiamate (quante
    // volte, con quali argomenti) senza sostituirne il comportamento di
    // default — diverso da un mock/stub che rimpiazzerebbe la funzione
    // con una finta. Qui serve perché non vogliamo (né possiamo, in
    // test) verificare una vera navigazione: ci basta la prova che il
    // componente abbia TENTATO di navigare verso '/'.
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');

    fixture.detectChanges();
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('#title');
    input.value = 'Comprare il latte';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    const form: HTMLFormElement = fixture.nativeElement.querySelector('form');
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(store.tasks().some((t) => t.title === 'Comprare il latte')).toBe(true);
    expect(navigateSpy).toHaveBeenCalledWith('/');
  });
});
