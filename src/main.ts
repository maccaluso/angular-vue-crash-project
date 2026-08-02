// Punto di ingresso dell'app: l'equivalente del main.ts/main.js che chiama
// createApp(App).mount('#app') in Vue. Qui "bootstrapApplication" avvia
// direttamente il componente standalone App, senza bisogno di un AppModule.
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
