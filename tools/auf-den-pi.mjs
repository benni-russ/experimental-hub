/**
 * Erster Halbschritt eines Deployments: baut die App und legt sie als Archiv
 * auf dem Server ab. Der zweite Halbschritt laeuft dort:
 *
 *   sudo bash ~/einspielen-experimental-hub.sh
 *
 * Ausfuehrlich beschrieben in docs/AUF-DEN-SERVER.md
 *
 * In Node geschrieben und nicht als Shell-Skript, damit derselbe Befehl in
 * PowerShell, in der Eingabeaufforderung und auf einem Mac funktioniert. Node
 * ist ohnehin Voraussetzung; tar und scp bringt Windows seit Version 10 mit.
 *
 * Konfiguration -- entweder in tools/ziel.env (liegt nicht im Repo, Vorlage
 * ist tools/ziel.env.beispiel) oder als Umgebungsvariable:
 *
 *   ZIEL   Wohin uebertragen wird, im Format benutzer@rechner
 *   BASIS  Unter welchem Pfad die App auf dem Server liegt
 *   LINKS  Optional: weitere Links fuer die Seitenleiste (Format in der Vorlage)
 *
 * Aufruf:
 *   node tools/auf-den-pi.mjs
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(wurzel);

const PAKET = 'experimental-hub.tar.gz';
// Unter diesem Namen landet tools/einspielen.sh im Heimverzeichnis des
// Servers. Der Projektname gehoert hinein: Liegen dort auch Skripte anderer
// Apps, wuerde ein blosses "einspielen.sh" eines davon ueberschreiben --
// lautlos, mit dem Ergebnis, dass man das falsche Projekt einspielt.
const SERVERSKRIPT = 'einspielen-experimental-hub.sh';
// Gleiches Prinzip fuer die einmalige Ersteinrichtung.
const EINRICHTSKRIPT = 'server-einrichten-experimental-hub.sh';

/**
 * Fuehrt einen Befehl aus und gibt nur die letzten Zeilen seiner Ausgabe
 * wieder. Geht etwas schief, kommt alles auf den Tisch -- bei einem
 * fehlgeschlagenen Test ist die gekuerzte Fassung wertlos.
 */
function lauf(befehl, argumente, { zeilen = 4, still = false, shell = false } = {}) {
  const ergebnis = shell
    ? spawnSync(befehl, { encoding: 'utf8', shell: true })
    : spawnSync(befehl, argumente, { encoding: 'utf8' });

  if (ergebnis.error) {
    console.error(`\nFEHLER: "${befehl}" liess sich nicht starten.`);
    console.error(ergebnis.error.message);
    process.exit(1);
  }

  const ausgabe = `${ergebnis.stdout ?? ''}${ergebnis.stderr ?? ''}`.trimEnd();

  if (ergebnis.status !== 0) {
    console.error(ausgabe);
    console.error(`\nAbgebrochen: "${befehl}" endete mit ${ergebnis.status}.`);
    process.exit(ergebnis.status ?? 1);
  }

  if (!still && ausgabe) {
    console.log(
      ausgabe
        .split(/\r?\n/)
        .slice(-zeilen)
        .map((z) => `  ${z}`)
        .join('\n'),
    );
  }
  return ausgabe;
}

/**
 * npm ist unter Windows eine .cmd-Datei; die laesst sich nur ueber die
 * Kommandozeilenverarbeitung starten. Deshalb hier als eine Zeile statt als
 * Befehl mit Argumentliste -- so bleibt es bei einer Zeichenkette, die die
 * Kommandozeile selbst zerlegt, und Node warnt nicht vor unmaskierten
 * Argumenten.
 */
function npm(zeile, optionen = {}) {
  return lauf(`npm ${zeile}`, [], { ...optionen, shell: true });
}

/**
 * Gibt einen Pfad auf dieselbe Datei mit Unix-Zeilenenden zurueck. Unter
 * Windows schreiben Editoren gern CRLF; auf dem Server liest die Shell das \r
 * dann als Teil des letzten Wortes jeder Zeile und bricht schon in der ersten
 * ab -- "set: pipefail\r: invalid option name". Die .gitattributes haelt die
 * Skripte bereits auf LF, aber der Fehler faellt erst auf dem Server auf und
 * ist dort schwer zu deuten. Deshalb hier die zweite Sicherung.
 */
function mitUnixZeilenenden(pfad) {
  const inhalt = readFileSync(pfad, 'utf8');
  if (!inhalt.includes('\r')) return pfad;

  console.log(`  Hinweis: ${pfad} hat Windows-Zeilenenden, uebertragen wird eine bereinigte Kopie.`);
  const kopie = join(mkdtempSync(join(tmpdir(), 'auf-den-pi-')), basename(pfad));
  writeFileSync(kopie, inhalt.replace(/\r\n/g, '\n'));
  return kopie;
}

