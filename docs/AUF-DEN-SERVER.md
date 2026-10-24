# Auf den Server bringen

Wie der Lern-Hub vom Entwicklungsrechner auf einen Raspberry Pi kommt und
dort dauerhaft läuft. Getestet auf einem Pi 3B. Voraussetzungen auf dem Pi:

- Raspberry Pi OS (64 Bit) mit Node.js 22 oder neuer
- Caddy als Reverse Proxy mit einem Block für `:8080`
- ein eingehängter Datenträger unter `/srv/daten` (USB-Stick oder SSD), damit
  die Datenbank nicht auf der SD-Karte liegt
- Zugriff nur aus dem eigenen Netz, zum Beispiel über Tailscale – der Hub hat
  keine eigene Anmeldung

Eckdaten dieser App:

| | |
|---|---|
| Pfadpräfix | `/hub/` |
| Port | 4300, nur auf `127.0.0.1` |
| Programm | `/opt/experimental-hub` |
| Daten | `/srv/daten/experimental-hub/hub.db` |
| Dienst | `experimental-hub` |
| Anmeldung | keine eigene – die Zugangskontrolle liegt beim Netz (z. B. Tailscale) |

Konkrete Namen (Rechner, Benutzer) stehen nicht im Repo, sondern nur in der
nicht eingecheckten `tools/ziel.env`.

## Die Idee in einem Bild

```
   eigener PC                                          Server
   ──────────                                          ──────

   Quelltext
      │  npm test && npm run build (BASE_PATH=/hub/)
      ▼
   shared/dist/  ── verpacken ──►  experimental-hub.tar.gz
   server/dist/                          │ scp
   web/dist/                             ▼
                                  ~/experimental-hub.tar.gz
                                         │ auspacken
                                         ▼
                                  /opt/experimental-hub/
```

**Gebaut wird auf dem PC. Auf den Server wandert nur das Ergebnis.** Ein Pi 3
hat keinen Arbeitsspeicher für einen Vite-Bau übrig, und der Server hat keinen
Zugriff auf GitHub. Einzige Ausnahme: `better-sqlite3` ist ein natives Modul
und muss für die Architektur des Servers (aarch64) übersetzt werden – deshalb
wandert `node_modules` nicht mit, und `npm ci` läuft auf dem Server selbst.

## Erstinstallation

### 1. Das Ziel eintragen

```bash
cp tools/ziel.env.beispiel tools/ziel.env
```

In PowerShell:

```powershell
Copy-Item tools/ziel.env.beispiel tools/ziel.env
```

Darin `ZIEL` auf den eigenen Server setzen (`benutzer@rechner`). `BASIS`
bleibt `/hub/` – mit abschließendem Schrägstrich, es ist der URL-Pfad und kein
Verzeichnis auf dem Server. Optional nennt `LINKS` weitere Einträge für die
Seitenleiste, etwa andere Apps auf demselben Server; das Format steht in der
Vorlage. `tools/ziel.env` ist gitignoriert, weil sie den Namen des Servers
nennt.

### 2. Bauen und übertragen

```bash
node tools/auf-den-pi.mjs
```

Führt `npm test` und `npm run build` mit `BASE_PATH=/hub/` aus, packt
`experimental-hub.tar.gz` und überträgt es zusammen mit zwei Skripten ins
Heimverzeichnis des Servers:

- `~/einspielen-experimental-hub.sh` (aus `tools/einspielen.sh`)
- `~/server-einrichten-experimental-hub.sh` (aus `tools/server-einrichten.sh`)

Beide werden umbenannt: Liegen im Heimverzeichnis auch Skripte anderer Apps,
überschriebe ein bloßes `einspielen.sh` lautlos eines davon.

### 3. Server einrichten (einmalig, mit `sudo`)

```bash
ssh benutzer@rechner
```

```bash
sudo bash ~/server-einrichten-experimental-hub.sh
```

`sudo` verlangt hier ein Passwort und geht deshalb nicht über eine
nicht-interaktive Verbindung – das macht man selbst im Terminal. Das Skript
ist wiederholbar und legt an:

- `/opt/experimental-hub` – Programm
- `/srv/daten/experimental-hub` – Daten
- `/opt/experimental-hub/.env` mit `PORT=4300`, `HOST=127.0.0.1`,
  `DB_PATH=/srv/daten/experimental-hub/hub.db` und `BASE_PATH=/hub/` (nur zur
  Information, der Server liest es nicht). Eine vorhandene `.env` bleibt
  unangetastet. Ein `SESSION_SECRET` gibt es nicht, der Hub hat keine
  Anmeldung.
