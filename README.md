# Task Board — mini progetto Angular per uno sviluppatore Vue

Progetto dimostrativo, commentato riga per riga, pensato per ripassare
Angular moderno (v22, metà 2026) partendo da basi solide di Vue. Copre
tutti gli argomenti discussi nella nostra conversazione:

- Componenti standalone (nessun `NgModule`)
- Signals (`signal`, `computed`, `effect`, `input()`, `model()`)
- Change detection zoneless
- Nuovo control flow nei template (`@if`, `@for`, `@empty`, `@else`)
- `httpResource()` per il data fetching dichiarativo
- Signal Forms (`form()`, `[formField]`, validatori `required`/`minLength`)
- Guard di routing funzionali (`CanActivateFn` + `inject()`)
- Dependency injection gerarchica per evitare il prop drilling
  (`TaskStore`, vedi `src/app/core/task-store.ts`)
- Test con **Vitest** (non Karma/Jasmine), incluso il testing di
  componenti, servizi, guard funzionali e chiamate HTTP mockate

## ⚠️ Nota importante

Questo progetto è stato scritto interamente a mano, file per file, in un
ambiente sandbox che non ha accesso al registry npm — quindi **non ho
potuto eseguire `npm install` né lanciare i test qui** per verificarli
dal vivo. Il codice è accurato al meglio delle mie conoscenze e basato
su documentazione ufficiale Angular verificata durante la
conversazione, ma ti consiglio di trattarlo come un punto di partenza
solido da far girare e correggere tu stesso in caso di piccoli errori di
battitura o di versione delle dipendenze — è probabilmente il modo
migliore per rimetterti in pratica, comunque.

## Requisiti

- Node.js 20+ (va bene anche il 22, come sul tuo Ubuntu)
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
  app.config.ts              Provider globali (router, http, zoneless)
  app.routes.ts               Definizione delle rotte, incluso il guard

  core/
    task.model.ts             Tipi TypeScript condivisi
    task-store.ts              Stato condiviso via DI (il "Pinia" di Angular)
    auth.service.ts            Stato di login (finto) per il guard
    auth-guard.ts               Guard funzionale che protegge /new

  features/
    task-list/                 Lista task: httpResource() + TaskStore
    task-item/                 Riga di lista: input() + DI diretta (niente prop drilling)
    task-detail/                Dettaglio task: input di rotta via withComponentInputBinding
    task-form/                  Form di creazione: Signal Forms
    login/                      Pagina di login finta, per attivare il guard
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

## Cheat-sheet rapida (vedi anche il percorso di ripasso che ti ho mandato prima)

| Cosa cercare nel codice | Concetto Angular | Equivalente Vue |
|---|---|---|
| `task-store.ts` | Injectable + signal | Store Pinia |
| `task-item.ts` | `input()` + `inject()` | prop + `inject()`/store diretto |
| `task-list.ts` | `httpResource()` | composable custom / TanStack Query |
| `task-form.ts` | Signal Forms | `v-model` + VeeValidate |
| `auth-guard.ts` | `CanActivateFn` | `beforeEnter` in Vue Router |
| `*.html` con `@if`/`@for` | nuovo control flow | `v-if`/`v-for` |
