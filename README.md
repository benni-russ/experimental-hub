# Experimental Hub

Ein persönlicher Lern-Hub: Konzepte aus Experimentation, Web & APIs,
Personalisierung und Digital Experience werden Schritt für Schritt verstanden
und vertieft – mit Lernkarten, Quizfragen, Reflexion und Notizen. Ein einziger
Node-Dienst (Fastify + SQLite) liefert die React-Oberfläche und die API aus,
ohne Anmeldung und ohne Cookies. Gedacht für einen Raspberry Pi im eigenen
Netz.

## Entwickeln

```bash
npm install
npm run dev:server   # API auf 127.0.0.1:4300
npm run dev:web      # Vite-Entwicklungsserver
```

Weitere Skripte: `npm run build`, `npm run test`, `npm run lint`.

Einmalig nach dem Klonen `npm run hooks:einrichten`: Der Commit-Hook in
`.githooks/` hält Datenbanken, `.env`-Dateien, IP-Adressen, E-Mail-Adressen
und Zugangsschlüssel aus dem Repo.

## Auf einem Raspberry Pi betreiben

Gebaut wird auf dem eigenen Rechner, auf den Pi wandert nur das Ergebnis.
Voraussetzungen, Ersteinrichtung, Aktualisieren und Fehlersuche stehen in
[`docs/AUF-DEN-SERVER.md`](docs/AUF-DEN-SERVER.md). Der Hub hat keine
Anmeldung; er gehört deshalb nur ins eigene Netz, nicht ins offene Internet.

## Ordner

- `docs/` – Betrieb auf dem Pi und Ideen für weitere Versuche

## Ein neues Projekt anlegen

Jedes Projekt ist ein Ordner unter `web/src/projects/<id-slug>/`, zum Beispiel
`a-001-mde`. `000-*` sind Beispiele und erscheinen nur in der Entwicklung
(`import.meta.env.DEV`). Vorbild ist `a-001-mde`.

1. **Ordner anlegen.** `id` ist die ID des Versuchs in Kleinbuchstaben:
   Track-Buchstabe und Nummer im Track (`a-003`), bei einer Einheit mit
   Unternummer (`a-002.1`). `slug` ist ein kurzer Name. Darin liegen:
   - `content.ts` – exportiert `meta: ContentMeta` (Typ aus `@hub/shared`):
     `id` (`'A-001'`), `slug`, `title`, `track`, `kind` (`'project'`, oder
     `'unit'` mit `attachedTo` für eine Einheit zu einem Projekt),
     `question` (die eine Kernfrage), `buildsOn`/`leadsTo`, `intro`, `quiz`,
     `reflection`, `cards`, optional `codeTasks` (siehe unten).
   - `Demo.tsx` und `UnderTheHood.tsx` – optional, jeweils `export default`;
     sie werden per `lazy` geladen.
   - `Sketch.tsx` – optional, die Strichzeichnung für Karten und Kopf (siehe
     unten).
   - Rechenlogik als eigene Datei (`sampleSize.ts`, `halving.ts`) mit
     Testdatei daneben, nicht in der Komponente.
   - `code/` – nur mit Code-Aufgaben: je Aufgabe `NN.checks.ts` und eine
     `code.test.ts` (siehe „Code-Aufgaben“).
2. **Stabile IDs vergeben.** Nach dem Muster `<id>-quiz-01`, `<id>-card-01`,
   `<id>-refl-01`, innerhalb des Projekts fortlaufend. Die Schätzfrage im
   `intro` verweist über `estimateQuestionId` auf eine Quizfrage.
3. **Registrieren** in `web/src/projects/index.ts` (Code-Aufgaben zusätzlich
   in `web/src/codeTask/registry.ts`, siehe unten): `meta`, `Sketch`
   (direkt importiert, nicht lazy), `Demo` und `UnderTheHood` (per `lazy`) in
   die Liste `projects` eintragen. Die Reihenfolge dort ist die Reihenfolge
   in der App. Ohne `Sketch` zeigt die App das große Track-Zeichen; für neue
   Versuche ist eine eigene Strichzeichnung erwünscht.
4. **Rechenlogik testen.** Jede Zahl, die ein Text nennt, wird in einer
   Testdatei nachgerechnet (`content.test.ts`: Rechnung mit der Logik, dann
   Suche der Zahl im Text). Wer eine Zahl im Text ändert, ändert dort mit.
5. `npm run lint`, `npm test`, `npm run build`.

### Stabile IDs