- `experimental-hub.service` – mit `RequiresMountsFor=/srv/daten`, damit der
  Dienst ohne eingehängten Datenstick gar nicht erst startet. Noch nicht
  gestartet, das Programm selbst kommt erst im nächsten Schritt.

Das Skript warnt und fragt nach, falls `/srv/daten` nicht eingehängt ist –
sonst legte es die Datenordner still auf der SD-Karte an.

### 4. Caddy-Block eintragen

Das Skript gibt den Block am Ende aus (oder meldet, dass er schon steht),
ändert die Caddyfile aber **nicht**. Von Hand in `/etc/caddy/Caddyfile`
einfügen, **innerhalb** des bestehenden `:8080`-Blocks:

```caddyfile
	redir /hub /hub/

	handle_path /hub/* {
		reverse_proxy 127.0.0.1:4300
	}
```

Die Datei gehört `root`, geöffnet wird sie deshalb mit `sudo` in `nano`:

```bash
sudo nano /etc/caddy/Caddyfile
```

- Die `redir`-Zeile zu den übrigen `redir`-Zeilen oben im Block.
- Den `handle_path`-Block hinter die anderen `handle`-/`handle_path`-Blöcke,
  aber **vor** einen Auffangblock `handle { … }` am Ende, falls es einen
  gibt – dahinter käme er nie zum Zug.
- In nano bewegt man sich mit den Pfeiltasten, nicht mit der Maus. Einfügen
  im Terminal: `Strg+Shift+V` oder Rechtsklick. Tab oder Leerzeichen zum
  Einrücken ist Caddy gleich.
- Speichern mit `Strg+O`, dann `Enter`; beenden mit `Strg+X`.

Die `redir`-Zeile gehört dazu: Ohne sie landet ein Aufruf ohne abschließenden
Schrägstrich im Auffangblock, was wie ein Fehler aussieht. `handle_path` schneidet das Präfix `/hub` ab – der Server sieht
`/api/health`, nicht `/hub/api/health`. Das ist hier gewollt: Der Server kennt
seinen Unterpfad nicht, nur `web/dist` kennt ihn über `BASE_PATH`.

