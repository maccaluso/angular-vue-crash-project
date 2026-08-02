// ---------------------------------------------------------------------
// Signal Forms: i form dichiarati come signal, non più come
// FormGroup/FormControl (i "Reactive Forms" classici) né come
// template-driven form con ngModel.
// ---------------------------------------------------------------------
// Il modello del form è un signal() qualsiasi. form() lo avvolge e,
// tramite una funzione "schema", dichiari le regole di validazione.
// Il template si lega ai campi con la direttiva [formField], che si
// occupa da sola di leggere/scrivere il valore e tracciare touched/dirty.
//
// Il parallelo con Vue: è concettualmente vicino a v-model + una
// libreria di validazione come VeeValidate, ma integrato nativamente
// nel framework invece che essere una libreria a parte.
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
// required/minLength sono validatori built-in — Angular ne offre un set
// pronto all'uso (required, minLength, maxLength, min, max, pattern,
// email) senza bisogno di librerie esterne tipo VeeValidate per i casi
// comuni. Non è una novità di Signal Forms in sé: i validatori base
// c'erano già nei Reactive Forms classici — quello che cambia qui è lo
// stile dichiarativo a schema/signal. Per regole custom (cross-field,
// asincrone, business-specific) scrivi tu la funzione di validazione,
// ma l'infrastruttura attorno (touched/dirty, quando rivalidare, come
// esporre gli errori) resta a carico del framework, non tua.
import { form, FormField, required, minLength } from '@angular/forms/signals';
import { TaskStore } from '../../core/task-store';

interface NewTaskModel {
  title: string;
}

@Component({
  selector: 'app-task-form',
  imports: [FormField],
  templateUrl: './task-form.html',
})
export class TaskForm {
  private readonly store = inject(TaskStore);
  private readonly router = inject(Router);

  // Il modello vero e proprio: un signal semplice, niente di speciale.
  protected readonly model = signal<NewTaskModel>({ title: '' });

  // form() collega il modello alle regole di validazione dichiarate nello
  // "schema" (la funzione qui sotto). schemaPath rispecchia la forma di
  // NewTaskModel: schemaPath.title corrisponde a model().title — ma
  // schemaPath NON contiene i valori, è solo un "percorso" usato per
  // attaccare le regole al campo giusto.
  //
  // Collegamento con la domanda sulla reattività deep dei signal: i
  // signal di base non hanno reattività annidata (vedi task-store.ts).
  // Signal Forms la ottiene comunque, ma non con un Proxy magico: genera
  // esplicitamente UN SIGNAL INDIPENDENTE PER OGNI CAMPO, in un albero
  // che rispecchia la forma del modello. taskForm() (form intero) e
  // taskForm.title() (singolo campo) sono due signal distinti con stato
  // separato (invalid/touched/errors) — è una struttura costruita
  // apposta per aggirare il limite, non reattività deep "gratuita".
  protected readonly taskForm = form(this.model, (schemaPath) => {
    required(schemaPath.title, { message: 'Il titolo è obbligatorio.' });
    minLength(schemaPath.title, 3, {
      message: 'Il titolo deve avere almeno 3 caratteri.',
    });
  });

  onSubmit(event: Event): void {
    event.preventDefault();

    // taskForm() è anch'esso un signal: invocarlo dà lo stato corrente
    // del form (valid/invalid, i singoli campi, ecc.).
    if (this.taskForm().invalid()) {
      return;
    }

    this.store.add(this.model().title);
    this.router.navigateByUrl('/');
  }
}
