// ---------------------------------------------------------------------
// Demo pratica di RxJS: debounceTime + distinctUntilChanged + switchMap.
// ---------------------------------------------------------------------
// Componente isolato apposta (non tocca TaskStore): l'obiettivo è vedere
// il pattern RxJS puro, senza mischiarlo con lo stato reale dell'app.
//
// Il ponte Signal <-> Observable: il campo di ricerca è un signal
// (`query`), come tutto il resto di questo progetto — ma debounceTime e
// switchMap sono operatori RxJS, funzionano solo su Observable. Si
// collegano con toObservable()/toSignal() (vedi manuale, §5): il flusso
// è signal -> toObservable() -> .pipe(operatori RxJS) -> toSignal() ->
// di nuovo signal, letto dal template. Questa è la ricetta standard 2026
// per "stato locale in signal, orchestrazione asincrona in RxJS".
import { Component, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  switchMap,
  delay,
  tap,
  throwError,
  catchError,
} from 'rxjs';

// "Database remoto" finto: un array fisso, così la demo è deterministica
// e non dipende da una vera rete (a differenza di TaskList, che invece
// usa httpResource() su un'API vera — qui l'obiettivo è isolare RxJS).
const FAKE_REMOTE_TASKS = [
  'Comprare il latte',
  'Comprare il pane',
  'Chiamare il commercialista',
  'Chiamare Marco per il progetto',
  'Prenotare il dentista',
  'Prenotare il volo per Roma',
  'Rispondere alle email',
  'Rinnovare il dominio',
  'Ripassare Angular',
  'Ripassare RxJS',
  'Aggiornare il curriculum',
  'Aggiornare il portfolio',
  'Abbonamento palestra',
];

interface SearchResult {
  query: string;
  matches: string[];
  error?: string;
}

@Component({
  selector: 'app-task-search',
  templateUrl: './task-search.html',
})
export class TaskSearch {
  // Stato "grezzo": cosa l'utente ha digitato in questo momento. Aggiornato
  // direttamente dall'evento (input) nel template, nessun Signal Forms qui
  // — per una casella di ricerca senza validazione basta un signal semplice.
  protected readonly query = signal('');

  protected readonly isSearching = signal(false);

  protected readonly results = toSignal(
    toObservable(this.query).pipe(
      // Aspetta che l'utente smetta di digitare per 300ms prima di
      // procedere — altrimenti partirebbe una "ricerca" a ogni singolo
      // tasto premuto.
      debounceTime(300),
      // map: stesso identico concetto di Array.prototype.map (vedi
      // FAKE_REMOTE_TASKS.filter più sotto per il confronto), ma su
      // valori che arrivano nel tempo. Qui trasforma ogni query
      // "ripulendola" prima di proseguire.
      map((q) => q.trim()),
      // filter: lascia passare solo le query vuote (per svuotare i
      // risultati) o di almeno 2 caratteri — una query di un solo
      // carattere è troppo generica, non ha senso interrogare il
      // "server" per quella. Le query da un carattere vengono scartate
      // QUI, prima ancora di arrivare a distinctUntilChanged/switchMap:
      // isSearching non si accende nemmeno, nessuna richiesta parte.
      filter((q) => q.length === 0 || q.length >= 2),
      // Se il valore (dopo il debounce) è identico al precedente, non
      // rifare la ricerca — es. digiti "abc", cancelli a "ab", riscrivi
      // "abc": stesso valore finale, nessuna richiesta duplicata.
      distinctUntilChanged(),
      tap(() => this.isSearching.set(true)),
      // IL PUNTO CENTRALE DELLA DEMO: switchMap annulla la ricerca
      // precedente non appena ne parte una nuova. Senza, con una query
      // "a" (lenta) seguita subito da "ab" (veloce), la risposta lenta di
      // "a" potrebbe arrivare DOPO quella di "ab" e sovrascrivere sullo
      // schermo un risultato più vecchio con una query che l'utente ha
      // già cambiato — un bug subdolo e difficile da riprodurre a mano,
      // perché dipende dalla velocità della rete in quel momento.
      switchMap((q) =>
        this.fakeSearch(q).pipe(
          // catchError QUI, dentro il projector di switchMap — non fuori
          // nella pipe principale. Posizionato così, l'errore resta
          // locale a QUESTO singolo tentativo di ricerca: lo stream
          // esterno (toObservable(query)) non viene mai toccato, resta
          // vivo, continua a reagire a query future. Se invece
          // catchError stesse fuori da switchMap (dopo, nella pipe
          // principale), catturerebbe sì l'errore una volta, ma poi
          // l'intero stream esterno completerebbe comunque — niente più
          // ricerche per nessuna query futura, un bug più subdolo perché
          // sembra "quasi" risolto.
          catchError((err: unknown) => {
            const message = err instanceof Error ? err.message : 'Errore sconosciuto';
            return of<SearchResult>({ query: q, matches: [], error: message });
          }),
        ),
      ),
      tap(() => this.isSearching.set(false)),
    ),
    { initialValue: { query: '', matches: [] } as SearchResult },
  );

  private fakeSearch(query: string) {
    if (!query.trim()) {
      return of<SearchResult>({ query, matches: [] });
    }
    // Query magica per simulare un "server" che risponde con un errore
    // (es. 500, timeout, rete assente) — serve solo per la demo di
    // catchError qui sotto, mai fare query "magiche" così in un
    // servizio vero.
    if (query === 'error') {
      return throwError(() => new Error('Il server finto è caduto apposta'));
    }
    const matches = FAKE_REMOTE_TASKS.filter((t) =>
      t.toLowerCase().includes(query.toLowerCase()),
    );
    // Ritardo artificiale e VARIABILE in base alla lunghezza della query:
    // più corta = molto più lenta (query larghe = "il server finto" deve
    // scandagliare più risultati). Serve a rendere il race condition
    // riproducibile a comando invece che affidato al caso della rete
    // reale — utile per la demo, MAI da fare in un servizio vero.
    const artificialDelayMs = Math.max(250, 3000 - query.length * 1200);
    return of<SearchResult>({ query, matches }).pipe(delay(artificialDelayMs));
  }
}
