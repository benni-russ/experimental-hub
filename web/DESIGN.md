---
name: Experimental Hub
description: Ruhiger Lern-Standard, in dem jedes Projekt ein nummerierter Versuch mit eigener Strichzeichnung ist.
colors:
  hintergrund: "#f5f3f1"
  flaeche: "#ffffff"
  flaeche-hoch: "#f3e7ea"
  flaeche-neutral: "#ece7e3"
  tinte: "#1b1517"
  text-gedaempft: "#625b58"
  text-sehr-gedaempft: "#857e7a"
  rahmen: "#e0d9d4"
  rahmen-stark: "#948b86"
  weinrot: "#7a1024"
  weinrot-tief: "#5e0b1b"
  weinrot-weich: "#f5e8eb"
  gold: "#bd8a30"
  gold-tief: "#8a6118"
  gold-weich: "#f6ecd9"
  fokus-gold: "#946419"
  erfolg: "#17773a"
  erfolg-weich: "#dff2e4"
  warnung: "#a3500c"
  fehler: "#b3261e"
  info: "#2457c5"
typography:
  headline:
    fontFamily: "Inter Variable, Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.9rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter Variable, Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  subtitle:
    fontFamily: "Inter Variable, Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter Variable, Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter Variable, Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.9rem"
    fontWeight: 500
    lineHeight: 1.5
  tag:
    fontFamily: "Inter Variable, Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 500
    lineHeight: 1.6
  figure:
    fontFamily: "Inter Variable, Inter, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "2.6rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
  mono:
    fontFamily: "JetBrains Mono, Cascadia Code, Consolas, monospace"
    fontSize: "1.6rem"
    fontWeight: 700
rounded:
  klein: "6px"
  mittel: "10px"
  karte: "12px"
  gross: "16px"
  rund: "999px"
spacing:
  eng: "8px"
  klein: "12px"
  mittel: "16px"
  gross: "24px"
  abschnitt: "40px"
components:
  button-primary:
    backgroundColor: "{colors.weinrot}"
    textColor: "{colors.flaeche}"
    rounded: "{rounded.klein}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.weinrot-tief}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.weinrot}"
    rounded: "{rounded.klein}"
    padding: "0 16px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.weinrot-weich}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.tinte}"
    rounded: "{rounded.klein}"
    height: "44px"
  card:
    backgroundColor: "{colors.flaeche}"
    textColor: "{colors.tinte}"
    rounded: "{rounded.karte}"
    padding: "16px"
  panel:
    backgroundColor: "{colors.flaeche}"
    rounded: "{rounded.karte}"
    padding: "24px"
  tag:
    backgroundColor: "{colors.flaeche}"
    textColor: "{colors.text-gedaempft}"
    rounded: "{rounded.rund}"
    padding: "1px 10px"
  tag-done:
    backgroundColor: "{colors.erfolg-weich}"
    textColor: "{colors.erfolg}"
  insight:
    backgroundColor: "{colors.gold-weich}"
    textColor: "{colors.gold-tief}"
    rounded: "{rounded.klein}"
    padding: "12px 16px"
  experiment-mark:
    textColor: "{colors.tinte}"
    rounded: "{rounded.rund}"
    size: "72px"
  nav-link-active:
    backgroundColor: "{colors.weinrot-weich}"
    textColor: "{colors.weinrot}"
    rounded: "{rounded.klein}"
    height: "44px"
  kbd:
    backgroundColor: "{colors.flaeche}"
    textColor: "{colors.tinte}"
    rounded: "{rounded.klein}"
    padding: "0.1em 0.5em"
  input:
    backgroundColor: "{colors.flaeche}"
    textColor: "{colors.tinte}"
    rounded: "{rounded.klein}"
    padding: "8px 12px"
    height: "44px"
---

# Design System: Experimental Hub

## Overview

**Creative North Star: "Das Versuchsheft"**

Der Hub ist ein ruhiger Lern-Standard: warmes Off-White, Kartenweiß, Tinte statt Schwarz, Haarlinien statt Schmuck. Seine Eigenart steckt in einer einzigen Idee: Jedes Projekt ist ein nummerierter Versuch mit eigener Strichzeichnung. Marke, Zeichnung und Track-Zeichen stehen in derselben Linienstärke (1,5), sodass die Oberfläche wie ein sauber geführtes Heft wirkt und nicht wie eine Kachelliste mit Fortschrittsbalken.

Hell und dunkel sind gleichwertig. Hell gilt als Grundwert, dunkel folgt dem System oder dem Schalter (`data-modus` auf `<html>`). Die Farben laufen über Rollennamen (`--farbe-*`); neue Werte ändern die Rollen, nicht die Namen.

