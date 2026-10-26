# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Hauptnutzer ist der Autor selbst: am PC arbeitet er Projekte durch, Lernrunden
macht er auch am Handy. Gelegentlich zeigt er einzelne Projekte anderen, etwa
Kolleginnen und Kollegen am Bildschirm. Diese sehen ein Projekt zum ersten Mal
und haben kein Vorwissen.

## Product Purpose

Der Lern-Hub macht Konzepte aus Experimentation, Web & APIs, Personalisierung
und Digital Experience verständlich und sorgt dafür, dass sie hängen bleiben.

Erfolg hat zwei Stufen:

1. **Verstehen:** Ein Konzept lässt sich ohne Vorwissen begreifen, über
   Alltagsfrage, Schätzfrage, interaktive Demo und „Unter der Haube“.
2. **Behalten:** Reflexionsfragen, Wissenscheck und Karteikarten in der
   Lernrunde (Leitner) sichern das Verstandene.

Content für soziale Netzwerke ist nur ein Nebenprodukt: ein Notizfeld
„Post-Idee“, kein eigener Prozess.

## Positioning

Ein persönlicher Hub, der das Bauen und das Lernen verbindet. Jedes Projekt
ist eine eigene interaktive Demo mit fester Lernstruktur und eigenen Karten.
Kein Kursanbieter, keine Inhaltssammlung. Status und Fortschritt werden aus
dem Tun abgeleitet, nicht abgehakt.

## Operating Context

- Läuft lokal und auf einem Raspberry Pi im Heimnetz unter `/hub/`. Der
  Quellcode ist öffentlich; die laufende App ist nur aus dem eigenen Netz
  erreichbar (z. B. über Tailscale), weil sie keine Anmeldung hat.
- Seiten:
  - Heute: fällige Karten, Weitermachen, Fortschritt je Track.
  - Lernpfad: Projekte je Track als Strang.
  - Projekt: Einstieg, Demo, Unter der Haube, Wissenscheck, Code-Aufgabe,
    Reflexion, Karten, Fußzeile.
  - Lernrunde: mobil zuerst, eine Karte nach der anderen.
  - Notizen: durchsuchbar, Filter für Post-Ideen.
- Notizen und Post-Idee sind auf der Projektseite immer erreichbar: am PC als
  Seitenleiste, mobil als hochziehbare Leiste.

## Capabilities and Constraints

- Oberfläche auf Deutsch, Bezeichner im Code auf Englisch.
- Ein Nutzer, keine Anmeldung, nur Nutzerdaten in SQLite; die Inhalte liegen
  im Code.
- Tracks werden über Label und Symbol unterschieden.

## Brand Commitments

- Die Farben laufen über Rollennamen (`--farbe-*`). Neue Werte ändern die
  Rollen, nicht die Namen.
- Farblogik:
  - Weinrot steht für Interaktion.
  - Gold steht für Erkenntnis: Auflösung, Vorher/Nachher, Veränderung.
  - Alles andere ist neutral.
  - Tracks bekommen keine eigene Farbe.
- Hell und dunkel sind gleichwertig, nach Systemeinstellung.

## Evidence on Hand

- Referenzmodul `A-001 MDE` (Mindestens erkennbarer Effekt) mit Demo,
  Stichprobenkurve und Annahmen: `src/projects/a-001-mde/`.
- Ein Testprojekt `000` (nur in der Entwicklung), das alle Lernbausteine zeigt.
- Weitere Projekte gibt es noch nicht. Das Backlog wird erst kuratiert.

## Product Principles

1. Zuerst die Frage, dann der Fachbegriff: Jedes Konzept beginnt im Alltag.
2. Selbst ausprobieren schlägt Lesen: Die Demo trägt die Erklärung.
3. Wiederholen ist Teil des Produkts und keine Zugabe.
4. Wenig Verwaltung: speichern automatisch, Status aus dem Tun ableiten.
5. Muss auch für jemanden ohne Kontext lesbar sein, der zum ersten Mal
   draufschaut.

## Accessibility & Inclusion

- Vollständig mit der Tastatur bedienbar, auch die Lernrunde (Leertaste, J, N).
- Live-Ansagen für Demo-Werte, Fokusführung beim Seitenwechsel.
- Information steckt nie nur in der Farbe.
