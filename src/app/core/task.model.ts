// Un semplice tipo TypeScript: nessuna magia di Angular qui, solo la
// forma dei dati che useremo in tutta l'app (come faresti in un file
// types.ts in un progetto Vue+TS).
export interface Task {
  id: number;
  title: string;
  completed: boolean;
}

// Forma "grezza" dei dati che arrivano da JSONPlaceholder (usato solo per
// popolare la lista iniziale via httpResource — vedi task-list.ts).
export interface RemoteTodo {
  id: number;
  title: string;
  completed: boolean;
}