**Key Characteristics:**
- Weinrot nur für Interaktion, Gold nur für Erkenntnis, alles andere neutral.
- Status und Track werden nie über Farbe allein getragen: immer Zeichen plus Wort bzw. Label.
- Fortschritt als Punktreihe (leer, halb, voll), nicht als Balken.
- Alle Ziele mindestens 44 px hoch.
- Icons ausschließlich Strich-SVGs, `currentColor`, runde Enden.

## Colors

Warme Neutraltöne mit einem tiefen Weinrot als Stimme der Interaktion und einem sparsamen Gold für Erkenntnis. Werte unten sind die hellen; dunkel ist in `src/design/tokens.css` als vollständiger Satz hinterlegt (Weinrot wird dort zu Rosé `#de7085`, Gold zu `#dcab52`).

### Primary
- **Weinrot** (`weinrot`): Schaltflächen, Verweise, aktiver Navigationspunkt, Auswahl, Hover-Rahmen von Pfadknoten. Hover `weinrot-tief`, weiche Fläche `weinrot-weich`.

### Secondary
- **Gold** (`gold`, `gold-weich`): Erkenntnis-Kasten (Auflösung, Vorher/Nachher, Veränderung) als Rahmen und weiche Fläche.
- **Gold tief** (`gold-tief`): Gold als Schrift oder Strich auf hellem Grund; im dunklen Modus gleich `#dcab52`.

### Neutral
- **Hintergrund** (`hintergrund`) und **Kartenweiß** (`flaeche`): Seite und Karten, Leisten, Dialoge.
- **Tinte** (`tinte`): Text, Überschriften, Marke, voll gefüllte Punkte.
- **Gedämpft** (`text-gedaempft`, `text-sehr-gedaempft`): Beschriftungen, Metazeilen, Hilfetexte.
- **Haarlinie** (`rahmen`) und **kräftige Linie** (`rahmen-stark`): Kartenrand, Trenner; kräftig für Eingabefelder, Punktränder, Pfadlinie.
- **Neutrale Fläche** (`flaeche-neutral`): Tag „begonnen“.

### Status
- **Erfolg** (`erfolg`, `erfolg-weich`), **Warnung** (`warnung`), **Fehler** (`fehler`), **Info** (`info`): nur als Begleiter von Zeichen und Wort (fertig, falsche Antwort, Fehlertext).

### Named Rules
**The Eine-Stimme Rule.** Weinrot gehört der Interaktion. Es ist nie Dekoration und nie Status.

**The Gold-Tief Rule.** Gold als Schrift oder Strich auf hellem Grund läuft immer über `--farbe-sekundaer-tief`; das helle Gold bleibt Fläche und Rahmen.

**The Kein-Track-Farbe Rule.** Tracks unterscheiden sich über Zeichen und Label, nie über Farbe.

**The Goldener-Fokus Rule.** Der Fokusring ist bewusst golden (`--farbe-fokus`, 2 px Kontur plus 3 px Halo): ein weinroter Ring verschwände auf weinroten Buttons, Gold kontrastiert in beiden Modi. Das ist die einzige Ausnahme von „Gold nur für Erkenntnis“.

## Typography

**Display Font:** Inter Variable (lokal über `@fontsource-variable/inter`, Fallback Inter, system-ui)
**Body Font:** Inter Variable
**Label/Mono Font:** JetBrains Mono (Fallback Cascadia Code, Consolas) für Messwerte und Slider-Werte

**Character:** Eine einzige, sachliche Grotesk in drei Gewichten (500, 600, 700). Hierarchie entsteht über Größe und Gewicht, enge Laufweite bei Überschriften (-0.01em bis -0.03em). Body nutzt die Stilsätze `cv11` und `ss01`.

### Hierarchy
- **Headline** (700, 1.9rem, 1.2): Seitentitel, h1.
- **Title** (600, 1.3rem, 1.2): Abschnitte; Versuchstitel auf der Karte (1.25).
- **Subtitle** (600, 1.1rem): h3; Panel-Überschriften 1.05rem.
- **Body** (400, 17px, 1.5): Fließtext, Fragen auf maximal 60ch.
- **Label** (500, 0.9rem): Metazeilen, Zähler (tabellarische Ziffern), Navigation mobil.
- **Tag** (500, 0.8rem, 1.6): Status-Pillen.
- **Figure** (700, 2.6rem, -0.03em): große Kennzahlen; Versuchsnummer in der Marke 1.25rem.
- **Mono** (700, 1.6rem): Kennzahlen (Metric).

### Named Rules
**The Zahlen-Tabular Rule.** Zähler und Nummern stehen mit `tabular-nums`.

## Layout

