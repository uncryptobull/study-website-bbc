# Projektübergabe

## Stand

«Telematik verstehen» ist eine eigenständige React/TypeScript-Anwendung mit Vite. Kein Backend, keine Anmeldung und keine API-Schlüssel. Der Desktop ist das primäre Ziel; schmale Bildschirme werden ebenfalls unterstützt. Die Oberfläche verwendet eine Slate-/Blau-Palette, ohne die früheren grünen Flächen und Marketingtexte. Dark ist der Standard für neue Profile. Theme, Fortschritt und der genaue Lektionsschritt werden im Browser gespeichert.

Umgesetzt: 14 Lektionen mit 59 geführten Schritten, kurzen Verständnisfragen und visuellen Beispielen, 70 feste Fragen, generierte Subnetting-Aufgaben, Prüfungstraining, Fehlerwiederholung, IPv4-/Binärtrainer, Netzvergleich, FLSM, schrittweise Netzwerkabläufe, interaktive Routing-/PAT-Tabellen sowie Import/Export von Fortschritt. Erklärfragen werden ausdrücklich selbst eingeschätzt. Automatische Trefferquoten enthalten nur automatisch prüfbare Fragen.

## Zugang für Lernende

Die Einzelfile-Version ist weiterhin das installationsfreie Ergebnis. Die Produktionsoberfläche kann über **Offline-Datei** eine saubere selbstständige Kopie herunterladen. GitHub-Pages-Bereitstellung ist in `.github/workflows/pages.yml` vorbereitet; Hosting wurde nicht durch die Sitzung aktiviert und ein Live-Link ist noch nicht bestätigt. Siehe `docs/ACCESS.md` für die einmaligen Admin-Schritte.

Beim Fortschrittsimport zählt die neueste Antwort je Frage, damit alte Sicherungen keine bereits behobenen Fehler wieder öffnen. Simulationstabs behalten besuchte Schritte und bearbeitete Routing-/PAT-Eingaben, solange die Ansicht geöffnet bleibt.

## Quellen und Grenzen

Die Inhalte basieren auf dem bereitgestellten 21-seitigen Telematik-Lernskript. Die Präzisierungen auf Seite 20 sind berücksichtigt. Die 164 Originalseiten und deren Abbildungen wurden nicht bereitgestellt. Videos sind Links aus dem Skript; ihre aktuelle Verfügbarkeit wurde nicht geprüft. Keine Behauptung einer offiziellen Prüfungsabdeckung oder Zugehörigkeit zu BBC/Moodle.

## Start

```sh
npm ci
npm run dev
```

Voraussetzung: Node.js ab 20.19 (empfohlen: aktuelle Node-22-LTS-Version). `npm run build` erzeugt eine eigenständig öffnungsfähige `dist/index.html`, inklusive lokal eingebetteter Schriften. Links zu externen Quellen benötigen Internet.

## Wo ändere ich was?

| Datei                      | Zuständigkeit                                            |
| -------------------------- | -------------------------------------------------------- |
| `src/learning.ts`          | Geführte Lektionsschritte und Verständnisfragen          |
| `src/GuidedLesson.tsx`     | Lektionsansicht, Schrittsteuerung und Zusammenfassung    |
| `src/LessonVisual.tsx`     | Lernillustrationen und direkte Interaktionen             |
| `src/content.ts`           | Feste Quizfragen, Quellen und Videoverweise              |
| `src/network.ts`           | Reine IPv4-Berechnungen                                  |
| `src/Trainer.tsx`          | Interaktive Trainer                                      |
| `src/Quiz.tsx`             | Antwortprüfung, Hinweise und Übungsrunden                |
| `src/simulations.ts`       | Schritte der Netzwerkabläufe                             |
| `src/storage.ts`           | Fortschrittsformat und Importvalidierung                 |
| `src/App.tsx`              | Navigation, Startseite, Lektionsübersicht                |
| `src/navigation.ts`        | URL-Routen für Lektionen und Schritte                    |
| `src/StudyPages.tsx`       | Fortschritt, Sicherungen, Begriffssuche und Quellen      |
| `src/learning-progress.ts` | Abschlussregeln für die geführten Lektionen              |
| `src/quiz-utils.ts`        | Eingabeprüfung und aufgabenspezifische Hinweise          |
| `src/SimulationTools.tsx`  | Bearbeitbare Routingtabelle und PAT-Zuordnung            |
| `src/styles.css`           | Desktop-Layout, kleinere Bildschirme, beide Farbschemata |
| `e2e/study.spec.ts`        | Browserprüfungen                                         |

## Zusammenarbeit

Bestehende Checkouts verwenden. Cloud-Aufgaben laufen bereits isoliert; keine zusätzlichen Git-Worktrees nötig. Für parallele Änderungen je eine Branch und möglichst getrennte Module verwenden, etwa `feat/learning-content` und `feat/network-trainer`. Vor Beginn `git pull --ff-only` im gemeinsamen Hauptzweig, dann `git switch -c feat/deine-aenderung`. Gemeinsame Dateien wie `App.tsx`, `styles.css`, `content.ts` und die Lockdatei bewusst abstimmen. Keine Force-Pushes.

Vor einer Integration fremden Codes erst Struktur und vorhandene Funktionen vergleichen, dann Änderungen gezielt übernehmen. Nie eine zweite komplette Projektstruktur über die erste kopieren. PRs klein halten und nach bestandenem Build/Test zusammenführen.

## Prüfungen

`npm test` prüft Berechnungen für alle IPv4-Präfixe mit unabhängig über Python `ipaddress` bestimmten Referenzwerten, Sonderfälle, ungültige Eingaben, Fragenbestand und Sicherungsformat, Antwortformate, Routerauswahl, PAT-Zuordnungen und URL-Routen. Alte Lesemarkierungen bleiben in Backups erhalten; neue geführte Lektionen zählen erst nach den jeweiligen Verständnisfragen als abgeschlossen.

Für Browserprüfungen einmal `npx playwright install chromium`, dann `npm run test:e2e`. In Cloud-Maschinen mit vorhandenem System-Chromium: `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`. Die Browserprüfungen durchlaufen alle 59 Lektionsschritte und decken ausserdem Trainer, Fehlerrunden, gemischte Prüfung, Speicherung, Import/Export, schmale Ansichten sowie automatisierte Accessibility-Prüfungen für beide Themes ab. Automatische Checks ersetzen keine vollständige manuelle Prüfung.

## Sinnvolle nächste Schritte

1. Originalhandouts bereitstellen und Inhalte/Abbildungen fachlich abgleichen.
2. Mit zwei echten Lernenden Feedback zu Erklärungen und Quizfragen sammeln.
3. Bei Bedarf BBC Moodle Hilfe konkretisieren: Link, Einbettung oder Inhaltsimport. Es ist noch keine Integration vorhanden.
4. Optional Fragenbank und Erklärungen erweitern. Accounts und Server sind für diese Version nicht erforderlich.
