# Backlog

Das alte Content-Backlog (30 Projekte, 18 Plan-B-Themen) für den Lern-Hub
ausdünnen. Was danach übrig bleibt, wird
einmal vollständig umgesetzt.

Stand: 26.10.2026 · Status: **kuratiert** – alle Vorschläge übernommen,
Track A fertig

Vorgaben aus der Abstimmung:

- etwa 15–18 Projekte, Mini-Einheiten nicht mitgezählt
- AI & Automation als eigener kleiner Track
- Coding-Themen bleiben als Track B, jeweils mit Mini-Brief vorab
- Projekt-IDs aus dem alten Backlog bleiben, Lücken sind gewollt (seit
  26.10.2026 abgelöst durch die Zählung je Track, siehe Entscheidung)
- Plan-B-Themen werden zu Mini-Einheiten an einem Projekt oder entfallen

## Entscheidung

Die Vorschläge unter 1. sind am 24.10.2026 vollständig abgehakt worden. Sie
bleiben als Begründung stehen und nennen deshalb noch die alten IDs;
verbindlich ist der Backlog unter 2.

Seit dem 26.10.2026 zählt der Backlog **je Track in Lernreihenfolge**:
`A-001`, `A-002`, … `B-001` und so weiter, Mini-Einheiten hängen am Projekt
(`A-002.1`). So zeigt die Nummer, wo eine Lektion im Thema steht. Die App
nutzt dieselben IDs: „Versuch A-003“, die Adresse `/projekt/A-003` und die
gespeicherten Lernstände. Alte Links wie `/projekt/013` leiten weiter, und die
Migration `002_track_ids.sql` hat die Lernstände umgeschrieben. Die alte ID
steht nur noch als Spalte „Alte ID“ in den Tabellen, damit Abschnitt 1 lesbar
bleibt.

Neue Themen bekommen die nächste Nummer in ihrem Track.

---

## 1. Vorschläge

### Zusammenlegen

Das zweite Projekt geht im ersten auf und behält keine eigene Seite.

- [x] **016 Power Playground → 001 MDE.** 001 rechnet Power und
  Stichprobengröße bereits durch (`sampleSize.ts`); ein eigenes Projekt
  wiederholte es.
- [x] **021 API Error Playground → 011 HTTP Request Visualizer.** Statuscodes
  sind die Hälfte einer HTTP-Antwort; getrennt fehlt beiden die andere Hälfte.
- [x] **015 GA4 Event Debugger → 012 GA4 Event Builder.** Ein Event bauen und
  ein fehlerhaftes erkennen ist dieselbe Struktur von zwei Seiten.
- [x] **018 Personalization Decision Tree → 005 Rule Builder.** Der
  Entscheidungsbaum ist die Darstellung der Regeln, kein neues Konzept.
- [x] **020 Recommendation Scoring → 008 Recommendation Demo.** 008 ohne
  Scoring bliebe oberflächlich; zusammen ergibt es ein Projekt mit Kern.
- [x] **025 Conversion vs. Revenue → 007 Conversion Funnel Simulator.** Der
  KPI-Zielkonflikt ist der interessanteste Teil des Funnels.
- [x] **029 AI Evaluation → 027 Prompt → Structured JSON.** Strukturierte
  Ausgabe und ihre Prüfung gehören zusammen; allein wäre 029 zu dünn.

### Zur Mini-Einheit machen

Kein eigenes Projekt, sondern Kurzform (Einstieg, Erklärung, Reflexion,
Karten) an einem Projekt.

- [x] **002 A/B Randomness Simulator → Mini-Einheit an 006.** Zufall und
  Varianz sind der Einstieg in Konfidenzintervalle, aber kein eigener Strang.
- [x] **009 Bayesian A/B-Test → Mini-Einheit an 006.** Als Gegenbild zum
  klassischen Intervall lehrreich, als ganzes Projekt zu weit weg vom Rest.
- [x] **026 Experiment Prioritization → Mini-Einheit an 001.** PIE ist
  bekannte Praxis; eine Einordnung genügt.
- [x] **019 Affinity Profile Visualizer → Mini-Einheit an 008.** Affinitäten
  sind ein Signal für Empfehlungen und dort am verständlichsten.

### Streichen

- [x] **003 React Mini Build.** Stand auf „Hold“ und ist durch 014 ersetzt.

### Plan-B-Themen