Rahmen aus Seitenleiste links und oberer Leiste über dem Inhalt (siehe Rahmen und Navigation). Der Inhalt ist eine Spalte mit Seitenrand 24 px (mobil 16 px), maximal 64rem. Raster 4 px; Abstandsstufen 8, 12, 16, 24, 40, 64 px, 64 px zwischen Abschnitten (siehe Luft). Heute: „Weitermachen“ und „Fortschritt je Track“ untereinander in voller Breite; die fälligen Karten stehen in der Glocke. Die Versuchskarte und der Projektkopf reagieren per Container Query: schmal fließt Text um die Marke und die Zeichnung steht darunter, ab 560 px (Karte) bzw. 480/600 px (Kopf) steht die Zeichnung rechts (200 px bzw. 160 px). Lernpfad: Knoten senkrecht untereinander an einer Linie links (Knotenpunkt 10 px), ab 768 px je Knoten zweispaltig `280px minmax(0, 1fr)`: Projektkarte links, Mini-Einheiten rechts (`src/pages/pages.css`). Projektseite: Notizen mobil als hochziehbare Leiste über der festen unteren Navigation (60 px), ab 1024 px als klebende Seitenleiste (20rem).

### Luft

- Abstandsstufe `--abstand-7` (64 px) ergänzt die Stufen 1 bis 6.
- Zwischen Projektabschnitten (`.project-section`) 64 px; Abschnittsüberschrift zu Inhalt 16 px (`--abstand-4`).
- Rückmeldungen („Richtig“ / „Nicht ganz“, Erkenntnis-Kasten, Hinweise): mindestens 16 px zum Element darüber, 24 px (`--abstand-5`) zum Element darunter. Antwortoptionen untereinander 12 px (`--abstand-3`).
- Demos: zwischen Steuerung, Diagramm, Urteil und Kennzahlen 24 px (`--abstand-5`).
- Die Regel gilt einmal zentral in `learning.css` und `components.css`; Modul-CSS setzt keine engeren Werte.

## Elevation & Depth

Hauptsächlich flach: Tiefe entsteht durch Kartenweiß auf Off-White und Haarlinie. Karten und Panels tragen einen kaum sichtbaren Schatten; nur schwebende Dinge (Notizen-Leiste, Notizen-Knopf) heben sich stärker ab.

### Shadow Vocabulary
- **Klein** (`0 1px 2px rgb(27 21 23 / 0.05), 0 2px 8px rgb(27 21 23 / 0.04)`; dunkel `0 1px 2px rgb(0 0 0 / 0.30)`): Karten, Panels, Pfadknoten.
- **Mittel** (`0 8px 24px rgb(27 21 23 / 0.12)`; dunkel 0.45): Notizen-Leiste und -Knopf, Aufklappfeld der Glocke, Schublade, Tooltip der Schiene.
- **Fokusring** (`0 0 0 3px rgb(148 100 25 / 0.24)`): zusammen mit 2 px goldener Kontur, 2 px Abstand.

### Named Rules
**The Haarlinie Rule.** Eine Karte ist erst durch ihre 1-px-Linie eine Karte; der Schatten ist nur Beigabe.

## Shapes

Weich, aber nicht verspielt. Eingabefelder, Buttons und Navigation 6 px, Zeichnungsfläche 10 px, Karten und Panels 12 px, Pillen (Tags, Pfad-Punkte) und die runde Versuchsmarke voll rund. Linien 1 px, Marke und Punkte 1,5 px. Strichzeichnungen und Zeichen: 1,5er Strich, runde Enden und Ecken.

## Components

### Buttons
- **Shape:** 6 px, mindestens 44 px hoch, Padding 0 16 px, Gewicht 500.
- **Primary:** Weinrot mit weißer Schrift (dunkel: Rosé mit dunkler Schrift); Hover tieferes Weinrot. Auf einer Fläche gibt es höchstens einen gefüllten Knopf.
- **Secondary:** transparent, Weinrot in Schrift und Rahmen; Hover weiche Weinrot-Fläche.
- **Quiet:** transparent, Tinte; Hover neutrale Fläche.
- **Disabled:** Deckkraft 0.5.

### Versuchsmarke (Signatur)
Kreis 72 px mit 1,5-px-Tintenrand: oben das Wort „Versuch“ (oder „Einheit“), darunter die Nummer. Kleine Variante als Pille (nur Nummer). Trägt `role="img"` mit sprechendem Label.

### Strichzeichnung
Jeder Versuch hat eine eigene SVG in Tinte auf Hintergrundfläche (10 px Radius, maximal 110 px hoch). Ohne eigene Zeichnung steht das Track-Zeichen groß (40 px) in Gedämpft.

