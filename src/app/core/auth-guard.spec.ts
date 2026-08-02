// Testare un guard funzionale richiede un piccolo trucco: le funzioni
// come canActivateNewTask usano inject() al loro interno, quindi vanno
// eseguite dentro un "injection context". TestBed.runInInjectionContext
// serve esattamente a questo.
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { canActivateNewTask } from './auth-guard';
import { AuthService } from './auth.service';

describe('canActivateNewTask (guard funzionale)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('nega l\'accesso e reindirizza a /login se l\'utente non è loggato', () => {
    // { } as any per route/state: il guard non li legge mai (usa solo
    // AuthService), quindi qui il tipo esatto è irrilevante ai fini del
    // test — un compromesso accettabile solo quando sai che quei
    // parametri non vengono usati.
    const result = TestBed.runInInjectionContext(() => canActivateNewTask({} as any, {} as any));

    // Non loggato per default (vedi AuthService): ci aspettiamo un UrlTree
    // di redirect, non semplicemente `false`.
    // toBeInstanceOf verifica il TIPO del risultato, non un valore
    // preciso: è un modo robusto di confermare "è stato generato un
    // redirect" senza legarsi ai dettagli esatti dell'URL.
    expect(result).toBeInstanceOf(UrlTree);
  });

  it('permette l\'accesso se l\'utente è loggato', () => {
    // TestBed.inject(AuthService) qui e inject(AuthService) dentro il
    // guard restituiscono la STESSA istanza (stesso injector di questo
    // TestBed, providedIn: 'root') — per questo forzare login() qui ha
    // effetto quando il guard gira subito dopo.
    const authService = TestBed.inject(AuthService);
    authService.login();

    const result = TestBed.runInInjectionContext(() => canActivateNewTask({} as any, {} as any));

    expect(result).toBe(true);
  });
});
