// Componente radice, standalone: nessun NgModule, nessun decoratore
// "declarations". Gli "imports" nel decoratore @Component sostituiscono
// gli "imports" di un NgModule, ma scoped al singolo componente —
// concettualmente identico agli import di componenti in un <script setup>
// Vue (import Foo from './Foo.vue', poi lo usi nel template).
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  // Il colore dimostrativo per la View Encapsulation (vedi manuale, §8a)
  // è stato rimosso a favore delle utility Tailwind nel template — il
  // principio di incapsulamento resta identico, si applica anche alle
  // classi Tailwind eventualmente scritte dentro un futuro styles/
  // styleUrl di questo componente (non a quelle nel template, che sono
  // globali per costruzione).
})
export class App {
  // Stringa semplice, NON un signal: non ogni campo deve esserlo. Il
  // signal serve solo per stato che cambia nel tempo e a cui qualcosa
  // deve reagire — questo titolo è fisso dalla creazione del componente
  // in poi, quindi un campo normale basta.
  protected readonly title = 'Task Board';
}