### Status-Tag und Punktreihe
Pille mit Zeichen und Wort: offen = leerer Kreis, begonnen = halber Kreis auf neutraler Fläche, fertig = Haken auf weichem Grün. Die Punktreihe (16 px, 1,5-px-Rand) zeigt je Projekt leer, halb oder voll in Tinte; die Zahl steht immer zusätzlich als Text, die Punkte sind für Screenreader verborgen.

### Track-Zeichen
Fünf Strichzeichen (Experimentation, Web, Personalisierung, Experience, KI) in Tinte, 20 px neben dem Label; als Abzeichen 40 px in Karte mit Haarlinie.

### Cards / Panels
Kartenweiß, 1-px-Haarlinie, 12 px Radius, Schatten klein; Card Padding 16 px, Panel 24 px mit eigener Überschrift (1.05rem).

### Erkenntnis-Kasten
Weiche Goldfläche, 1-px-Goldrahmen, 6 px Radius; Titel in Gold tief.

### Inputs / Fields
Kartenweiß, 1-px-Rahmen in `rahmen-stark`, 6 px, 44 px hoch. Fehler: Rahmen und Text in Fehlerfarbe, mit Meldungstext. Auswahlfelder als 44-px-Zeilen mit 20-px-Steuerelement in Weinrot.

Regler (`Slider`) melden jeden Zwischenwert über `onChange`. Ist die Rechnung dahinter teuer, meldet `onCommit` den Wert erst nach dem Loslassen (Zeiger hoch, Taste los, Fokusverlust) und nur, wenn er sich geändert hat. Bis dahin zeigt der Regler den Entwurf, das Diagramm bleibt gedämpft stehen (`aria-busy`), so in 006 „Wiederholen“.

### Schalter (`Switch`)
Knopf mit `role="switch"` und `aria-checked`, 44 px hoch: sichtbares Label, Schiene 44 × 24 px mit Knopf 18 px, daneben „An“/„Aus“ gedämpft. Eingeschaltet Schiene in Weinrot, der Knopf gleitet 20 px nach rechts. Schiene und Statuswort sind für Screenreader verborgen, der Zustand kommt aus `aria-checked`.

### Aufklapper (`Disclosure`)
Natives `<details>` mit Kopf und Marke rechts (Kreis 24 px, 1-px-Rahmen `rahmen-stark`). Marke `chevron` (Standard): Pfeil `chevron-down`, offen um 180° gedreht. Marke `help`: „?“, offen „×“, ohne Drehung; für Erklärungen zu einem Begriff. Optional verborgene Zusätze `openLabel`/`closedLabel` hinter dem Kopf.

### Interaktive Formel (`InteractiveFormula`)
Formel aus Text und Termen als Knöpfe (mindestens 44 px, ruhend dezenter Rand, aktiv weinrot mit `aria-pressed`), als Zeile oder als Bruch mit Strich über die volle Breite. Genau ein Term ist aktiv; das Detailfeld darunter nennt Bezeichnung, eingesetzten Wert (Code-Zeile, dieselbe Rechnung wie die Schritte) und Erklärung in höchstens zwei Sätzen. Hover, Fokus und Klick wählen den Term, angesagt wird nur bei Fokus und Klick. Der zugehörige Regler bekommt einen Ring (`.is-linked`).

### Brotkrumen (`Breadcrumb`)
`<nav aria-label="Brotkrumen">` mit Liste über der Überschrift, Glieder durch „›“ (verborgen, sehr gedämpft) getrennt. Links mindestens 44 px hoch; das letzte Glied ist die aktuelle Seite, ohne Link, gedämpft, mit `aria-current="page"`.

### Abschnittskopf (`SectionActions`)
Projektabschnitte haben eine Kopfzeile: Überschrift links, Bedienelemente rechts (etwa der Schalter „Eigene Zahlen prüfen“ in der Demo), bei Enge umgebrochen darunter. Die Demo rendert sie per `SectionActions` dorthin, ihr Zustand bleibt in der Demo. Ein Schalter im Kopf ist bündig rechts und 0,9 rem groß, damit er bei 375 px neben „Demo“ passt.

### Codeblock (`CodeBlock`)
Codeblock für kurze Aufrufe (Fläche neutral, Radius klein, 0,8 rem, waagerecht scrollbar im Block, nicht auf der Seite) mit Kopierknopf rechts oben (`quiet`, mindestens 44 px, Symbol `copy`). Der Knopf zeigt kurz „Kopiert“ mit `check` oder „Nicht kopiert“ und fällt nach 2 s zurück; angesagt wird das über eine unsichtbare Live-Region. Mit `label` heißt der Knopf für Screenreader „<label> kopieren“ und behält den Namen in allen Zuständen. Unter 480 px Breite steht der Knopf rechtsbündig über dem Code, damit nichts verdeckt wird. Abstand oben `abstand-3`, unten `abstand-4`. Kein Weinrot im Block selbst.

