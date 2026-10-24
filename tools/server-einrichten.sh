#!/bin/bash
#
# Einmalige Ersteinrichtung des Experimental Hub auf dem Server: legt
# Verzeichnisse, die .env und die systemd-Einheit an. Danach uebernimmt
# tools/einspielen.sh.
#
# Wiederholbar: Ein zweiter Aufruf legt nichts doppelt an und ueberschreibt
# keine vorhandene .env.
#
# Fasst die Caddyfile NICHT an. Der Caddy-Block wird am Ende nur ausgegeben
# beziehungsweise geprueft, ob er schon darin steht; eintragen, validieren und
# neu laden macht der Benutzer selbst (Befehle stehen am Ende der Ausgabe).
#
# Aufruf:  sudo bash ~/server-einrichten-experimental-hub.sh
#
# Andere Verzeichnisse, Dienstname oder Port lassen sich davorsetzen:
#   sudo VERZ=/opt/experimental-hub DATEN=/srv/daten/experimental-hub \
#        DIENST=experimental-hub PORT=4300 BASIS=/hub/ \
#        bash ~/server-einrichten-experimental-hub.sh
#
set -euo pipefail

BENUTZER=${BENUTZER:-${SUDO_USER:-$(id -un)}}
VERZ=${VERZ:-/opt/experimental-hub}
DATEN=${DATEN:-/srv/daten/experimental-hub}
DIENST=${DIENST:-experimental-hub}
PORT=${PORT:-4300}
BASIS=${BASIS:-/hub/}
CADDYFILE=${CADDYFILE:-/etc/caddy/Caddyfile}

[ "$(id -u)" = "0" ] || { echo "Bitte mit sudo aufrufen."; exit 1; }

echo "== Experimental Hub einrichten =="
echo "  Programm:  $VERZ"
echo "  Daten:     $DATEN"
echo "  Dienst:    $DIENST (Port $PORT)"
echo

# RequiresMountsFor in der systemd-Einheit schuetzt spaeter davor, dass der
# Dienst ganz ohne Stick startet -- es schuetzt nicht davor, dass DIESES
# Skript $DATEN jetzt einfach auf der SD-Karte anlegt, weil der Stick gerade
# nicht eingehaengt ist. Genau diese Falle faengt die Abfrage hier ab.
if ! mountpoint -q /srv/daten; then
  echo "WARNUNG: /srv/daten ist nicht eingehaengt (kein Mountpoint)."
  echo "         $DATEN wuerde jetzt auf der SD-Karte angelegt -- spaeter auf den"
  echo "         Stick umziehen ist Handarbeit, kein Skriptaufruf."
  echo
  read -r -p "Trotzdem fortfahren? Dazu JA eingeben: " antwort
  [ "$antwort" = "JA" ] || { echo "Abgebrochen, nichts veraendert."; exit 1; }
fi

echo "== Verzeichnisse =="
mkdir -p "$VERZ" "$DATEN"
chown -R "$BENUTZER:$BENUTZER" "$VERZ" "$DATEN"
echo "  $VERZ angelegt"
echo "  $DATEN angelegt"

echo "== .env =="
if [ -f "$VERZ/.env" ]; then
  echo "  $VERZ/.env besteht bereits -- bleibt unveraendert."
  echo "  (Zum Aendern von Hand bearbeiten, nicht ueber dieses Skript.)"
else
  # Kein SESSION_SECRET: Der Hub hat keine Anmeldung, die Zugangskontrolle
  # liegt beim Netz (z. B. Tailscale).
  cat > "$VERZ/.env" <<ENDE
PORT=$PORT
HOST=127.0.0.1

# Absoluter Pfad auf dem Datenstick. Ein relativer Pfad wuerde unter /opt auf
# der SD-Karte landen, und die Sicherung griffe ins Leere.
DB_PATH=$DATEN/hub.db

# Nur zur Information beim Nachsehen -- der Server selbst liest diese
# Variable nicht. Der Pfad ist schon beim Bauen in web/dist eingebacken
# (vite.config.ts liest BASE_PATH als "base" zur Bauzeit, siehe
# tools/auf-den-pi.mjs). Passt dieser Wert nicht mehr zum Caddy-Block, ist das
# ein Hinweis darauf, aber keine Ursache.
BASE_PATH=$BASIS
ENDE
  chown "$BENUTZER:$BENUTZER" "$VERZ/.env"
  chmod 600 "$VERZ/.env"
  echo "  $VERZ/.env angelegt."
fi

echo "== systemd-Dienst =="
cat > "/etc/systemd/system/$DIENST.service" <<ENDE
[Unit]
Description=Experimental Hub
After=network.target
# Ohne eingehaengten Datenstick startet der Dienst gar nicht erst.
RequiresMountsFor=/srv/daten

[Service]
Type=simple
User=$BENUTZER
WorkingDirectory=$VERZ
EnvironmentFile=$VERZ/.env
ExecStart=/usr/bin/node $VERZ/server/dist/index.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
ENDE

systemctl daemon-reload
systemctl enable "$DIENST" >/dev/null
echo "  /etc/systemd/system/$DIENST.service geschrieben"
echo "  Dienst aktiviert (startet beim naechsten Hochfahren von selbst)"

# Der Block gehoert IN den bestehenden :8080-Block der Caddyfile, nicht als
# eigener Serverblock. handle_path schneidet das Praefix /hub ab; der Server
# kennt seinen Unterpfad nicht, nur web/dist kennt ihn ueber BASE_PATH.
BASIS_OHNE=${BASIS%/}
echo
echo "== Caddy (wird NICHT automatisch geaendert) =="
if [ -r "$CADDYFILE" ] && grep -q "handle_path $BASIS_OHNE/\*" "$CADDYFILE"; then
  echo "  In $CADDYFILE steht bereits ein Block fuer $BASIS_OHNE/ -- nichts zu tun."
else
  echo "  In $CADDYFILE fehlt der Block fuer $BASIS_OHNE/. Diese Zeilen in den"
  echo "  bestehenden :8080-Block einfuegen (mit Tabulator eingerueckt):"
  echo
  echo "	redir $BASIS_OHNE $BASIS"
  echo
  echo "	handle_path $BASIS_OHNE/* {"
  echo "		reverse_proxy 127.0.0.1:$PORT"
  echo "	}"
  echo
  echo "  Danach pruefen und neu laden:"
  echo "    sudo caddy validate --config $CADDYFILE && sudo systemctl reload caddy"
fi

echo
echo "== Fertig =="
echo "Noch nicht gestartet -- server/dist/index.js gibt es erst nach dem ersten Einspielen:"
echo "  1. Auf dem PC:  node tools/auf-den-pi.mjs"
echo "  2. Hier:        sudo bash ~/einspielen-experimental-hub.sh"
echo "  3. Caddy-Block (siehe oben) -- siehe docs/AUF-DEN-SERVER.md"
