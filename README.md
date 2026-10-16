<div align="center">

# Telematik verstehen

Eine Lernanwendung für Netzwerktechnik: geführte Lektionen, IPv4-Trainer, Übungen und gespeicherter Lernfortschritt. Desktoporientiert, mit TradingView-Slate-/Blau-Palette und optionalem Hellmodus.

![React](https://img.shields.io/badge/React-19-149eca?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-6-646cff?style=flat-square)

</div>

![Die Desktop-Übersicht von Telematik verstehen](docs/dashboard-dark.png)

## Funktionen

- **14 Themen in 59 Schritten lernen:** Geräte und Adressen zuerst, dann Binärzahlen, IPv4 und Subnetting. Jeder Schritt enthält eine Erklärung, ein Beispiel und eine kurze Verständnisfrage. Bei Fehlern wird der entscheidende Punkt erklärt.
- **IPv4 verstehen:** Adressen, Masken und Bits live verändern; Netzadresse, Broadcast und Hostbereich nachvollziehen. `/31` und `/32` werden als Sonderfälle behandelt.
- **Selbst ausprobieren:** Binärtrainer, beidseitiger Netzvergleich und FLSM-Aufteilung.
- **Aktiv üben:** 70 feste Fragen, neu generierte Subnetting-Aufgaben, Hinweise, begründetes Feedback und Fehlerwiederholung.
- **Prüfungstraining machen:** Eine gemischte Runde mit einer Frage pro Thema und anschliessender Auswertung.
- **Zusammenhänge ausprobieren:** Schrittweise Abläufe für DHCP, DNS und Websiteaufrufe sowie eine bearbeitbare Routingtabelle und PAT-Zuordnungen.
- **Fortschritt behalten:** Der genaue Lektionsschritt bleibt nach einem Reload erhalten. JSON-Sicherungen, Hell-/Dunkelmodus, Tastaturbedienung und Fokus-Timer sind eingebaut.

Keine Anmeldung, API-Schlüssel oder Backend-Dienste. Die Anwendung lädt keine externen Schriften oder Video-Player; Quellen und Videos öffnen nur nach einem Klick.

Der Lernstand bleibt im Browser. Die produktive App sperrt ausgehende Datenanfragen und übermittelt keinen Referrer. Hinweise zu Hosting, Sicherungen und öffentlichem Quellcode stehen in [docs/PRIVACY.md](docs/PRIVACY.md).

## Als Link oder Datei benutzen

Zum Lernen brauchst du keine Entwicklungswerkzeuge. Die fertige **Telematik-verstehen.html** enthält die ganze App. Auf einer gehosteten Version kannst du sie mit **Offline-Datei** rechts oben speichern. Antworten und Fortschritt werden nicht in die weitergegebene HTML-Datei eingebettet; eine separate Sicherung lässt sich in der App exportieren.

Die Website-Bereitstellung über GitHub Pages ist vorbereitet. Ein Administrator muss einmal Pages aktivieren und **Publish study site** starten. Der Link ist erst nach erfolgreicher Veröffentlichung live. Die konkreten Schritte stehen in [docs/ACCESS.md](docs/ACCESS.md).

## Entwickeln und bearbeiten

Installiere eine aktuelle **Node.js-LTS-Version** (mindestens 20.19; Node 22 empfohlen). Öffne ein Terminal im Projektordner:

```sh
npm ci
npm run dev
```

Öffne die im Terminal angezeigte lokale Adresse. Mit `Ctrl+C` beendest du den Entwicklungsserver.

### Ohne Entwicklungswerkzeuge lernen

```sh
npm run build
```

Danach kannst du **`dist/index.html` per Doppelklick öffnen** oder diese Datei weitergeben. Das fertige Lernprogramm ist in einer HTML-Datei gebündelt. Externe Quellen/Videos benötigen weiterhin Internet. Der Fortschritt bleibt pro Browser und Speicherort getrennt; nutze den Export für Sicherungen und zum Übertragen.

Bei erfolgreichen GitHub-Actions-Läufen wird der fertige Build ausserdem als Download-Artefakt `Telematik-verstehen-offline` bereitgestellt. Zusätzlich ist eine getrennte GitHub-Pages-Bereitstellung vorbereitet; deren Aktivierung ist in [docs/ACCESS.md](docs/ACCESS.md) beschrieben.

## Quellcode bearbeiten

Die wichtigsten Dateien:

| Du möchtest …                       | Dann bearbeite …          |
| ----------------------------------- | ------------------------- |
| Geführte Lektionen ändern           | `src/learning.ts`         |
| Feste Quizfragen ändern             | `src/content.ts`          |
| Eine IPv4-Berechnung ändern         | `src/network.ts`          |
| Einen Netzwerkablauf erklären       | `src/simulations.ts`      |
| Routing-/PAT-Übungen ändern         | `src/SimulationTools.tsx` |
| Farben, Abstände oder Layout ändern | `src/styles.css`          |
| Navigation oder Dashboard erweitern | `src/App.tsx`             |

Ein ausführlicherer Überblick steht in [docs/HANDOFF.md](docs/HANDOFF.md). Entstanden als gemeinsam geplantes, KI-unterstützt entwickeltes Lern- und Portfolio-Projekt.

## Qualität prüfen

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Die IPv4-Tests verwenden unabhängige Referenzwerte aus Pythons `ipaddress`-Modul für jeden Präfix von `/0` bis `/32`. Browserprüfungen durchlaufen alle 59 Lektionsschritte und testen Quiz, Fortschritt, Zurück-/Weiter-Navigation, Routing/PAT, beide Farbschemata und automatisierte Accessibility-Regeln. GitHub Actions führt Build und Tests bei Pushes und Pull Requests aus. Die tatsächlich ausgeführten Prüfungen und ihre Grenzen stehen in [docs/VALIDATION.md](docs/VALIDATION.md).

```sh
npm run format        # Quelltext formatieren
npm run format:check  # Formatierung prüfen
```

## Quellen & Grenzen

Basis ist das bereitgestellte **Telematik-Lernskript (21 Seiten, 15. Oktober 2026)**, inklusive der fachlichen Präzisierungen auf Seite 20. Die 14 Originalhandouts mit 164 Seiten wurden nicht bereitgestellt; die Anwendung behauptet deshalb keine unabhängig geprüfte vollständige Abdeckung dieser Originale. Die Quellenübersicht in der App enthält offizielle Referenzen und Video-Links aus dem Skript. Aktuelle Videoverfügbarkeit wurde nicht verifiziert.

Vorherige Quizversuche und Lesemarkierungen bleiben in Sicherungen erhalten. Für die neuen geführten Lektionen werden die einzelnen Verständnisfragen separat gespeichert; ein alter «gelesen»-Klick gilt nicht als Bearbeitung der neuen Schritte.

Freie Erklärfragen sind als **Selbstkontrolle** gekennzeichnet. Die Website behauptet keine zuverlässige automatische Bewertung freier Texte. Der Lernfortschritt wird weder synchronisiert noch an einen Server gesendet. Bei gesperrtem Browserspeicher informiert die Anwendung über das Problem.

Ein privates Bildungsprojekt, kein offizielles Angebot von BBC oder Moodle. Eine mögliche spätere Integration in «BBC Moodle Hilfe» ist noch nicht umgesetzt. Unterrichtsmaterialien sollten nur mit den erforderlichen Rechten weitergegeben werden; die Original-PDFs sind nicht im Repository enthalten.
