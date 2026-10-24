#!/bin/bash
#
# Zweiter Halbschritt eines Deployments, laeuft auf dem Server.
#
# Spielt den Stand ein, den tools/auf-den-pi.mjs vorher ins Heimverzeichnis
# uebertragen hat:
#
#   ~/experimental-hub.tar.gz  ->  /opt/experimental-hub/  + Dienst neu starten
#
# Setzt voraus, dass tools/server-einrichten.sh schon einmal gelaufen ist
# (legt /opt/experimental-hub/.env und die systemd-Einheit an). Ohne das bricht
# dieses Skript weiter unten kontrolliert ab.
#
# Aufruf:  sudo bash ~/einspielen-experimental-hub.sh
#
# Andere Verzeichnisse, Dienstname oder Port lassen sich davorsetzen:
#   sudo VERZ=/opt/experimental-hub DIENST=experimental-hub PORT=4300 bash ~/einspielen-experimental-hub.sh
#
set -euo pipefail

# sudo laesst den urspruenglichen Benutzer in SUDO_USER stehen. Dateien sollen
# ihm gehoeren, nicht root -- sonst kann das naechste scp sie nicht ersetzen.
BENUTZER=${BENUTZER:-${SUDO_USER:-$(id -un)}}
HEIM=${HEIM:-$(getent passwd "$BENUTZER" | cut -d: -f6)}

VERZ=${VERZ:-/opt/experimental-hub}
DIENST=${DIENST:-experimental-hub}
PORT=${PORT:-4300}
# Adresse, unter der der Reverse Proxy horcht -- nur fuer die Proben am Ende.
PROXY=${PROXY:-http://127.0.0.1:8080}
BASIS=${BASIS:-/hub}

PAKET="$HEIM/experimental-hub.tar.gz"

[ "$(id -u)" = "0" ] || { echo "Bitte mit sudo aufrufen."; exit 1; }
[ -n "$HEIM" ] || { echo "FEHLER: Heimverzeichnis von $BENUTZER nicht gefunden."; exit 1; }
[ -f "$PAKET" ] || { echo "FEHLER: $PAKET liegt nicht vor. Erst auf dem PC: node tools/auf-den-pi.mjs"; exit 1; }
[ -f "$VERZ/.env" ] || { echo "FEHLER: $VERZ/.env fehlt. Erst einmalig: sudo bash ~/server-einrichten-experimental-hub.sh"; exit 1; }

echo "== Experimental Hub =="

# Merken, welcher Stand der Abhaengigkeiten installiert ist. Danach wird
# verglichen: npm ci wirft node_modules weg und uebersetzt better-sqlite3
# neu -- auf einem Pi 3 dauert das viele Minuten. Das soll nur passieren,
# wenn sich wirklich etwas geaendert hat.
alt=$(md5sum "$VERZ/package-lock.json" 2>/dev/null | cut -d' ' -f1 || true)

systemctl stop "$DIENST" 2>/dev/null || true

# Die drei dist-Verzeichnisse vollstaendig ersetzen statt darueber entpacken,
# sonst bleiben Dateien frueherer Staende liegen. Alles andere unter $VERZ
# bleibt unangetastet -- vor allem .env und node_modules. Und /srv/daten wird
# von diesem Skript ueberhaupt nicht angefasst: Dort liegen Datenbank und
# hochgeladene Dateien, weit weg vom Programmverzeichnis.
rm -rf "$VERZ/server/dist" "$VERZ/web/dist" "$VERZ/shared/dist"
mkdir -p "$VERZ"
tar xzf "$PAKET" -C "$VERZ"

chown -R "$BENUTZER:$BENUTZER" \
  "$VERZ/server/dist" "$VERZ/web/dist" "$VERZ/shared/dist" \
  "$VERZ/package.json" "$VERZ/package-lock.json" \
  "$VERZ/server/package.json" "$VERZ/shared/package.json"

echo "  $(find "$VERZ/web/dist" "$VERZ/server/dist" -type f | wc -l) Dateien eingespielt"

neu=$(md5sum "$VERZ/package-lock.json" | cut -d' ' -f1)
if [ "$alt" != "$neu" ] || [ ! -d "$VERZ/node_modules" ]; then
  echo "  Abhaengigkeiten haben sich geaendert -- npm ci (dauert)"
  sudo -u "$BENUTZER" HOME="$HEIM" npm ci --omit=dev --prefix "$VERZ" 2>&1 | tail -2
else
  echo "  Abhaengigkeiten unveraendert"
fi

systemctl start "$DIENST"
sleep 4

fehler=0

echo
echo "== Proben =="
printf "  %-34s %s\n" "Dienst $DIENST" "$(systemctl is-active "$DIENST" || true)"

# Direkt am Dienst vorbei an Caddy: Antwortet er hier nicht, liegt es an der
# App. Antwortet er hier, aber nicht ueber den Proxy weiter unten, liegt es an
# der Caddyfile -- der Blick, der die meisten Raetsel loest.
printf "  %-34s HTTP %s\n" "direkt 127.0.0.1:$PORT/api/health" \
  "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PORT/api/health")"

for pfad in "$BASIS/" "$BASIS/api/health"; do
  printf "  %-34s HTTP %s\n" "$pfad" \
    "$(curl -s -o /dev/null -w '%{http_code}' "$PROXY$pfad")"
done

# Nicht, was in der .env steht, sondern was der laufende Prozess wirklich
# geoeffnet hat. lsof ist auf einem schlanken Debian meist nicht installiert;
# /proc/<pid>/fd braucht kein Zusatzpaket und zeigt dasselbe.
pid=$(systemctl show "$DIENST" -p MainPID --value)
offene_db=$(ls -l "/proc/$pid/fd" 2>/dev/null | grep -oE '/[^ ]*\.db' | sort -u | tr '\n' ' ')
echo "  offene Datenbank:                ${offene_db:-nicht ermittelbar (Dienst laeuft nicht?)}"

# Diese Pruefung ist der eigentliche Sinn der Probe. RequiresMountsFor in der
# systemd-Einheit schuetzt nur davor, dass der Dienst ganz ohne Datenstick
# startet -- nicht davor, dass DB_PATH in der .env versehentlich auf einen
# Pfad unterhalb von /opt zeigt. In dem Fall schreibt die App klaglos auf die
# SD-Karte, und eine Sicherung von /srv/daten erfasst nur eine leere oder
# veraltete Datei --
# ohne dass irgendwo eine Fehlermeldung erscheint. Deshalb hier ein
# Skriptfehler, kein blosser Hinweis.
if [[ "$offene_db" == *"/opt/"* ]]; then
  echo
  echo "FEHLER: Die geoeffnete Datenbank liegt unter /opt, nicht unter /srv/daten."
  echo "        Die App schreibt auf die SD-Karte -- die naechtliche Sicherung sichert"
  echo "        eine leere oder veraltete Datei, ohne dass das auffaellt."
  echo "        Pruefen: DB_PATH in $VERZ/.env, und ob der Datenstick eingehaengt ist:"
  echo "          mountpoint /srv/daten"
  fehler=1
fi

if [ "$fehler" -ne 0 ]; then
  echo
  echo "Abgeschlossen, aber mit Fehler -- siehe oben."
  exit 1
fi

echo
echo "Fertig."
