# Tatsächlich geprüfter Stand

Version 1.1.1, geprüft am 15. Oktober 2026 in der Cloud-Entwicklungsumgebung, mit Node.js 24 und System-Chromium.

- `npm ci --cache /tmp/telematik-npm-cache --no-audit --no-fund`: erfolgreich mit unveränderter Lockdatei.
- `npm run build`: erfolgreich; selbstständige HTML-Datei mit eingebetteten Skripten, Styles und Schriftdateien.
- `npm test`: **121 Tests bestanden**, darunter Referenzwerte für alle IPv4-Präfixe von /0 bis /32, Masken, FLSM, beidseitiger Netzvergleich, ungültige Eingaben, Fragenbestand, geführte Inhalte, Abschlussregeln, Antwortformate, aufgabenspezifische Hinweise, URL-Routen, Routerauswahl, PAT-Zuordnung, Fortschrittsimport und Zusammenführen älterer Sicherungen.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e -- --workers=2`: **19 Browsertests bestanden**. Abgedeckt sind alle 59 Lektionsschritte, richtige/falsche Verständnisantworten, Abschlüsse, genaue Position nach Reload, Browsernavigation, Trainer, Quiz/Prüfung, Fehlerwiederholung, Import/Export, beide Themes, schmale Ansichten, Routing/PAT, Fokus-Timer und Simulationstabs. Der Produktions-Test lädt nur die Einzeldatei, speichert über «Offline-Datei» eine saubere Kopie, prüft leeren Lernenden-DOM sowie eingebettete Skripte/Styles und startet die Kopie ohne zusätzliche Asset-Anfragen. Eine alte Sicherung öffnet inzwischen korrigierte Fehler nicht erneut.

- Automatische WCAG-A/AA-Prüfungen mit axe: keine gemeldeten Verstösse auf den sieben geprüften Hauptseiten sowie repräsentativen geführten Lektionen in beiden Farbschemata. Auch die produktiven Routing-/PAT-Werkzeuge wurden geprüft. Das ist keine vollständige manuelle Barrierefreiheitszertifizierung.
- Produktions-HTML über einen lokalen HTTP-Server geladen, danach Netzwerk offline geschaltet: Trainer, Themewechsel, Begriffssuche, geführte Lektionen und interaktive Werkzeuge funktionieren weiter. Alle Schriften/Assets sind eingebettet; nur die HTML-Dokumente wurden angefordert. Fortschritt und die genaue Lektionsposition bleiben nach Reload erhalten. Keine beobachteten JavaScript-Laufzeitfehler.
- Direkte Navigation zu `file://` wurde durch die Richtlinie des Cloud-Browsers blockiert. Doppelklick-Öffnen auf einem eigenen Rechner ist deshalb hier nicht separat bestätigt. Bei restriktiven Schulgeräten kann die App mit `npm run preview` lokal über HTTP genutzt werden.
- `npm run format:check` und `git diff --check`: erfolgreich.

Nicht geprüft: Firefox/Safari, aktuelle Videoverfügbarkeit, Inhalt der nicht bereitgestellten 164 Originalseiten, Moodle-Integration oder ein öffentlicher Hostingbetrieb. GitHub Actions für Tests und eine getrennte Pages-Veröffentlichung sind eingerichtet; die Veröffentlichung selbst wurde hier nicht aktiviert oder verifiziert. die obigen Ergebnisse stammen aus dieser Umgebung, nicht aus einem unabhängig beobachteten Actions-Lauf.
