// Die Migrationen sind .sql und werden von tsc nicht mitgenommen -- ohne diesen
// Schritt startet der Server auf dem Pi mit leerer Datenbank und der Meldung,
// dass es keine Tabellen gibt.
import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const from = join(root, 'src', 'db', 'migrations');
const to = join(root, 'dist', 'db', 'migrations');

mkdirSync(to, { recursive: true });
cpSync(from, to, { recursive: true });
console.log('Migrationen nach dist kopiert.');
