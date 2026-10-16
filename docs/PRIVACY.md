# Datenschutz

## Was die App speichert

Die App hat keine Konten, kein Backend, keine Analyse- oder Werbedienste und keine extern geladenen Schriften. Lernfortschritt und Farbschema bleiben im `localStorage` des verwendeten Browsers. Freie Antworttexte werden nicht dauerhaft gespeichert. Eine Fortschrittssicherung enthält Themen, Frage-IDs, Ergebnisse und Zeitpunkte von Versuchen. Beim Import werden zusätzliche Felder ausserhalb des vorgesehenen Formats verworfen.

Die produktive HTML-Datei enthält eine Content Security Policy, die ausgehende Datenanfragen, eingebettete Websites und Formularübertragungen sperrt. Die App übermittelt keinen Referrer. Links auf Videos und Quellen werden erst nach einem Klick geöffnet; für diese Angebote gelten deren Datenschutzregeln. Die Entwicklungsversion erlaubt die für Vite nötige Verbindung zum lokalen Entwicklungsserver.

Die Offline-Datei enthält die Anwendung ohne den aktuell gerenderten Lernstand. Fortschrittsdateien sind persönliche Sicherungen und sollten nicht öffentlich hochgeladen werden. Auf gemeinsam genutzten Geräten können Personen mit demselben Browserprofil auf den gespeicherten Lernstand zugreifen. Unter **Fortschritt & Sicherung** lässt er sich zurücksetzen.

## Hosting und öffentliche Sichtbarkeit

Bei einer Website über GitHub Pages verarbeitet GitHub technische Verbindungsdaten, unter anderem IP-Adressen. Ohne Hostingaufruf lässt sich die heruntergeladene HTML-Datei lokal verwenden; externe Quellen bleiben optional.

Die Website bittet Suchmaschinen mit `noindex, nofollow, noarchive`, sie nicht zu indexieren. Das ist keine Zugriffssperre und verhindert weder Weitergabe noch Kopien. Ein öffentliches Repository, sein Kontoname, Issues und Commit-Metadaten bleiben öffentlich. Die GitHub-Pages-Adresse enthält den Kontonamen des Eigentümers.

Die Original-PDFs, privaten Nachrichten, Fortschrittssicherungen und Zugangsdaten gehören nicht in das Repository. `.env`-Dateien sind ausgeschlossen. Ein Quelltextreview und automatisierte Prüfungen können keine absolute Sicherheitsgarantie liefern.

## Bei künftigen Änderungen

- In den [GitHub-E-Mail-Einstellungen](https://github.com/settings/emails) **Keep my email addresses private** und **Block command line pushes that expose my email** aktivieren.
- Für Git den dort angezeigten No-Reply-Absender und einen öffentlichen Benutzernamen verwenden. Ein anderer Absender für neue Commits ändert ältere Commits nicht.
- Vor dem Push geänderte Dateien und Commit-Absender kontrollieren. Keine persönlichen Sicherungen, privaten Screenshots oder Zugangsdaten anhängen.
- Bereits öffentlich gewordene Informationen können in fremden Kopien oder Caches weiterbestehen. Ein bereinigter Branch allein entfernt keine alten Kopien; bei sensiblen Git-Daten kann zusätzlich die Hilfe von GitHub Support nötig sein.
