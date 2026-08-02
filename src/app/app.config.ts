// app.config.ts raccoglie tutti i "provider" globali dell'applicazione:
// è il posto dove, in Vue, useresti app.use(router) / app.use(pinia) ecc.
// Qui non esiste una classe AppModule: i provider si passano direttamente
// a bootstrapApplication() tramite questo oggetto ApplicationConfig.
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Zoneless: Angular non usa più zone.js per capire quando ridisegnare
    // la UI. Il change detection è guidato dai signal che leggi nei
    // template — concettualmente più vicino a come già ragioni in Vue
    // (reattività fine-grained, non un ciclo globale "controlla tutto").
    provideZonelessChangeDetection(),

    // Router e HttpClient si registrano come provider "flat", non più
    // via un modulo importato: stessa idea di app.use(router) in Vue,
    // ma passata come funzione a questo array.
    // withComponentInputBinding() fa arrivare i parametri di rotta (:id)
    // direttamente come input() nel componente — vedi TaskDetail.
    // È opt-in, non il default: senza questa riga TaskDetail non
    // riceverebbe mai "id" e servirebbe tornare al vecchio
    // inject(ActivatedRoute) + route.snapshot.paramMap.get('id').
    // Equivalente Vue Router: { path: '/tasks/:id', props: true } nella
    // config della rotta — anche lì va abilitato esplicitamente.
    //
    // withPreloading(PreloadAllModules): compromesso tra "bundle
    // iniziale piccolo" (grazie a loadComponent, vedi app.routes.ts) e
    // "navigazione istantanea" (senza preloading, il PRIMO click su una
    // rotta lazy dovrebbe comunque aspettare il download del chunk).
    // Con questa strategia, Angular scarica in background TUTTI i chunk
    // lazy subito dopo il caricamento iniziale — non li usa ancora, li
    // pre-scarica e basta, così quando l'utente clicca il chunk è già
    // in cache del browser. PreloadAllModules è la strategia built-in
    // più semplice; se ne può scrivere una custom (implementando
    // PreloadingStrategy) per essere più selettivi, es. precaricare
    // solo le rotte marcate con { data: { preload: true } }.
    provideRouter(routes, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideHttpClient(),
  ],
};