| ✓ | Thema | Vorschlag |
|---|---|---|
| [x] | Was MDE an meiner Sicht auf A/B-Tests verändert hat | entfällt – ist die Reflexion von 001 |
| [x] | JSON kannte ich – JavaScript-Objekte eher nicht | Mini-Einheit an 010 (der alte Milestone 0) |
| [x] | Was zwischen `fetch()` und JSON eigentlich passiert | geht in 010 auf – ist dessen Kernfrage |
| [x] | Signifikant ≠ relevant | Mini-Einheit an 006 |
| [x] | 404, 401 und 500 sind nicht einfach nur „Fehler“ | geht in 011 auf (mit 021) |
| [x] | UX-Beobachtung aus „Neuro Webdesign“ als testbare Hypothese | Mini-Einheit an 007 |
| [x] | Purchase vs. Add-to-Cart: welches Event beantwortet meine Frage? | Mini-Einheit an 012 |
| [x] | Segmentierung vs. Personalisierung | Mini-Einheit an 005 |
| [x] | Ein signifikanter Test kann trotzdem kaputt sein | geht in 013 auf – ist dessen Kernfrage |
| [x] | Warum ich React nicht mit einer Todo-App lernen möchte | entfällt – reines Post-Format |
| [x] | Was React bei meinem bestehenden Tool tatsächlich verändert | geht in 014 auf – Reflexion |
| [x] | Mein erster echter Unit Test: was prüfe ich überhaupt? | geht in 024 auf – Reflexion |
| [x] | Datenqualität vor Dashboard-Interpretation | Mini-Einheit an 012 |
| [x] | Conversion Rate gestiegen – automatisch gut? | geht in 007 auf (mit 025) |
| [x] | Wann Personalisierung keinen Sinn ergibt | Mini-Einheit an 008 |
| [x] | KI als Coding-Co-Pilot: Was muss ich trotzdem selbst verstehen? | Mini-Einheit an 027 |
| [x] | Kleine Automatisierung aus einem realen Problem | entfällt – kein festes Thema, bei Bedarf neu aufnehmen |
| [x] | Aktuelle Framework-/Analytics-/AI-Neuerung einordnen | entfällt – reines Post-Format |

### Reihenfolge

- [x] **Tracks nacheinander statt im Wochenwechsel:** A → B → C → D → AI.
  A setzt 001 fort und ist bekanntes Terrain (in Blöcken baubar). B liefert
  JSON und HTTP, auf denen 030 (C) und 027 (AI) aufbauen. Die Ziel-KWs des
  alten Backlogs entfallen.
- [x] **Track C: 030 vor 008.** Wie im alten Backlog angelegt: erst prüfen, ob
  die Feed-Daten taugen, dann daraus Empfehlungen rechnen.
- [x] **Track D: 017 → 023 → 007.** Folgt dem alten Lernpfad (Accessibility →
  Core Web Vitals → UX-Hypothese → KPI-Simulator); 007 führt zurück zu
  Track A.
- [x] **Track B: 022 direkt nach 011.** Die Event Loop erklärt, was bei
  `fetch()` in 010 und 011 im Hintergrund passiert, bevor 012 es anwendet.

---

## 2. Backlog

**18 Projekte und 12 Mini-Einheiten**, davon fertig: Track A mit 4 Projekten
und 4 Mini-Einheiten. Gebaut wird Track für Track in der Reihenfolge
A → B → C → D → AI, je Track ein Durchgang mit eigener Spezifikation
(Teilprojekt 3+). Die Kernfrage ist ein Entwurf und wird beim Bau geschärft.
Verweise in „Baut auf“ und „Führt zu“ nutzen die neue Zählung.

### Track A – Experimentation & Data ◆ ✓

| Nr. | Alte ID | Projekt | Kernfrage | Baut auf | Führt zu | Mini-Einheiten |
|---|---|---|---|---|---|---|
| A-001 ✓ | 001 | MDE | Wie viele Menschen braucht ein A/B-Test, um einen kleinen Unterschied zuverlässig zu erkennen? | A/B-Praxis | A-002 | A-001.1 Priorisierung (026) ✓ |
| A-002 ✓ | 006 | Confidence Interval Visualizer | Was sagt ein Konfidenzintervall über das Ergebnis – und was nicht? | A-001 | A-003 | A-002.1 Zufall & Varianz (002) ✓, A-002.2 Bayes (009) ✓, A-002.3 Signifikant ≠ relevant (031) ✓ |
| A-003 ✓ | 013 | Sample Ratio Mismatch Checker | Woran erkenne ich, dass ein Test kaputt ist, bevor ich sein Ergebnis lese? | A-001, A-002 | A-004 | – |
| A-004 ✓ | 004 | Simpson's Paradox Visualizer | Wie kann ein Effekt in jedem Segment steigen und insgesamt fallen? | A-002 | D-003 | – |

### Track B – Web & APIs ■

Jedes Projekt bekommt vor dem Bau einen Mini-Brief (Frage, Known/New,
Demo-Idee, 3–5 Zeilen) zur Freigabe und enthält Code-Aufgaben zum
Selbstschreiben. Als Nächstes dran: **B-001**.

