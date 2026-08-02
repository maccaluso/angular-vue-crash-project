import { Component, ViewEncapsulation, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { sharedStyles } from '../../design-system/shared.styles';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [sharedStyles, `.btn { margin-top: 1rem; }`],
})
export class Login {
  // inject() al posto del constructor: funziona identico, ma si può usare
  // anche fuori dal costruttore (es. come inizializzatore di campo) ed è
  // la forma oggi raccomandata.
  //
  // Nota su "protected" (non "private"): login.html legge
  // authService.isLoggedIn() direttamente sulla classe. Con
  // strictTemplates: true (vedi tsconfig.json) Angular verifica
  // l'accessibilità a compile-time — se fosse "private" la compilazione
  // del template fallirebbe. A differenza di <script setup> in Vue, dove
  // tutto è automaticamente visibile al template, qui serve esporre
  // esplicitamente con "protected" o "public" ciò che il template usa.
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  login(): void {
    this.authService.login();
    // Dopo il login torniamo alla rotta che l'utente voleva raggiungere.
    // Per semplicità qui andiamo sempre a /new (nella tua app reale
    // potresti leggere un returnUrl passato come query param).
    this.router.navigateByUrl('/new');
  }

  logout(): void {
    this.authService.logout();
  }
}
