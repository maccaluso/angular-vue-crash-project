// Servizio di autenticazione "finto": basta per dimostrare come un guard
// funzionale legge lo stato tramite DI. In un'app reale qui ci sarebbe
// una vera chiamata di login e magari un token in httpResource/HttpClient.
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _isLoggedIn = signal(false);
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  login(): void {
    this._isLoggedIn.set(true);
  }

  logout(): void {
    this._isLoggedIn.set(false);
  }
}
