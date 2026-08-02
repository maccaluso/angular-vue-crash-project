// ---------------------------------------------------------------------
// CanDeactivate: l'opposto di CanActivate — non decide se puoi ENTRARE
// in una rotta, ma se puoi USCIRNE. Caso d'uso classico: un form con
// modifiche non salvate, per evitare che l'utente perda dati per un
// click su un link di navigazione.
// ---------------------------------------------------------------------
// Come CanActivateFn (vedi auth-guard.ts), è una funzione, non una
// classe — stessa filosofia "guard funzionale" del 2026. La differenza:
// CanDeactivateFn riceve come primo argomento l'ISTANZA del componente
// che si sta per abbandonare, così può interrogarlo direttamente
// invece di dover reggere lo stato altrove (es. in un service).
import { CanDeactivateFn } from '@angular/router';
import { TaskForm } from '../features/task-form/task-form';

export const canDeactivateTaskForm: CanDeactivateFn<TaskForm> = (component) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }
  // window.confirm() è volutamente il modo più semplice/riconoscibile
  // per dimostrare il pattern — un'app reale userebbe più probabilmente
  // un proprio modal (coerente con lo stile grafico), ma la logica del
  // guard sarebbe identica: true = via libera, false = blocca la
  // navigazione e l'utente resta sulla rotta corrente.
  return window.confirm(
    'Hai scritto un titolo che non hai ancora salvato. Vuoi davvero uscire senza creare il task?',
  );
};