/** Liest eine Datei im Format KEY=WERT. Anfuehrungszeichen sind erlaubt. */
function liesEinstellungen(pfad) {
  const werte = {};
  if (!existsSync(pfad)) return werte;
  for (const zeile of readFileSync(pfad, 'utf8').split(/\r?\n/)) {
    const treffer = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/i.exec(zeile);
    if (!treffer) continue;
    werte[treffer[1]] = treffer[2].trim().replace(/^["']|["']$/g, '');
  }
  return werte;
}

// Bereits gesetzte Umgebungsvariablen haben Vorrang -- so laesst sich einmalig
// auf einen anderen Server ausliefern, ohne die Datei zu aendern.
const datei = liesEinstellungen(join('tools', 'ziel.env'));
const ZIEL = process.env.ZIEL ?? datei.ZIEL;
const BASIS = process.env.BASIS ?? datei.BASIS ?? '/hub/';
const LINKS = process.env.LINKS ?? datei.LINKS ?? '';

if (!ZIEL) {
  console.error(`Es fehlt das Ziel, an das uebertragen werden soll.

Entweder einmalig anlegen -- tools/ziel.env.beispiel kopieren nach
tools/ziel.env und darin ZIEL auf den eigenen Server setzen.

Oder fuer diesen einen Aufruf:

  ZIEL=benutzer@rechner node tools/auf-den-pi.mjs`);
  process.exit(1);
}

// Ein Stand, der nur auf dem Server existiert, laesst sich spaeter nicht mehr
// nachvollziehen. Kein Abbruch -- es gibt gute Gruende, einen Zwischenstand
// auszuprobieren --, aber es soll auffallen.
const offen = spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8' });
if (offen.status === 0 && offen.stdout.trim()) {
  console.log('Hinweis: Es liegen nicht eingecheckte Aenderungen vor.');
  console.log('         Nach dem Ausprobieren committen, sonst fehlt dieser Stand im Verlauf.\n');
}

// Die Vitest-Tests brauchen keinen Browser und keine Aussenwelt -- sie laufen
// hier mit, bevor irgendetwas den Rechner verlaesst.
console.log('== Tests ==');
npm('run test');

console.log(`== Bauen (Basispfad ${BASIS}) ==`);
// Ohne BASE_PATH zeigen alle Verweise auf Skripte, Symbole und Schriften ins
// Leere, sobald die App nicht im Wurzelverzeichnis des Servers liegt. Vite
// liest den Wert in web/vite.config.ts als "base". Der Server selbst braucht
// die Variable nicht -- der Pfad ist damit schon in web/dist eingebacken.
process.env.BASE_PATH = BASIS;
// Weitere Links der Seitenleiste; Vite reicht nur VITE_-Variablen an die App weiter.
process.env.VITE_LINKS = LINKS;
npm('run build');

// Was ins Paket wandert und was nicht:
//
//   dist der drei Arbeitsbereiche   das eigentliche Programm
//   package.json + package-lock     woran das Einspielskript erkennt, ob sich
//                                   die Abhaengigkeiten geaendert haben
//   shared/ und server/package.json npm ci braucht sie, sonst kennt es die
//                                   Arbeitsbereiche nicht
//
// Nicht dabei: node_modules (better-sqlite3 ist ein natives Modul und wird auf
// dem Zielgeraet uebersetzt), web/package.json (auf dem Server wird nichts
// mehr gebaut, seine Abhaengigkeiten waeren dort nur Ballast), die .env und
// alles unter server/data -- das gehoert dem Server, nicht dem Paket.
rmSync(PAKET, { force: true });
lauf(
  'tar',
  [
    'czf', PAKET,
    'package.json', 'package-lock.json',
    'shared/package.json', 'shared/dist',
    'server/package.json', 'server/dist',
    'web/dist',
  ],
  { still: true },
);

console.log(`== Uebertragen nach ${ZIEL} ==`);
console.log(`  ${PAKET}  ${Math.round(statSync(PAKET).size / 1024)} KB`);

lauf('scp', [PAKET, `${ZIEL}:~/`], { still: true });

// Das Gegenstueck wandert jedes Mal mit. So liegt auf dem Server nie eine
// aeltere Fassung als die, die zu diesem Paket gehoert. Eigener Aufruf, weil
// es dabei umbenannt wird -- ein scp kann nur ein Ziel.
lauf('scp', [mitUnixZeilenenden('tools/einspielen.sh'), `${ZIEL}:${SERVERSKRIPT}`], { still: true });
// Das Einrichtungsskript wandert ebenfalls mit; nur beim allerersten Mal wird
// es gebraucht, aber so liegt es immer in der passenden Fassung bereit.
lauf(
  'scp',
  [mitUnixZeilenenden('tools/server-einrichten.sh'), `${ZIEL}:${EINRICHTSKRIPT}`],
  { still: true },
);

console.log(`
Weiter auf dem Server. Beim allerersten Mal zuerst einrichten (siehe
docs/AUF-DEN-SERVER.md):
  ssh ${ZIEL}
  sudo bash ~/${EINRICHTSKRIPT}
Danach jedes Mal:
  sudo bash ~/${SERVERSKRIPT}`);
