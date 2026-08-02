// Componente radice, standalone: nessun NgModule, nessun decoratore
// "declarations". Gli "imports" nel decoratore @Component sostituiscono
// gli "imports" di un NgModule, ma scoped al singolo componente —
// concettualmente identico agli import di componenti in un <script setup>
// Vue (import Foo from './Foo.vue', poi lo usi nel template).
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { sharedStyles } from './design-system/shared.styles';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    sharedStyles,
    `
      .app-header {
        border-bottom: 1px solid var(--ds-color-border);
        background: var(--ds-color-surface);
      }
      .app-header__inner {
        margin-inline: auto;
        max-width: var(--ds-container-2xl);
        padding: 1rem;
      }
      .app-title {
        margin: 0;
        font-size: var(--ds-text-2xl);
        line-height: var(--ds-text-2xl-lh);
        font-weight: var(--ds-font-bold);
        letter-spacing: var(--ds-tracking-tight);
        color: var(--ds-color-text-strong);
      }
      .app-nav {
        margin: 0.5rem 0 0;
        display: flex;
        gap: 1rem;
        font-size: var(--ds-text-sm);
        font-weight: var(--ds-font-medium);
      }
      .nav-link {
        color: var(--ds-color-text-subtle);
        text-decoration: none;
        transition: color 0.15s;
      }
      .nav-link:hover {
        color: var(--ds-color-text-strong);
      }
      /* Basta che .is-active sia dichiarata DOPO .nav-link (lo è: due
         classi sullo stesso elemento, ma qui l'ordine nel foglio lo
         controlliamo noi, non un compilatore di utility) — niente più
         il workaround #rla/[class.x] reciprocamente esclusivo che
         serviva con Tailwind (vedi manuale, §8b, bug 3: lì l'ordine nel
         CSS generato non era sotto il nostro controllo). */
      .nav-link.is-active {
        color: var(--ds-color-accent);
      }
      .app-main {
        margin-inline: auto;
        max-width: var(--ds-container-2xl);
        padding: 2rem 1rem;
      }
    `,
  ],
})
export class App {
  // Stringa semplice, NON un signal: non ogni campo deve esserlo. Il
  // signal serve solo per stato che cambia nel tempo e a cui qualcosa
  // deve reagire — questo titolo è fisso dalla creazione del componente
  // in poi, quindi un campo normale basta.
  protected readonly title = 'Task Board';
}