| Nr. | Alte ID | Projekt | Kernfrage | Baut auf | Führt zu | Mini-Einheiten |
|---|---|---|---|---|---|---|
| B-001 | 010 | JSON API Explorer | Was passiert zwischen `fetch()` und einem fertigen JavaScript-Objekt? | JS-Basis | B-002 | B-001.1 JSON vs. JS-Objekte |
| B-002 | 011 | HTTP Request Visualizer | Was steht in Request und Antwort – und was bedeuten 200, 400, 401, 404 und 500? | B-001 | B-003, B-004 | – |
| B-003 | 022 | JavaScript Event Loop Visualizer | In welcher Reihenfolge läuft asynchroner Code wirklich? | B-001, B-002 | B-004 | – |
| B-004 | 012 | GA4 Event Builder | Wie ist ein GA4-Event aufgebaut, und woran erkenne ich ein fehlerhaftes? | B-001, B-002 | B-005 | B-004.1 Purchase vs. Add-to-Cart, B-004.2 Datenqualität |
| B-005 | 014 | GA4 / React Event Builder | Was ändert sich, wenn ein bestehendes Tool in React neu gebaut wird? | B-004 | B-006 | – |
| B-006 | 024 | First Testing Playground | Was prüfe ich mit einem Unit Test an echter Projektlogik überhaupt? | B-005 | – | – |

### Track C – Personalization ●

| Nr. | Alte ID | Projekt | Kernfrage | Baut auf | Führt zu | Mini-Einheiten |
|---|---|---|---|---|---|---|
| C-001 | 005 | Personalization Rule Builder | Wie wird aus Targeting-Regeln eine Entscheidung – und welche gewinnt bei Konflikten? | Targeting-Praxis | C-002 | C-001.1 Segmentierung vs. Personalisierung |
| C-002 | 030 | Product Feed Inspector | Woran erkenne ich, dass ein Produktfeed Empfehlungen verdirbt? | C-001, B-001 | C-003 | – |
| C-003 | 008 | Recommendation Demo | Wie entsteht aus Signalen und Gewichten ein Ranking? | C-002 | – | C-003.1 Affinitätsprofil (019), C-003.2 Wann Personalisierung keinen Sinn ergibt |

### Track D – Digital Experience ▲

| Nr. | Alte ID | Projekt | Kernfrage | Baut auf | Führt zu | Mini-Einheiten |
|---|---|---|---|---|---|---|
| D-001 | 017 | Accessibility Playground | Woran scheitert eine Seite für Menschen mit Einschränkung – und wie prüfe ich das? | HTML/CSS | D-002 | – |
| D-002 | 023 | Core Web Vitals Playground | Was messen LCP, CLS und INP, und was verschlechtert sie? | HTML/CSS/JS | D-003 | – |
| D-003 | 007 | Conversion Funnel Simulator | Wie hängen Funnel-Schritte, Conversion und Umsatz zusammen – und wann widersprechen sie sich? | Analytics-Praxis | A-001 | D-003.1 UX-Beobachtung als Hypothese |

### Track AI & Automation ★

| Nr. | Alte ID | Projekt | Kernfrage | Baut auf | Führt zu | Mini-Einheiten |
|---|---|---|---|---|---|---|
| AI-001 | 027 | Prompt → Structured JSON | Wie bekomme ich verlässlich strukturierte Ausgaben von einem Modell – und wie prüfe ich sie? | B-001 | AI-002 | AI-001.1 KI als Coding-Co-Pilot |
| AI-002 | 028 | RAG einfach visualisiert | Wie findet ein RAG-System die passenden Stellen, bevor das Modell antwortet? | AI-001 | – | – |

### Zählung

| | Projekte | davon fertig | Mini-Einheiten | davon fertig |
|---|---:|---:|---:|---:|
| A Experimentation & Data | 4 | 4 | 4 | 4 |
| B Web & APIs | 6 | 0 | 3 | 0 |
| C Personalization | 3 | 0 | 3 | 0 |
| D Digital Experience | 3 | 0 | 1 | 0 |
| AI & Automation | 2 | 0 | 1 | 0 |
| **Summe** | **18** | **4** | **12** | **4** |

Gestrichen oder aufgegangen (alte IDs): 002, 003, 009, 015, 016, 018, 019, 020, 021,
025, 026, 029 (davon 002, 009, 019, 026 als Mini-Einheit erhalten).

---

## 3. Ideen für später

Am 24.10.2026 notiert und noch nicht eingeplant. Für jede Idee wird geprüft,
ob daraus ein Projekt, eine Mini-Einheit oder ein Werkzeug wird.

- **Checkliste für eigene Tests:** Welche Infos und Zahlen braucht ein Test,
  und woher bekommt man sie?
- **Simulator für einen eigenen Test:** eine Entscheidung mit den Konzepten
  aus Track A durchspielen und besser bewerten.
- **Hypothesen bilden:** Wie formuliert man sie gut? Worauf muss man auf jeden
  Fall schauen? Welche Zusammenhänge zählen? Läuft der Test auf einer oder auf
  mehreren Ebenen?
- **Einen Test aufsetzen:** am Beispiel Dynamic Yield mit clientseitiger
  Anbindung und Zahlen aus Shop und Google Analytics 4.