IDs in `content.ts` (Karten, Quizfragen, Reflexionsfragen) werden nie
geändert und nie wiederverwendet. Der Lernstand hängt in der Datenbank
ausschließlich an ihnen:

- `card_state.card_id` – Box und Fälligkeit jeder Karte
- `quiz_attempts.question_id` – bisherige Quizversuche
- `reflection_answers.question_id` – Reflexionsantworten; ein Projekt gilt
  als erledigt, wenn alle seine `reflection`-IDs beantwortet sind

Eine geänderte ID ist für die App eine neue Frage: Der alte Stand bleibt
verwaist liegen, die neue Karte beginnt in Box 1, die Antwort fehlt. Eine
entfernte Karte löscht außerdem beim nächsten Öffnen des Projekts ihren
Kartenstand (eigene Karten `own-…` bleiben). Texte dürfen sich ändern, IDs
nicht.

### Code-Aufgaben

Ein Projekt (keine Einheit) kann Aufgaben zum Selbstschreiben enthalten. Sie
erscheinen im Abschnitt „Code-Aufgabe“: ein Editor (CodeMirror) mit Vorlage,
„Prüfen“, Tipps und Musterlösung auf Wunsch. Der Code ist reines JavaScript und
läuft in einem Web Worker, nie auf dem Server; ein Lauf wird nach 2000 ms
abgebrochen, ein neuer Lauf beendet den laufenden. Die Infrastruktur liegt in
`web/src/codeTask/`.

1. **Aufgabe beschreiben** in `content.ts` unter `codeTasks` (Typ
   `CodeTaskMeta` aus `@hub/shared`): `id` nach dem Muster `<id>-code-NN`
   (`B-004-code-01`), `title`, `prompt` (Absätze durch Leerzeile, Code in
   Backticks), `starter` (Startcode), `hints` (vom leichtesten zum deutlichsten
   Tipp) und `solution` (die Musterlösung). Der Code endet mit `return { … };`;
   genau diese Namen holt die Prüfung ab.
2. **Prüfmodul schreiben** in `code/NN.checks.ts`: `export default` ein
   `CheckModule` (Typ in `codeTask/types.ts`) mit `exportsNeeded` (die
   zurückgegebenen Namen), optional `globals()` (zusätzliche Variablen für den
   Nutzercode) und `checks`, einer Liste von `{ name, run(ctx) }`. Eine
   Prüfung wirft bei einem Fehler; die Hilfen in `codeTask/assert.ts`
   (`expectEqual`, `CheckFailure`, `formatValue`) liefern verständliche
   Meldungen. `ctx.rerun(globals)` führt den Code erneut mit ersetzten Globals
   aus.
3. **In der Registry eintragen:** `web/src/codeTask/registry.ts`, eine Zeile je
   Aufgabe: `'B-004-code-01': () => import('../projects/b-004-…/code/01.checks')`.
   Die Module werden erst im Worker nachgeladen.
4. **Testen** in `code/code.test.ts` je Projekt: die Musterlösung besteht alle
   Prüfungen, die Vorlage scheitert an mindestens einer, und typische Fehler
   (die Musterlösung mit genau einer Änderung) werden von der passenden
   Prüfung erkannt. `codeTask/registry.test.ts` achtet darauf, dass jede
   Aufgabe ein Prüfmodul hat und umgekehrt.

Der Stand je Aufgabe liegt nur im Browser:
`localStorage['hub-code:<aufgaben-id>']` = `{ code, passed }`. Jeder Zugriff
steht in try/catch, fehlt der Speicher, arbeitet der Editor trotzdem. Ein
einmal bestandenes `passed` bleibt, auch wenn der Code später wieder geändert
wird; „Zurücksetzen“ löscht es.
Es gibt keine Anfragen ins Internet und keinen Server-Code.

### Strichzeichnung (`Sketch.tsx`)

Eine kleine SVG-Zeichnung, `export default function Sketch()`:

- `viewBox="0 0 200 110"`, `fill="none"`, `strokeWidth={1.5}`,
  `strokeLinecap="round"`, `aria-hidden="true"`
- Linien in `currentColor`; die Veränderung oder Erkenntnis in
  `var(--farbe-sekundaer-tief)`

Gestaltungsregeln stehen in `web/DESIGN.md`.

## Vorgemerkt

- **Einstellungen:** ein eigener Bereich mit Zahnrad-Icon unten in der
  Seitenleiste, über der Statuskarte. Was hineinkommt, ist noch offen;
  deshalb gibt es in der App bisher keinen Platzhalter dafür.

## Lizenz

[MIT](LICENSE)