Dann prüfen und neu laden:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy
```

Meldet `validate` einen Fehler, wird nichts neu geladen, und Caddy läuft mit
der alten Konfiguration weiter. Datei erneut öffnen, korrigieren,
noch einmal prüfen.

### 5. Einspielen

```bash
sudo bash ~/einspielen-experimental-hub.sh
```

Was das Skript tut, steht unter „Aktualisieren“. Beim ersten Mal dauert
`npm ci` auf dem Pi 3 einige Minuten, weil `better-sqlite3` übersetzt wird.

### 6. Sicherung

Alles, was der Hub speichert, steckt in einer Datei:
`/srv/daten/experimental-hub/hub.db` (SQLite im WAL-Modus). Für eine Sicherung
im laufenden Betrieb nicht die Datei kopieren, sondern SQLite selbst sichern
lassen, zum Beispiel nachts per Cron:

```bash
sqlite3 /srv/daten/experimental-hub/hub.db ".backup '/pfad/zur/sicherung/hub.db'"
```

Dazu `/opt/experimental-hub/.env`, falls dort etwas von Hand geändert wurde.

## Aktualisieren

Am PC:

```bash
node tools/auf-den-pi.mjs
```

Auf dem Server:

```bash
sudo bash ~/einspielen-experimental-hub.sh
```

Das Einspielskript ersetzt die drei `dist`-Verzeichnisse unter
`/opt/experimental-hub` vollständig, lässt `.env`, `node_modules` und
`/srv/daten` unangetastet, startet den Dienst neu und prüft danach selbst:

- den Dienststatus,
- die Antwort direkt am Port (`127.0.0.1:4300/api/health`) – unterscheidet
  einen Anwendungsfehler von einem Caddy-Fehler,
- `/hub/` und `/hub/api/health` über den Reverse Proxy,
- **welche Datenbankdatei der laufende Prozess tatsächlich geöffnet hat.**
  Steht dort ein Pfad unterhalb von `/opt` statt `/srv/daten/…`, meldet das
  Skript einen Fehler: Die App schriebe sonst auf die SD-Karte, und die
  nächtliche Sicherung sicherte eine leere oder veraltete Datei.

`npm ci` läuft nur, wenn sich die `package-lock.json` geändert hat (MD5-
Vergleich) oder `node_modules` fehlt. Migrationen brauchen keinen eigenen
Schritt – der Server wendet sie beim Start selbst an.

### Was im Paket ist – und was nicht

| Im Paket | Warum |
|---|---|
| `shared/dist`, `server/dist`, `web/dist` | das eigentliche Programm |
| `package.json`, `package-lock.json` | daran erkennt das Einspielskript, ob sich Abhängigkeiten geändert haben |
| `shared/package.json`, `server/package.json` | ohne sie kennt `npm ci` die Arbeitsbereiche nicht |

Nicht dabei und auf dem Server unangetastet: `.env`, `node_modules/` (dort
übersetztes `better-sqlite3`) und die Datenbank unter
`/srv/daten/experimental-hub`.

## Prüfen (lesend)

```bash
curl -s http://127.0.0.1:8080/hub/api/health
```

Erwartet: `{"status":"ok"}`. Und was der Prozess wirklich geöffnet hat:

```bash
ls -l /proc/$(systemctl show experimental-hub -p MainPID --value)/fd
```

Dort muss `/srv/daten/experimental-hub/hub.db` stehen, nicht ein Pfad unter
`/opt`.

## Fehlersuche

Zuerst:

```bash
systemctl status experimental-hub --no-pager
```

```bash
journalctl -u experimental-hub -n 50 --no-pager
```

```bash
curl -sI http://127.0.0.1:8080/hub/
```

Antwortet der Dienst direkt auf Port 4300, aber nicht über Caddy, liegt es an
der Caddyfile. Antwortet er auch direkt nicht, liegt es an der App.

| Im Protokoll oder Symptom | Ursache | Reparatur |
|---|---|---|
| Fehler in einer Datei unter `node_modules/…` (`SyntaxError`, `Invalid package config`) | Datei auf der SD-Karte verfälscht | `node_modules` löschen, neu einspielen (siehe unten); danach `dmesg` auf Kartenfehler prüfen |
| `NODE_MODULE_VERSION` oder `better_sqlite3.node` | Node aktualisiert, übersetztes Modul passt nicht mehr | wie oben: `node_modules` löschen, neu einspielen |
| Fehler in `dist/…` | eigener Code | am PC beheben, `node tools/auf-den-pi.mjs`, einspielen |
| `Dependency failed`, kein Startversuch | Datenstick nicht eingehängt | `findmnt /srv/daten`, notfalls `sudo mount -a`, Dienst starten |
| Nichts im Dienstprotokoll, aber `journalctl -k \| grep -i oom` trifft | Arbeitsspeicher voll, OOM-Killer | `free -m`, Dienst starten, beobachten |
| Weiße Seite, 404 auf `.js`-Dateien | `BASE_PATH`-Kette unterbrochen, meist `BASIS` in `tools/ziel.env` ohne `/hub/` | `BASIS=/hub/` setzen, neu bauen und einspielen |
| Aufruf von `/hub` landet im Auffangblock | `redir`-Zeile fehlt in der Caddyfile | Block wie oben ergänzen, `caddy validate`, `reload` |
| `/hub/api/health` liefert 404, direkt am Port nicht | `handle_path` oder Präfix in der Caddyfile falsch | Block mit der Vorlage oben vergleichen |
| `set: : invalid option name` beim Einspielen | Windows-Zeilenenden im Skript | `sed -i 's/\r$//' ~/einspielen-experimental-hub.sh`; `.gitattributes` hält die Skripte sonst auf LF |
| Einspielskript meldet die Datenbank unter `/opt` | `DB_PATH` in der `.env` falsch oder Stick nicht eingehängt | `DB_PATH` prüfen, `mountpoint /srv/daten`, Dienst neu starten |

`node_modules` neu erzeugen:

```bash
sudo systemctl stop experimental-hub && sudo rm -rf /opt/experimental-hub/node_modules
```

Dann am PC `node tools/auf-den-pi.mjs` – ein frisches Paket, nicht das im
Heimverzeichnis liegende, denn das liegt auf derselben Karte – und auf dem
Server `sudo bash ~/einspielen-experimental-hub.sh`. Das Löschen ist nötig,
weil `npm ci` sonst nur bei geänderter `package-lock.json` läuft.

Das Einspielskript ist die Reparatur für fast alles, was unter `/opt`
kaputtgeht: Es ersetzt das Programmverzeichnis vollständig, lässt `.env` und
`/srv/daten` in Ruhe und ist beliebig oft wiederholbar.
