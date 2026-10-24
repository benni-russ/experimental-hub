# Sicherheit

## Wofür der Hub gebaut ist

Der Experimental Hub ist eine einzelne App für einen Raspberry Pi im eigenen
Netz. Daraus folgt sein Sicherheitsmodell:

- **Keine Anmeldung, keine Benutzerkonten, keine Cookies.** Wer die Seite
  erreicht, kann alles lesen und ändern. Die Zugangskontrolle liegt deshalb
  vor dem Hub, nicht in ihm.
- **Der Node-Dienst lauscht nur auf `127.0.0.1`.** Von außen kommt man über
  einen Reverse-Proxy auf demselben Rechner (in der Anleitung: Caddy).
- **Nur im eigenen Netz betreiben** -- zu Hause oder über ein privates VPN wie
  Tailscale oder WireGuard. Den Hub nie per Portweiterleitung oder öffentlichem
  Hosting ins offene Internet stellen.
- **Gespeichert werden nur Lernstände:** Fortschritt, Quizversuche,
  Reflexionsantworten, Kartenstände, eigene Karten, Notizen und Einstellungen
  in einer SQLite-Datei. Keine Zugangsdaten, keine
  Zahlungsdaten, keine Daten Dritter.

Was in diesem Modell keine Lücke ist: dass jeder im eigenen Netz den Hub
bedienen kann. Was eine Lücke wäre, zum Beispiel:

- Code, der aus Eingaben ausgeführt wird (XSS, SQL-Injection)
- Wege, Dateien außerhalb des Datenordners zu lesen oder zu schreiben
- Abhängigkeiten mit bekannten Schwachstellen
- Stellen, an denen der Dienst trotz Einstellung nicht nur auf `127.0.0.1`
  lauscht

## Unterstützte Versionen

Gepflegt wird nur der aktuelle Stand von `main`.

## Eine Lücke melden

Bitte **nicht** als öffentliches Issue. Stattdessen über GitHub privat melden:
im Reiter **Security** auf **Report a vulnerability**. Hilfreich sind eine
kurze Beschreibung, die Schritte zum Nachstellen und die betroffene Datei oder
Route.

Der Hub ist ein privates Lernprojekt ohne festen Bereitschaftsdienst. Eine
erste Rückmeldung gibt es in der Regel innerhalb von zwei Wochen.

## Was im Repo dagegen hilft

- Ein Commit-Hook (`.githooks/`, einschalten mit `npm run hooks:einrichten`)
  hält Datenbanken, `.env`-Dateien, IP-Adressen, E-Mail-Adressen und
  Zugangsschlüssel aus dem Repo. Die CI prüft dasselbe bei jedem Push.
- Dependabot meldet Abhängigkeiten mit bekannten Schwachstellen und schlägt
  einmal im Monat Updates vor.
- Secret Scanning mit Push-Schutz ist für das Repo eingeschaltet.
