// ---------------------------------------------------------------------
// Guard FUNZIONALE: la novità rispetto a 10 anni fa.
// ---------------------------------------------------------------------
// Un tempo un guard era una classe che implementava CanActivate, si
// registrava nei providers e veniva iniettata dal router con un sistema
// di token dedicato. Oggi un guard è semplicemente una funzione con la
// forma CanActivateFn: la registri direttamente nell'array "canActivate"
// della rotta (vedi app.routes.ts) e usi inject() per recuperare i
// servizi che ti servono, esattamente come faresti dentro un componente.
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const canActivateNewTask: CanActivateFn = () => {
  // inject() qui è legittimo anche se non siamo in un costruttore o in
  // un inizializzatore di campo (vedi task-item.ts): il router invoca
  // le funzioni guard dentro un injection context che crea lui stesso.
  // È un terzo caso di injection context valido, oltre ai due già visti
  // — la regola resta sempre "solo dentro un injection context", qui
  // è semplicemente il chiamante (il router) a fornirlo.
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // UrlTree: il modo idiomatico per "redirigere" da un guard, invece di
  // restituire false e basta (che lascerebbe l'utente su una pagina bianca).
  return router.createUrlTree(['/login']);
};
