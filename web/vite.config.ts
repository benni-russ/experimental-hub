import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const base = process.env.BASE_PATH || '/';

export default defineConfig({
  // Erste Stufe der BASE_PATH-Kette: Umgebungsvariable -> hier -> BASE_URL im
  // Browser -> basename des Routers. Reißt die Kette, lädt die App unter
  // /hub/ eine weiße Seite und sucht ihre Skripte unter /assets/.
  base,
  plugins: [react()],
  // Der Prüf-Worker nutzt dynamische Imports; das geht nur im ES-Format.
  worker: { format: 'es' },
  server: {
    proxy: {
      // Der Client ruft `${base}api` auf; der Server ist pfadneutral, also fällt das Präfix weg.
      [`${base}api`]: {
        target: 'http://127.0.0.1:4300',
        rewrite: (path) => path.slice(base.length - 1),
      },
    },
  },
});
