# Tatsächlich geprüfter Stand

Geprüft am 15. Oktober 2026 in der Cloud-Entwicklungsumgebung, mit Node.js 24 und System-Chromium.

- `npm ci --cache /tmp/telematik-npm-cache --no-audit --no-fund`: erfolgreich mit unveränderter Lockdatei.
- `npm run build`: erfolgreich; selbstständige HTML-Datei mit eingebetteten Skripten, Styles und Schriftdateien.
- `npm test`: **61 Tests bestanden**, darunter Referenzwerte für alle IPv4-Präfixe von /0 bis /32, Masken, FLSM, beidseitiger Netzvergleich, ungültige Eingaben, Fragenbestand und Fortschrittsimport.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e -- --workers=2`: **10 Browsertests bestanden**. Abgedeckt sind Lektionen, Suche, Speicherung nach Reload, Trainer, falsche und richtige Quizantworten, Fehlerwiederholung, generierte Aufgaben, eine vollständige gemischte Prüfung, Import/Export, Rücksetzbestätigung, Navigation und schmale Ansichten.
- Automatische WCAG-A/AA-Prüfungen mit axe: keine gemeldeten Verstösse auf den sieben geprüften Hauptseiten in beiden Farbschemata. Das ist keine vollständige manuelle Barrierefreiheitszertifizierung.
- Produktions-HTML über einen lokalen HTTP-Server geladen, danach Netzwerk offline geschaltet: Trainer, Themewechsel und Lektionen funktionieren weiter. Alle Schriften/Assets sind eingebettet; nur die HTML-Dokumente wurden angefordert. Fortschritt bleibt nach Reload erhalten. Keine beobachteten JavaScript-Laufzeitfehler.
- Direkte Navigation zu `file://` wurde durch die Richtlinie des Cloud-Browsers blockiert. Doppelklick-Öffnen auf einem eigenen Rechner ist deshalb hier nicht separat bestätigt. Bei restriktiven Schulgeräten kann die App mit `npm run preview` lokal über HTTP genutzt werden.
- `npm run format:check` und `git diff --check`: erfolgreich.

Nicht geprüft: Firefox/Safari, aktuelle Videoverfügbarkeit, Inhalt der nicht bereitgestellten 164 Originalseiten, Moodle-Integration oder ein öffentlicher Hostingbetrieb. GitHub Actions ist eingerichtet; die obigen Ergebnisse stammen aus dieser Umgebung, nicht aus einem unabhängig beobachteten Actions-Lauf.
