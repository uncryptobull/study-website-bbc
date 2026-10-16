# Die App öffnen und weitergeben

## Eine Datei, keine Installation

Die fertige Datei heisst **Telematik-verstehen.html**. Speichere sie und öffne sie mit Edge oder Chrome. Sie enthält die Anwendung, Schriften und Lerninhalte. Du brauchst weder Node.js noch eine ZIP-Extraktion.

Auf einer gehosteten Version findest du rechts oben **Offline-Datei**. Dieser Knopf speichert die gleiche Anwendung als einzelne HTML-Datei. Deine eingegebenen Antworten werden dabei nicht in die Datei kopiert. Lernfortschritt bleibt separat im Browserspeicher und lässt sich unter **Fortschritt & Sicherung** exportieren/importieren.

Datei-Downloads und lokale Datei-URLs können auf verwalteten Schul-/Arbeitsgeräten durch Richtlinien blockiert sein. Die Cloud-Testumgebung blockiert direkte Datei-URLs; die Einzeldatei wurde dort allein über HTTP geladen und ihr Start ohne weitere Assets geprüft. Für solche Geräte ist der gehostete Link der geeignete Zugang.

## Eine Website mit GitHub Pages

Die Bereitstellung ist als Workflow **Publish study site** vorbereitet. Die App braucht auch online kein Backend und keine Anmeldung. Der Website-Link ist nicht allein durch das Speichern dieses Workflows aktiv.

Ein Repository-Administrator muss einmal:

1. Im GitHub-Projekt **Settings → Pages** öffnen und bei **Source** die Option **GitHub Actions** wählen.
2. Unter **Actions → Publish study site → Run workflow** die Veröffentlichung starten.

Wenn der Lauf erfolgreich ist, zeigt GitHub im Deployment die tatsächliche Website-Adresse. Die vorgesehene Standardadresse ist `https://uncryptobull.github.io/study-website-bbc/`. Diese Adresse ist erst nach einer erfolgreichen Veröffentlichung nutzbar. Weitere Pushes auf `main` starten die Bereitstellung, wenn GitHub Pages im Repository-Ereignis als aktiviert gemeldet wird; alternativ kann derselbe Workflow jederzeit manuell gestartet werden.

GitHub Pages muss für das Repository und den verwendeten GitHub-Tarif verfügbar sein. Der Workflow ändert weder die Sichtbarkeit des Quellcode-Repositories noch Kontoeinstellungen. Die Arbeitssitzung kann Git-Code pushen, hat aber keine nachgewiesene Berechtigung, GitHub-Hosting-Einstellungen zu ändern. Es wurden keine zusätzlichen Zugangsdaten angefordert oder im Projekt gespeichert.

Öffentlicher Quellcode allein aktiviert Pages nicht. Die Standardadresse enthält den öffentlichen GitHub-Benutzernamen. Informationen über Commit-Absender, Browserspeicher und Verbindungsdaten beim Hosting stehen in [PRIVACY.md](PRIVACY.md).

## Den eigenen Lernstand übertragen

Beim Wechsel vom Website-Link zur lokalen Datei oder auf einen anderen Rechner kann der Browser einen getrennten Speicher verwenden:

1. Am bisherigen Ort **Fortschritt & Sicherung → Exportieren**.
2. Am neuen Ort **Fortschritt & Sicherung → Sicherung importieren**.

Bereits korrigierte Fehler werden beim Import einer älteren Sicherung nicht wieder geöffnet. Importierte Fragenversuche werden dedupliziert und für die Fehlerliste zählt die zeitlich neueste Antwort.
