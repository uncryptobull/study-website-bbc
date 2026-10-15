# Projektübergabe

## Stand

«Telematik verstehen» ist eine eigenständige React/TypeScript-Anwendung mit Vite. Kein Backend, keine Anmeldung und keine API-Schlüssel. Der Desktop ist das primäre Ziel; schmale Bildschirme werden ebenfalls unterstützt. Light/Dark-Modus und Lernfortschritt werden im Browser gespeichert.

Umgesetzt: 14 Lektionen, 70 feste Fragen, generierte Subnetting-Aufgaben, Prüfungstraining, Fehlerwiederholung, IPv4-/Binärtrainer, Netzvergleich, FLSM, schrittweise Netzwerkabläufe sowie Import/Export von Fortschritt. Erklärfragen werden ausdrücklich selbst eingeschätzt. Automatische Trefferquoten enthalten nur automatisch prüfbare Fragen.

## Quellen und Grenzen

Die Inhalte basieren auf dem bereitgestellten 21-seitigen Telematik-Lernskript. Die Präzisierungen auf Seite 20 sind berücksichtigt. Die 164 Originalseiten und deren Abbildungen wurden nicht bereitgestellt. Videos sind Links aus dem Skript; ihre aktuelle Verfügbarkeit wurde nicht geprüft. Keine Behauptung einer offiziellen Prüfungsabdeckung oder Zugehörigkeit zu BBC/Moodle.

## Start

```sh
npm ci
npm run dev
```

Voraussetzung: Node.js ab 20.19 (empfohlen: aktuelle Node-22-LTS-Version). `npm run build` erzeugt eine eigenständig öffnungsfähige `dist/index.html`, inklusive lokal eingebetteter Schriften. Links zu externen Quellen benötigen Internet.

## Wo ändere ich was?

| Datei                | Zuständigkeit                                            |
| -------------------- | -------------------------------------------------------- |
| `src/content.ts`     | Lektionen, feste Fragen, Quellen und Videoverweise       |
| `src/network.ts`     | Reine IPv4-Berechnungen                                  |
| `src/Trainer.tsx`    | Interaktive Trainer                                      |
| `src/Quiz.tsx`       | Antwortprüfung, Hinweise und Übungsrunden                |
| `src/simulations.ts` | Schritte der Netzwerkabläufe                             |
| `src/storage.ts`     | Fortschrittsformat und Importvalidierung                 |
| `src/App.tsx`        | Navigation, Dashboard, Lektionen, Fortschritt, Quellen   |
| `src/styles.css`     | Desktop-Layout, kleinere Bildschirme, beide Farbschemata |
| `e2e/study.spec.ts`  | Browserprüfungen                                         |

## Zusammenarbeit

Bestehende Checkouts verwenden. Cloud-Aufgaben laufen bereits isoliert; keine zusätzlichen Git-Worktrees nötig. Für parallele Änderungen je eine Branch und möglichst getrennte Module verwenden, etwa `feat/learning-content` und `feat/network-trainer`. Vor Beginn `git pull --ff-only` im gemeinsamen Hauptzweig, dann `git switch -c feat/deine-aenderung`. Gemeinsame Dateien wie `App.tsx`, `styles.css`, `content.ts` und die Lockdatei bewusst abstimmen. Keine Force-Pushes.

Vor einer Integration fremden Codes erst Struktur und vorhandene Funktionen vergleichen, dann Änderungen gezielt übernehmen. Nie eine zweite komplette Projektstruktur über die erste kopieren. PRs klein halten und nach bestandenem Build/Test zusammenführen.

## Prüfungen

`npm test` prüft Berechnungen für alle IPv4-Präfixe mit unabhängig über Python `ipaddress` bestimmten Referenzwerten, Sonderfälle, ungültige Eingaben, Fragenbestand und Sicherungsformat.

Für Browserprüfungen einmal `npx playwright install chromium`, dann `npm run test:e2e`. In Cloud-Maschinen mit vorhandenem System-Chromium: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`. Die Browserprüfungen decken unter anderem Trainer, Fehlerrunden, gemischte Prüfung, Speicherung, Import/Export, schmale Ansichten sowie automatisierte Accessibility-Prüfungen für beide Themes ab. Automatische Checks ersetzen keine vollständige manuelle Prüfung.

## Sinnvolle nächste Schritte

1. Originalhandouts bereitstellen und Inhalte/Abbildungen fachlich abgleichen.
2. Mit zwei echten Lernenden Feedback zu Erklärungen und Quizfragen sammeln.
3. Bei Bedarf BBC Moodle Hilfe konkretisieren: Link, Einbettung oder Inhaltsimport. Es ist noch keine Integration vorhanden.
4. Optional Fragenbank und Erklärungen erweitern. Accounts und Server sind für diese Version nicht erforderlich.
