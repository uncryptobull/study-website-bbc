# Die App öffnen und weitergeben

## Aktueller Zugang

Für die vorgesehene Schuladresse `https://uncryptobull.github.io/study-website-bbc/` wurde eine GitHub-Pages-404-Seite gemeldet. Verwende zum Lernen die fertige Datei unten. Der Dateidownload funktioniert unabhängig von GitHub Pages. Die Einrichtung der Website ist weiter unten beschrieben; teile ihre Adresse erst nach einer erfolgreichen Veröffentlichung und einem tatsächlichen Aufruf der App.

## Die fertige Datei direkt herunterladen

1. Öffne [Telematik-verstehen.html auf GitHub](https://github.com/uncryptobull/study-website-bbc/blob/main/Telematik-verstehen.html).
2. Wähle **Download raw file** (Download-Symbol rechts über der Datei).
3. Öffne die gespeicherte **Telematik-verstehen.html** aus deinem Download-Ordner mit Edge, Chrome oder Firefox.

Falls der GitHub-Knopf nicht funktioniert, verwende **[die direkte HTML-Datei](https://raw.githubusercontent.com/uncryptobull/study-website-bbc/main/Telematik-verstehen.html)**: Rechtsklick auf den Link → **Link speichern unter…**. Wenn du den Link normal öffnest, kann der Browser Programmcode anzeigen. Speichere ihn dann mit **Strg+S** als **Telematik-verstehen.html**; bei der Dateitypauswahl gegebenenfalls **Alle Dateien** wählen, damit nicht **.html.txt** angehängt wird. Öffne danach die gespeicherte lokale Datei.

Der direkte Dateilink verwendet `raw.githubusercontent.com` und benötigt kein GitHub Pages. Ein GitHub-Pages-404 ist ein Hinweis auf eine Website-Adresse; kontrolliere in diesem Fall, ob du die direkte Datei-Adresse oben verwendet hast.

Die Datei enthält Anwendung, Schriften und Lerninhalte. Zum Lernen brauchst du **kein Node.js, kein Terminal und keine Installation**. Externe Quellen und Videos benötigen Internet, die Lerninhalte selbst nicht.

## Das GitHub-ZIP verwenden

1. Im Repository **Code → Download ZIP** wählen.
2. Das ZIP speichern und vollständig entpacken: Rechtsklick → **Alle extrahieren**.
3. Im entpackten Projektordner **Telematik-verstehen.html** öffnen.

**Nicht die `index.html` im Hauptordner öffnen.** Sie gehört zum Quellcode und braucht einen Entwicklungsserver. Beim direkten Öffnen zeigt sie einen Hinweis mit einem Link zur fertigen HTML-Datei. Eine leere Seite kann entstehen, wenn eine alte Quellcodeversion ohne diesen Hinweis verwendet wird. Lade in diesem Fall die aktuelle **Telematik-verstehen.html** über den direkten Link oben herunter.

Wenn Windows das Entpacken verweigert, öffne per Rechtsklick auf das gespeicherte ZIP die **Eigenschaften**. Falls **Zulassen/Blockierung aufheben** angezeigt wird, aktiviere es und entpacke erneut. Alternativ umgehst du das ZIP vollständig mit dem Download der einzelnen HTML-Datei. Schul-/Arbeitsrichtlinien werden dadurch nicht geändert.

## Eine Offline-Kopie aus der Website speichern

Auf einer gehosteten Version findest du rechts oben **Offline-Datei**. Dieser Knopf speichert die gleiche Anwendung als einzelne HTML-Datei. Deine eingegebenen Antworten werden dabei nicht in die Datei kopiert. Lernfortschritt bleibt separat im Browserspeicher und lässt sich unter **Fortschritt & Sicherung** exportieren/importieren.

Datei-Downloads und lokale Datei-URLs können auf verwalteten Schul-/Arbeitsgeräten durch Richtlinien blockiert sein. Verwende in diesem Fall die veröffentlichte Website oder wende dich an die zuständige IT. Die Cloud-Testumgebung blockiert direkte Datei-URLs; die Einzeldatei wurde dort allein über HTTP geladen und ihr Start ohne weitere Assets geprüft. Ein nativer `file://`-Start ist dort nicht nachgewiesen.

## Eine Website mit GitHub Pages

Die Bereitstellung ist als Workflow **Publish study site** vorbereitet. Die App braucht auch online kein Backend und keine Anmeldung. Der Website-Link ist nicht allein durch das Speichern dieses Workflows aktiv.

Die geprüften bisherigen **Publish study site**-Läufe wurden als **skipped** angezeigt. Ein übersprungener Lauf veröffentlicht keine Website. Der Workflow wartet bei normalen Pushes darauf, dass GitHub Pages für das Repository als aktiviert gemeldet wird; ein Administrator kann ihn nach der Einrichtung manuell starten.

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