### Karte zum Umdrehen (`FlipCard`)
Karteikarte, die sich um die senkrechte Achse dreht (`rotateY`, 450 ms, `animation-kurve`, Perspektive 1200 px). Beide Seiten liegen im selben Rasterfeld übereinander, die höhere bestimmt die Höhe, die Karte springt beim Drehen also nicht. Jede Seite: Fläche, Haarlinie, Radius, Schatten klein, Polster `abstand-4`. Die Seiten tragen keine Beschriftung, Frage und Antwort erklären sich selbst; nur `label` (der Projekttitel) steht gedämpft und klein über der Vorderseite. Die verdeckte Seite ist `aria-hidden` und `inert`, im Tab-Weg liegt also nur die sichtbare; die Rückseite zeigt oben die Frage noch einmal klein und gedämpft (`flip-card-recall`, wie `label`, für Screenreader verborgen) und darunter die Antwort; die Rückseite ist per `backRef` fokussierbar (`tabIndex={-1}`), damit die Lernrunde nach dem Aufdecken dorthin springen kann. Mit `onFlip` steht darunter ein Zweitknopf mit `retry` („Karte umdrehen“ bzw. „Zur Vorderseite“), ohne `onFlip` steuert die Seite den Zustand selbst (Lernrunde: „Antwort zeigen“, Leertaste). Bei reduzierter Bewegung gibt es keine Drehung, die Seiten blenden in 150 ms ineinander. Im Projektabschnitt „Karten“ blättert `CardPager` seitenweise: eine Karte je Seite, ab 600 px Abschnittsbreite zwei nebeneinander; darunter Zweitknöpfe ‹ und › (44 px, `chevron-left`/`chevron-right`, am Rand inaktiv, kein Rundlauf) mit „3–4 von 12“ dazwischen (Live-Region). Alle Karten bleiben gerendert und liegen je Spalte in derselben Rasterzelle, unsichtbare sind `inert` und `aria-hidden`; so sind alle Karten so hoch wie die höchste, die Höhe springt beim Blättern nicht, und umgedrehte Karten bleiben umgedreht. Eigene Karten blättern genauso, ihr Löschknopf steht unter der Karte.

### Einschätzung im Einstieg
Die Schätzfrage vor dem Lernen steht in einem eigenen Kasten (Fläche neutral, Haarlinie, Radius 12 px) mit der gedämpften Marke „Deine Einschätzung“, damit sie sich vom Einstiegstext abhebt. Kein Weinrot, kein Gold: Sie ist weder Interaktion noch Erkenntnis.

### Notizen-Knopf
Runder gefüllter Knopf (48 px, Schatten mittel) unten rechts, über der unteren Leiste; nur Stift-Icon (`pencil`, 22 px) mit `aria-label="Notizen"` und `aria-expanded`. Ist die Leiste offen, verschwindet er; ab 1024 px stehen die Notizen als Seitenleiste und der Knopf entfällt.

### Zahlenfeld (`NumberField`)
Beschriftetes Textfeld im Eingabefeld-Stil (`type="text"`, `inputMode="decimal"`, kein Zahlenfeld des Browsers), 44 px hoch, Ziffern tabellarisch, optional mit Einheit (`suffix`) rechts daneben. Der Wert ist roher Text; die Demo entscheidet, was gültig ist, damit Tippen nicht springt. Ein Fehler (`error`) färbt Rahmen und Text in der Fehlerfarbe, verdoppelt den Rahmen auf 2 px (`aria-invalid`) und steht als Meldungstext darunter; ein Hinweis (`hint`) steht gedämpft darunter und bleibt auch bei einem Fehler sichtbar. Beide hängen über `aria-describedby` am Feld, der Fehler zuerst.

### Diagramme
Jedes Diagramm ist eine `<figure>` mit einer SVG (`role="img"`), deren `aria-label` ein ganzer Satz mit allen Werten, der Achse und dem Ergebnis ist. Ausnahme: die Diagramme auf Heute (Farben siehe dort) sind `aria-hidden` und werden über eine unsichtbare Tabelle (`visually-hidden`) vorgelesen. Gesiegt oder getroffen wird nie über Farbe allein, sondern über Form und Wort. Daten stehen in `--farbe-daten-a` (A) und `--farbe-daten-neutral` (B), jede Reihe zusätzlich beschriftet; Weinrot kommt in Diagrammen nicht vor.

