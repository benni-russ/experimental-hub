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
     `reflection`, `cards`.
   - `Demo.tsx` und `UnderTheHood.tsx` – optional, jeweils `export default`;
     sie werden per `lazy` geladen.
   - `Sketch.tsx` – optional, die Strichzeichnung für Karten und Kopf (siehe
     unten).
   - Rechenlogik als eigene Datei (`sampleSize.ts`, `halving.ts`) mit
     Testdatei daneben, nicht in der Komponente.
2. **Stabile IDs vergeben.** Nach dem Muster `<id>-quiz-01`, `<id>-card-01`,
   `<id>-refl-01`, innerhalb des Projekts fortlaufend. Die Schätzfrage im
   `intro` verweist über `estimateQuestionId` auf eine Quizfrage.
3. **Registrieren** in `web/src/projects/index.ts`: `meta`, `Sketch`
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
