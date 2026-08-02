# Task Board — Angular v22 in pratica, per uno sviluppatore Vue

Progetto dimostrativo, commentato riga per riga, costruito per ripassare Angular
moderno (v22, 2026) partendo da basi solide di Vue (reattività, composables,
Pinia). Non è un tutorial statico: ogni funzionalità è stata scritta, eseguita
e verificata dal vivo — inclusi alcuni bug reali trovati e corretti lungo il
percorso (dettagli in [`docs/`](#documentazione-approfondita)).

## Concetti Angular moderni dimostrati

- Componenti standalone (nessun `NgModule`)
- Signals (`signal`, `computed`, `effect`, `input()`, `model()`)
- Change detection zoneless
- Nuovo control flow nei template (`@if`, `@for`, `@empty`, `@else`)
- `httpResource()` per il data fetching dichiarativo
- Signal Forms (`form()`, `[formField]`, validatori `required`/`minLength`)
- Router in profondità: lazy loading (`loadComponent`), preloading
  (`withPreloading`), guard funzionali sia in ingresso (`CanActivateFn`)
  sia in uscita (`CanDeactivateFn`, unsaved-changes su `/new`)
- Dependency injection gerarchica per evitare il prop drilling
  (`TaskStore`, vedi `src/app/core/task-store.ts`)
- View Encapsulation (`Emulated` di default qui, `ShadowDom` reale sul
  branch `shadow-dom-encapsulation` — vedi sezione dedicata sotto)
- RxJS applicato (`debounceTime`, `switchMap`, `catchError`...) con il
  ponte `toObservable()`/`toSignal()`, sulla rotta `/search`
- Test con **Vitest** (non Karma/Jasmine): componenti, servizi, guard
  funzionali, chiamate HTTP mockate, query DOM/Shadow DOM

## Requisiti

- Node.js 22.22.3+ / 24.15.0+ (richiesto da Angular 22 — vedi `package.json`)
- Una connessione internet per `npm install` e per la chiamata a
  JSONPlaceholder fatta da `TaskList` al primo caricamento

## Come avviarlo

```bash
npm install
npm start        # ng serve — apri http://localhost:4200
```

## Come lanciare i test Vitest

```bash
npm test              # modalità watch (interattiva)
npm run test:ci       # singola esecuzione, utile in CI
```

## Struttura del progetto

```
src/app/
  app.ts / app.html          Componente radice + navigazione
  app.config.ts               Provider globali (router, http, zoneless)
  app.routes.ts                Definizione delle rotte, incluso il guard

  core/
    task.model.ts              Tipi TypeScript condivisi
    task-store.ts               Stato condiviso via DI (il "Pinia" di Angular)
    auth.service.ts             Stato di login (finto) per il guard
    auth-guard.ts                Guard funzionale che protegge /new (CanActivateFn)
    can-deactivate.guard.ts      Guard funzionale in uscita da /new (CanDeactivateFn)

  features/
    task-list/                  Lista task: httpResource() + TaskStore
    task-item/                  Riga di lista: input() + DI diretta (niente prop drilling)
    task-detail/                 Dettaglio task: input di rotta via withComponentInputBinding
    task-form/                   Form di creazione: Signal Forms
    login/                       Pagina di login finta, per attivare il guard
    task-search/                 Demo RxJS isolata: debounceTime/switchMap/catchError su /search

docs/                          Manuali di approfondimento (vedi sotto)
```

## Come provarlo end-to-end

1. Apri l'app: vedrai la lista popolata dai primi 5 "todo" presi da
   JSONPlaceholder (solo per avere dati veri al primo giro).
2. Clicca su "Nuovo task": verrai reindirizzato a "/login" dal guard
   funzionale, perché non sei ancora loggato.
3. Clicca "Login", poi crea un nuovo task dal form (prova a lasciare il
   titolo vuoto o troppo corto per vedere la validazione di Signal
   Forms in azione).
4. Torna alla lista: il nuovo task è in cima, il contatore
   "Completati: X / Y" si è aggiornato da solo (è un `computed()`).
5. Clicca su un task per aprirne il dettaglio, prova a completarlo o
   eliminarlo da lì — noterai che lo stato resta coerente ovunque,
   perché tutti i componenti condividono lo stesso `TaskStore` via DI.
6. Vai su "Cerca (RxJS)": digita velocemente "a" e poi subito "ab" — la
   query più corta è volutamente più lenta di quella più lunga, per
   dimostrare che `switchMap` scarta le risposte tardive invece di
   lasciarle sovrascrivere il risultato corrente. Prova anche a digitare
   `error` per vedere la gestione (recuperabile) di un fallimento.
7. Vai su "Nuovo task", scrivi un titolo ma **non inviare il form**, poi
   prova a cliccare un link per uscire dalla pagina: il guard
   `CanDeactivateFn` intercetta la navigazione e chiede conferma prima di
   perdere il titolo non salvato (annulla e riprova per vedere che
   l'invio regolare del form, invece, non chiede nulla).

## Il branch `shadow-dom-encapsulation`

Questo repo ha due versioni dello stesso progetto, sullo stesso branching
model che useresti per sperimentare un cambio architetturale senza
toccare la versione "stabile":

- **`main`** (questo branch) — styling con **Tailwind CSS**,
  `ViewEncapsulation.Emulated` (il default di Angular, isolamento via
  attributi CSS generati, senza vero Shadow DOM).
- **`shadow-dom-encapsulation`** — stessa identica applicazione e
  logica, ma con **`ViewEncapsulation.ShadowDom` reale** su ogni
  componente (Shadow DOM nativo del browser, annidato: `app-root` →
  `app-task-list` → `app-task-item`, ognuno col proprio confine) e uno
  **styling completamente riscritto** senza Tailwind.

### Cosa dimostra

Il punto non è "Tailwind vs niente Tailwind" — è la differenza tra i due
modi in cui Angular isola il CSS di un componente, e le conseguenze
architetturali reali di quella scelta:

- Con `Emulated`, gli stili globali (come il foglio generato da
  Tailwind) **entrano comunque** nei componenti — l'incapsulamento
  riguarda solo l'uscita, non l'ingresso.
- Con `ShadowDom` **vero**, nessun foglio di stile esterno raggiunge il
  componente: solo le **CSS custom property** attraversano quel confine
  (per via delle normali regole di ereditarietà CSS), le classi no.
  Questo branch nasce apposta per dimostrarlo: prima un tentativo di
  attivare `ShadowDom` tenendo Tailwind ha rotto visivamente tutto
  (documentato in `docs/manuale-ripasso-angular.pdf`); la soluzione è
  stata costruire un piccolo **design system autonomo**
  (`src/app/design-system/shared.styles.ts` + design token come CSS
  custom property in `src/styles.css`) pensato apposta per funzionare
  sotto Shadow DOM reale — solo allora `ShadowDom` ha potuto essere
  attivato senza rompere nulla.

### Come usarlo

```bash
git checkout shadow-dom-encapsulation
npm install       # dipendenze diverse: niente Tailwind su questo branch
npm start
npm run test:ci
```

Per vedere gli Shadow DOM reali, apri i DevTools del browser sull'app in
esecuzione e ispeziona un elemento come `<app-task-list>`: vedrai un vero
`#shadow-root (open)` nell'albero, non solo attributi generati.

## Documentazione approfondita

La cartella [`docs/`](docs/) contiene due manuali di ripasso completi,
generati durante la costruzione di questo progetto:

- **`manuale-ripasso-angular.pdf`** — tutti i concetti Angular elencati
  sopra, spiegati in dettaglio con confronti diretti con Vue, inclusi i
  due esperimenti su View Encapsulation/Shadow DOM (quello fallito e
  quello riuscito, con le verifiche dal vivo) e l'installazione di
  Tailwind.
- **`manuale-rxjs.pdf`** — approfondimento su RxJS: modello mentale,
  ogni operatore usato in `task-search.ts` spiegato con demo dal vivo
  (incluso un race condition riprodotto a comando e una trappola su
  `catchError`), cheat sheet finale.
- **`manuale-router.pdf`** — approfondimento sul Router: lazy loading
  (`loadComponent` e verifica dei chunk generati dalla build), preloading
  strategies, l'intera famiglia di guard (`CanActivate`, `CanDeactivate`,
  `CanActivateChild`, `CanMatch`) con demo dal vivo del guard in uscita
  su `/new`, resolver e rotte annidate spiegati anche nei casi in cui
  *non* hanno un uso reale in questo progetto, cheat sheet finale.

## Cheat-sheet rapida

| Cosa cercare nel codice | Concetto Angular | Equivalente Vue |
|---|---|---|
| `task-store.ts` | Injectable + signal | Store Pinia |
| `task-item.ts` | `input()` + `inject()` | prop + `inject()`/store diretto |
| `task-list.ts` | `httpResource()` | composable custom / TanStack Query |
| `task-form.ts` | Signal Forms | `v-model` + VeeValidate |
| `auth-guard.ts` | `CanActivateFn` | `beforeEnter` in Vue Router |
| `can-deactivate.guard.ts` | `CanDeactivateFn` | `onBeforeRouteLeave`/`beforeRouteLeave` |
| `task-search.ts` | RxJS + `toObservable()`/`toSignal()` | composable con debounce manuale |
| `*.html` con `@if`/`@for` | nuovo control flow | `v-if`/`v-for` |