- **Intervall-Strich (006, `IntervalChart`):** ein Konfidenzintervall ist Strich mit Punkt für die Schätzung. Voll gezeichnet trifft es die Wahrheit, hohl (gestrichelter Strich, Punkt in Flächenfarbe) verfehlt es sie; ohne bekannte Wahrheit sind alle voll. Die Achse ist um 0 symmetrisch und umfasst Intervall, Null und MDE. Ragt ein Intervall über die Achse, wird es am Rand abgeschnitten und trägt eine Pfeilspitze („läuft weiter“); der Beschreibungssatz zählt diese Fälle mit.
- **Linien:** die Nulllinie ist grau und gestrichelt, die Wahrheit eine durchgezogene Linie in der Farbe von A, der MDE punktiert in Tinte. Wahrheit und MDE tragen ihre Zahl als Beschriftung über dem Feld; liegen sie eng, rückt die zweite eine Zeile hoch. Im Fälle-Diagramm (031, `CasesChart`) trennt die Lage des Intervalls zu Null- und MDE-Linie die vier Fälle, jeder mit Nummer und Namen beschriftet.
- **Balkenpaar A/B (013, 004):** Balken in den Datenfarben, der Wert steht als Zahl über dem Balken, darunter „A“/„B“ bzw. „Variante A“. In `SegmentBars` (004) stehen drei Paare (Mobil, Desktop, Insgesamt) auf einer Achse ab 0 %; unter jeder Gruppe nennt ein Wort den Sieger („A vorn“, „B vorn“, „gleichauf“, bei „Insgesamt“ auch „knapp vorn“). Balkenachsen beginnen bei 0. Die einzige Ausnahme ist `SplitChart` (013), dessen Achse sonst die Abweichung von wenigen Prozent verbergen würde; die Bildunterschrift sagt das ausdrücklich.
- **Soll-Linie (013, `SplitChart`):** der erwartete Wert je Balken ist ein gestrichelter Strich in Tinte, am Rand mit „Soll“ beschriftet.
- **Verteilungen (002, `RatesChart`):** zwei Glockenkurven um dieselbe Mitte, die breite für wenige, die schmale für viele Besucher; beide direkt am Strich beschriftet.
- **Schriftgröße:** die viewBox ist 360 breit, die Figur höchstens 30rem (statische Zeichnungen 36rem). Achsen- und Tickschrift 13 SVG-Einheiten, Werte und Linienbeschriftungen 13–13,5 (004: 12–13). So bleibt die Schrift auf einem 375-px-Bildschirm, wo die Zeichnung etwa 343 px breit ist, bei rund 12 px.
- **Diagramme auf Heute (`TrackProgressChart`, `ForecastChart`):** der Fortschritt je Track ist ein gestapelter Balken (12 px hoch, 4 px Rundung außen über `overflow: hidden`) aus drei Segmenten mit 0,5 Einheiten Lücke: durchgearbeitet in `--farbe-erfolg`, begonnen in `--farbe-info`, offen in `--farbe-daten-track`. Eine Legende steht einmal oben; Track-Zeichen, Label und „x von y“ stehen als HTML über dem Balken. „Fällige Karten“ sind sieben Säulen in `--farbe-daten-faellig` (Bernstein; im hellen Modus heller als `--farbe-warnung`, damit es nicht ins Weinrot kippt) auf einer Grundlinie in `--farbe-daten-track`, Höhe relativ zum Maximum, oben leicht gerundet; „Heute“ zählt nur, was jetzt fällig ist, und zeigt damit dieselbe Zahl wie Glocke und Lernrunde; die Zahl steht als HTML über jeder Säule mit Karten, der Tag darunter. Beide SVGs sind `aria-hidden`, haben nur `<title>` zum Überfahren und bekommen ihre Aussage aus einer unsichtbaren Tabelle. Schrift ist immer Textfarbe, nie Serienfarbe. Fortschritt = Erfolg (durchgearbeitet), Info (begonnen), Track (offen); Fälligkeits-Vorschau = Bernstein (fällig): Status-Tokens (für „fällig“ ein eigener, hellerer Bernstein-Ton) statt neuer Farbfamilien, damit es nicht trist und nicht bunt wirkt; Weinrot bleibt Interaktion, Gold bleibt Erkenntnis. Ohne fällige Karten steht nur ein Satz.
- **Gold nur für Erkenntnis:** in Diagrammen färbt Gold (`--farbe-sekundaer-tief`) nur den Kipppunkt bzw. die Veränderung, etwa den Rahmen um „Insgesamt“ in 004 und nur dann, wenn das Paradox auftritt. Alles andere bleibt neutral.

### Rahmen und Navigation
Stile in `src/shell/shell.css`, die Bereiche einmal in `src/shell/nav.ts`. Grenze 768 px.

**Seitenleiste (ab 768 px fest links, 240 px):** Fläche und Schrift aus den Rollen `--farbe-seitenleiste-*`, rechts eine Haarlinie, klebt über die volle Höhe. Oben die Marke: Kreis 36 px mit 1,5-px-Strich wie die Versuchsmarke, darin „EH“, daneben „Experimental Hub“ in 600. Dann Heute · Lernpfad · Lernrunde · Notizen: Strich-Icon 20 px (gedämpft) vor dem Wort, 44 px hoch, 10 px Polster, 6 px Radius; Hover neutrale Fläche, aktiv (`aria-current="page"`) Fläche `seitenleiste-aktiv` mit Schrift `seitenleiste-aktiv-text`. Sind beim Bauen weitere Links gesetzt (`LINKS` in `tools/ziel.env`, siehe `web/src/shell/links.ts`), folgt der Abschnitt „Weitere Apps“ (Überschrift 0,75rem, Versalien, gedämpft) mit echten Links; ein kleines Extern-Zeichen erscheint beim Überfahren. Unten die **Statuskarte**, wo andere Apps eine Anmeldung zeigen: Haarlinie, 10 px Radius, Punkt (Erfolg, Fehler, gedämpft) und Text in zwei Zeilen („Server erreichbar“ / „gespeichert HH:MM“, „Speichern fehlgeschlagen“, „Server nicht erreichbar“). Der Punkt trägt nie allein. Darunter „Einklappen“ (`aria-expanded`).

**Schiene (eingeklappt, 64 px):** 12 px Rand + 10 px Polster + 20 px Icon, beim Einklappen verschiebt sich nichts. Die Wörter blenden aus (Deckkraft 0, für Screenreader weiter da), der Abschnittstitel wird ein kurzer Strich, die Statuskarte verliert ihren Rahmen. Jeder Link ist dort genau 40 px breit (ohne Abstand zum ausgeblendeten Wort), Hover- und Aktivfläche bleiben in der Schiene. Bei Hover und Tastaturfokus steht das Wort als Tooltip rechts daneben (`data-tip`): Fläche `invers`, 6 px Radius, Schatten mittel. Der Zustand bleibt im Browser (`hub-seitenleiste-schmal`, Zugriff in try/catch). Die Breite gleitet in 180 ms.

**Schublade (unter 768 px):** dieselbe Leiste, 85 % breit (höchstens 20rem), rechts 16 px Radius, Schatten mittel, über einem Schleier (`invers` zu 40 %). Der Menü-Knopf oben links öffnet sie; Schleier, Esc, „Menü schließen“ und jeder Seitenwechsel schließen sie. Offen ist sie ein modaler Dialog (`role="dialog"`, `aria-modal`, Name „Menü“). Der Fokus springt auf „Menü schließen“; beim Schließen über Esc, Schleier oder den Knopf kehrt er zum Menü-Knopf zurück, nach einem Seitenwechsel steht er im neuen Inhalt. Der Inhalt dahinter und der Sprunglink sind `inert`. Geschlossen gilt `visibility: hidden`, damit keine Tab-Stopps übrig bleiben.

**Obere Leiste:** Kartenweiß mit Haarlinie unten, 64 px (mobil 60 px, als `--hoehe-leiste`), rechts neben der Seitenleiste, mobil über die volle Breite. Sie klebt oben, damit die Suche immer zu sehen ist (Ebene 10: über dem Inhalt, unter Seitenleiste 20, Schleier 40 und Schublade 50; das Glocken-Feld liegt in ihrem Ebenen-Kontext); Klebendes darunter wie die Notizen-Spalte setzt bei `--hoehe-leiste` + 16 px an. Links nur mobil der Menü-Knopf, dann die **Suchzeile** (`role="search"`, verborgenes Label „Suchen“, Lupe 18 px im Feld, Eingabefeld-Stil, flexibel bis 32rem). Rechts im Feld steht die Taste `/`; sie springt von überall hinein, nur nicht beim Tippen in einem anderen Feld. Tippen führt auf `/suche?q=…` und ersetzt dort den History-Eintrag. Rechts die **Glocke** und der Hell/Dunkel-Schalter: 44-px-Quadrate mit Haarlinie, Icon 20 px gedämpft, Hover neutral. Der Modus-Schalter zeigt Mond bzw. Sonne als Ziel des Wechsels, mit Verb im `aria-label`; mobil steht er in der unteren Leiste.

**Glocke:** Die Zahl fälliger Karten steht als kleine Weinrot-Pille (`.nav-badge`, 18 px, mit Ring in Flächenfarbe) an der Ecke des Icons; der Name lautet „Fällige Karten, 8“ bzw. „Keine fälligen Karten“. Ein Klick öffnet ein Aufklappfeld (`aria-expanded`, `aria-controls`; Kartenweiß, Haarlinie, 12 px, Schatten mittel, höchstens 20rem): „8 Karten fällig“, je Projekt Titel und Zahl in Zeilen mit Haarlinie, dann „Lernrunde starten“ als einziger gefüllter Knopf. Ohne Fälliges steht dort „Gerade ist nichts fällig.“ Esc, Tab hinaus und Klick daneben schließen; Esc gibt den Fokus an die Glocke zurück. Die Zahl stammt aus derselben Liste wie die Lernrunde.

**Suche (`/suche`):** Überschrift, Trefferzahl (`aria-live="polite"`), dann die Gruppen Versuche (Marke als Pille, Titel, Leitfrage, Track-Zeichen mit Label), Karten (Vorderseite, Ausschnitt der Rückseite, ggf. „Eigene Karte“ und Projekt) und Notizen (Projekt, Ausschnitt, Art). Jeder Treffer ist eine Zeile mit Haarlinie, Hover neutral mit weinrotem Titel, und führt auf das Projekt. Groß- und Kleinschreibung zählen nicht, mehrere Wörter müssen alle vorkommen.

**Untere Leiste (unter 768 px):** Fläche mit Haarlinie oben, 60 px plus Safe-Area. Reihenfolge Lernpfad · Lernrunde · **Heute** · Notizen · Hell/Dunkel. Jeder Platz: Strich-Icon 22 px, darunter das Wort in 11 px/500, gedämpft; aktiv weinrot. „Heute“ ist ein runder Weinrot-Knopf (56 px, Icon 26 px), 20 px angehoben, mit 4-px-Ring in Hintergrundfarbe und mittlerem Schatten; nur `aria-label`, kein sichtbares Wort. Der Modus-Schalter steht mobil hier statt oben, damit die Mitte symmetrisch bleibt.

**Sprunglink:** „Zum Inhalt springen“ erscheint beim ersten Tab oben links und springt hinter die Leisten in den Inhalt.

### Tasten (`Kbd`)
`<kbd class="kbd">`: Kartenweiß, 1-px-Rahmen in `rahmen-stark`, unten 2 px plus feiner Schatten (wirkt drückbar), 6 px Radius, Monospace in 0,9em der Umgebung, Polster 0,1em × 0,5em, mindestens 1,9em breit, mit tabellarischen Ziffern. Für Tastenhinweise im Text („Leertaste: Antwort zeigen“, „/“ im Suchfeld), nie als Knopf.

### Icons
Eigener Satz in `src/design/components/Icon.tsx` (Haken, Kreuz, Pfeil nach unten `chevron-down`, Wiederholen, Heute, Lernpfad, Karten, Notiz, Stift `pencil`, Mond, Sonne, Glocke, Lupe, Menü, Schließen, Extern, Einklappen, Server, Uhr, Kiste, Person): 24er Raster, Strich 1,5, `currentColor`, runde Enden, stehen neben einem Wort oder in einem benannten Knopf und sind verborgen.

### Motion
Kurze Übergänge 120 ms (Hover), 180 ms (Leiste, Einklappen), 280 ms (Schublade, Schleier), Kurve `cubic-bezier(0.2, 0.8, 0.2, 1)`. Die Notizen-Leiste gleitet 24 px hoch; sie, Schublade, Schleier und Schiene bewegen sich bei `prefers-reduced-motion` nicht.

## Do's and Don'ts

### Do:
- **Do** Status immer als Zeichen plus Wort setzen, Tracks immer als Zeichen plus Label.
- **Do** neue Zeichen im selben Strichmaß zeichnen: 1,5, `currentColor`, runde Enden.
- **Do** neue Projekte als nummerierten Versuch mit eigener Strichzeichnung anlegen.
- **Do** Gold als Schrift oder Strich über `--farbe-sekundaer-tief` setzen.
- **Do** alle bedienbaren Ziele auf mindestens 44 px bringen.
- **Do** neue Werte als Rollen `--farbe-*` in `tokens.css` führen, hell und dunkel.

### Don't:
- **Don't** Weinrot für Dekoration oder Status verwenden.
- **Don't** Tracks oder Status über Farbe allein unterscheiden.
- **Don't** Emojis oder Schrift-Glyphen (✓, ✗, ☀️) als Icons einsetzen.
- **Don't** Fortschritt als anonyme Kachelliste darstellen; Balken nur mit Legende und Zahl „x von y“.
- **Don't** mehr als einen gefüllten Knopf auf einer Fläche setzen.
- **Don't** den Fokusring in Weinrot umfärben; er bleibt golden.
