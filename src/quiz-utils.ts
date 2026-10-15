import type { Question } from './content';

const ipv4Pattern = /^(?:0|[1-9]\d{0,2})(?:\.(?:0|[1-9]\d{0,2})){3}$/;

function validIPv4(input: string): boolean {
  return ipv4Pattern.test(input) && input.split('.').every((part) => Number(part) <= 255);
}

/** Accept clear written answers without using permissive numeric coercion. */
export function answerFormatError(input: string, expected: string): string | null {
  const value = input.trim();
  if (!value) return 'Gib zuerst eine Antwort ein.';
  if (/^[01]{8}$/.test(expected)) {
    return /^(?:[01]{8}|[01]{4} [01]{4})$/.test(value)
      ? null
      : 'Gib genau acht Bits ein, z. B. 01001101. Vierergruppen mit einem Leerzeichen sind auch möglich.';
  }
  if (/^\d+$/.test(expected)) {
    return /^(?:0|[1-9]\d*)$/.test(value) && Number.isSafeInteger(Number(value))
      ? null
      : 'Gib eine ganze Zahl ohne Einheiten, Vorzeichen oder Dezimalstellen ein.';
  }
  if (ipv4Pattern.test(expected)) {
    return validIPv4(value)
      ? null
      : 'Gib vier Oktette von 0 bis 255 ein, z. B. 192.168.1.64. Keine führenden Nullen oder Präfixe.';
  }
  if (/^\d+\.\d+\.\d+\.\d+\/\d+$/.test(expected)) {
    const parts = value.split('/');
    return parts.length === 2 &&
      validIPv4(parts[0]) &&
      /^(?:0|[1-9]\d?)$/.test(parts[1]) &&
      Number(parts[1]) <= 32
      ? null
      : 'Gib eine IPv4-Adresse mit Präfix ein, z. B. 0.0.0.0/0.';
  }
  return null;
}

export function answerMatches(input: string, expected: string): boolean {
  if (answerFormatError(input, expected)) return false;
  const value = input.trim();
  if (/^[01]{8}$/.test(expected)) return value.replace(' ', '') === expected;
  return value.toLowerCase() === expected.trim().toLowerCase();
}

export function answerFormatHint(question: Question): string | null {
  if (question.choices || question.self) return null;
  if (/^[01]{8}$/.test(question.answer)) return 'Acht Bits, einschliesslich führender Nullen.';
  if (/^\d+$/.test(question.answer)) return 'Nur die ganze Zahl, ohne Einheit.';
  if (ipv4Pattern.test(question.answer)) return 'Vier Oktette mit Punkten, ohne /Präfix.';
  if (question.answer.includes('/')) return 'IPv4-Adresse und Präfix im Format Adresse/Präfix.';
  return 'Verwende das Namensschema aus dem Kurs.';
}

const nextHints: Record<string, string> = {
  'binary-1':
    'Die Einsen stehen ganz links. Addiere die ersten zwei Stellenwerte; alle Stellen mit 0 tragen nichts bei.',
  'binary-2':
    'Nach 64 bleiben 13. Prüfe nun der Reihe nach 32, 16, 8, 4, 2 und 1. Schreibe auch die Stellen auf, die nicht passen.',
  'binary-3':
    'Ein Bit hat zwei Zustände. Für acht unabhängige Bits multiplizierst du achtmal mit 2. Die 0 zählt als eigener Wert.',
  'binary-4': 'Zähle nach 9 weiter: A ist 10, B ist 11, C ist 12. Setze die Folge bis F fort.',
  'binary-5':
    'Ordne den drei linken Einsen die Werte 128, 64 und 32 zu. Addiere nur diese drei Werte.',
  'devices-1':
    'Ein Frame hat eine Quell- und eine Zieladresse auf Layer 2. Welche davon sagt dem Switch, wo der Frame hinmuss?',
  'devices-2':
    'Gesucht ist ein Gerät, das eine Routingtabelle verwendet. Eine Bridge bleibt innerhalb eines Layer-2-Netzes.',
  'devices-3':
    'Überlege, was zwischen einem WLAN-Notebook und dem kabelgebundenen LAN vermittelt. DNS und Verschlüsselung sind andere Aufgaben.',
  'devices-4':
    'Der Frame verrät dem Switch, welcher Absender gerade über welchen Anschluss erreichbar ist. Das Ziel muss er dadurch noch nicht kennen.',
  'devices-5':
    'Prüfe den Fall ohne passende Regel. Wird der Verkehr dann zugelassen oder blockiert?',
  'addressing-1':
    'Ein Oktett enthält acht Bits. Multipliziere das mit der Zahl der durch Punkte getrennten Oktette.',
  'addressing-2':
    'Eine Hexziffer entspricht vier Bits. Multipliziere acht Gruppen mit je vier Hexziffern und je vier Bits.',
  'addressing-3':
    'Ein Smartphone kann für verschiedene WLANs unterschiedliche private MACs verwenden. Passt das zu einer unveränderlichen Adresse?',
  'addressing-4':
    'Eine typische Ethernet-MAC besteht aus sechs Paaren mit Ziffern von 0 bis 9 und Buchstaben von A bis F.',
  'addressing-5':
    'Zwei Abkürzungen :: würden die fehlenden Gruppen uneindeutig verteilen. Gesucht ist eine zusammenhängende Folge ganzer Gruppen.',
  'ipv4-1':
    'Schreibe 24 Einsen und danach acht Nullen. Teile sie in vier Achtergruppen und wandle jede Gruppe in Dezimal um.',
  'ipv4-2':
    'Vergleiche jede Adresse mit 10/8, 172.16/12 und 192.168/16. Der automatisch gewählte Link-Local-Bereich steht separat.',
  'ipv4-3':
    'Zähle zunächst alle Adressen aus acht Hostbits. Reserviere dann eine Netzadresse und eine Broadcastadresse.',
  'ipv4-4':
    'Der /26-Block reicht von .64 bis .127. Streiche Netzadresse, Broadcast und alle Adressen ausserhalb dieses Blocks.',
  'ipv4-5':
    'IPv4 hat insgesamt 32 Bits. Der Präfix gibt an, wie viele davon den gemeinsamen Netzteil bilden.',
  'subnetting-1':
    'Die Grenzen im letzten Oktett sind 0, 64, 128 und 192. Suche die letzte Grenze, die nicht grösser als 77 ist.',
  'subnetting-2':
    'Bei /27 beträgt die Schrittweite 32. Finde den Block mit 182; sein Broadcast ist eine Adresse vor der nächsten Blockgrenze.',
  'subnetting-3':
    'Berechne zuerst 26 − 24. Jeder zusätzliche Netzbit verdoppelt die Anzahl gleich grosser Subnetze.',
  'subnetting-4':
    'Es bleibt ein Hostbit. Auf einem /31-Punkt-zu-Punkt-Link gibt es weder reservierte Netz- noch Broadcastadresse.',
  'subnetting-5':
    'Bei /20 sind die ersten zwei Oktette vollständig Netzteil. Das dritte hat 16er-Blöcke; finde den Block mit 34 und setze das letzte Oktett auf 0.',
  'plans-1':
    'Server verwenden den Buchstaben s. Die Nummerierung beginnt bei 1 und hat keine führende Null.',
  'plans-2':
    'Verwende das Kürzel sw. Die Nummerierung beginnt bei 1 und wird mit zwei Ziffern geschrieben.',
  'plans-3':
    'Stell dir vor, du suchst ein Gerät in einem Gebäude. Welche Angaben helfen dir, seinen Standort und seine Verbindung zu finden?',
  'plans-4':
    'Ein VLAN bildet ein eigenes logisches Netz. Welche zwei Angaben brauchst du, um die Adressgrenzen dieses Netzes zu erkennen?',
  'plans-5':
    'Verwende ge für Gigabit Ethernet. Bei Adaptern beginnt die Nummerierung bei 0, ohne führende Null.',
  'protocols-1':
    'Der Client sendet zuerst SYN. Der Server bestätigt und synchronisiert ebenfalls; zum Schluss bestätigt der Client.',
  'protocols-2':
    'Gesucht ist die Standardportnummer für HTTPS, unabhängig vom Quellport des Browsers. Sie besteht aus zwei Vieren und einer Drei.',
  'protocols-3':
    'Unterscheide Anwendungsdienste von Kontrollmeldungen wie Echo Request und Echo Reply. Kontrollmeldungen brauchen keine Transportports.',
  'protocols-4':
    'Bestätigungen und Wiederholungen schützen die Reihenfolge und Zustellung. Verbergen sie dadurch den Inhalt vor Mitlesenden?',
  'protocols-5':
    'NTP gleicht Uhren ab. Seine Standardportnummer besteht aus den ersten drei positiven Ziffern in aufsteigender Reihenfolge.',
  'dns-1':
    'Der Record A ist für IPv4. Für die grössere Adressfamilie wird derselbe Buchstabe mehrfach verwendet.',
  'dns-2':
    'Der DNS-Port ist bei TCP und UDP gleich. Seine Zehnerstelle ist 5, seine Einerstelle ist 3.',
  'dns-3':
    'Stell dir eine bereits gespeicherte Antwort vor. Die TTL bestimmt, wie lange der Resolver sie noch verwenden darf.',
  'dns-4':
    'Root und TLD geben typischerweise einen Verweis weiter. Gesucht ist der Server, der die Zone selbst verwaltet.',
  'dns-5':
    'Unterscheide Alias, Adress-Record und Mailzustellung. Der gesuchte Typname ist die Abkürzung von Mail Exchange.',
  'dhcp-1':
    'Übersetze die Schritte: suchen → anbieten → anfordern → bestätigen. Ordne die englischen Nachrichtennamen zu.',
  'dhcp-2':
    'Der Client verwendet UDP 68. Für den Server ist die unmittelbar kleinere Standardportnummer reserviert.',
  'dhcp-3': 'T1 liegt standardmässig bei 50 Prozent. Teile die acht Stunden durch zwei.',
  'dhcp-4':
    'Router leiten den ersten DHCP-Broadcast nicht gewöhnlich weiter. Das Relay vermittelt die Anfrage zum erreichbaren DHCP-Server.',
  'dhcp-5':
    'Im DORA-Ablauf fordert der Client eine Adresse an. Derselbe Nachrichtentyp wird auch zur Verlängerung verwendet.',
  'routing-1':
    'Vergleiche die Anzahl festgelegter Netzbits. Mehr passende Netzbits beschreiben ein kleineres und damit spezifischeres Zielnetz.',
  'routing-2':
    'Die Default-Route muss zu jeder IPv4-Adresse passen. Deshalb sind keine Netzbits festgelegt; notiere Adresse und Präfix.',
  'routing-3':
    'Der Ethernet-Frame bleibt auf dem lokalen Link. Welches lokal erreichbare Gerät übernimmt den nächsten Schritt zum entfernten Ziel?',
  'routing-4':
    'R1 muss die Route an einen benachbarten Router übergeben. Verwende die Adresse von R2 auf der gemeinsamen Verbindung.',
  'routing-5':
    'Prüfe, ob der entfernte Router das ursprüngliche Quellnetz kennt. Prüfe danach, ob eine Firewall Antworten auf dem Rückweg zulässt.',
  'wifi-1':
    '802.11ac entspricht Wi-Fi 5. Das 2,4-GHz-Band gehört zu anderen Standards; 6 GHz kam später dazu.',
  'wifi-2':
    '6E erweitert den verfügbaren Frequenzraum. Es verändert weder MAC-Adressen noch garantiert es höhere Reichweite.',
  'wifi-3':
    'Bei 20 MHz sollen sich die verwendeten Kanäle möglichst nicht überlappen. Benachbarte Kanalnummern reichen dafür nicht.',
  'wifi-4':
    'Die Maximalrate setzt ideale Bedingungen voraus. Überlege, was Störungen, Entfernung und geteilte Sendezeit daran ändern.',
  'wifi-5':
    'Im Infrastrukturmodus melden sich die Clients bei einem zentralen Funkzugang an. Direkte Verbindungen ohne AP sind eine andere Betriebsart.',
  'security-1':
    'Gesucht ist das alte Verfahren mit bekannten grundlegenden Schwächen, nicht die heutigen Personal- oder Enterprise-Verfahren.',
  'security-2':
    'Wenn eine Person den Betrieb verlässt, sollte nur ihr Zugang gesperrt werden. Bei welchem Verfahren ist das möglich?',
  'security-3':
    'Der Netzwerkname kann aus Funkverkehr ermittelt werden. Prüfe, ob sein Verstecken einen Schlüssel oder eine Anmeldung ersetzt.',
  'security-4':
    'Beschreibe zuerst, ob eine MAC sichtbar und veränderbar ist. Erkläre dann, weshalb ein Angreifer eine erlaubte Adresse nachahmen könnte.',
  'security-5':
    'Gesucht ist das Verfahren zur Anmeldung mit einem Passwort. Seine drei Buchstaben stehen für Simultaneous Authentication of Equals.',
  'nat-1':
    'Betrachte ein ausgehendes Paket. Source NAT übersetzt die Quelle, damit Antworten über die öffentliche Adresse zurückfinden.',
  'nat-2':
    'Ein Paket trifft an der öffentlichen Adresse ein und soll einen internen Dienst erreichen. Welcher Teil des Pakets wird dafür umgeschrieben?',
  'nat-3':
    'Die öffentliche IP kann gleich bleiben. Welche weitere Zahl im Transportheader lässt sich unterschiedlich zuordnen?',
  'nat-4':
    'Übersetzung ändert Adressen. Prüfe separat, ob sie auch Regeln über erlaubte Dienste, Benutzer oder Inhalte festlegt.',
  'nat-5':
    'Vergleiche den Adressvorrat aus 32 Bits mit dem aus 128 Bits. Erkläre, warum viele Geräte eine eigene globale Adresse erhalten können.',
  'tools-1':
    'Du möchtest einen Namen oder Record beim DNS-Server abfragen. Suche das Werkzeug für die Namensauflösung.',
  'tools-2':
    'Ein Stern bedeutet zunächst nur, dass keine Antwort auf die Probe kam. Überlege, ob Weiterleitung und Antworten auf Proben getrennt sind.',
  'tools-3':
    'ARP ordnet auf dem lokalen IPv4-Link eine IP einer MAC zu. Die Option -a zeigt die bereits bekannten Zuordnungen.',
  'tools-4':
    'Gesucht ist ein TCP-Verbindungsversuch zu einem bestimmten Zielport. Ping prüft ICMP und kann daher keinen TCP-Port wählen.',
  'tools-5':
    'Vergleiche, was beim Aufruf per Name zusätzlich passiert. Dieser Schritt findet vor der Verbindung zur bekannten IP statt.',
};

export function nextQuestionHint(question: Question): string {
  if (question.id.startsWith('generated:')) {
    const [, ip, prefix, kind] = question.id.split(':');
    const octets = ip.split('.');
    const p = Number(prefix);
    const varyingOctet = Math.floor(p / 8);
    const blockSize = 2 ** (8 - (p % 8));
    const before = octets.slice(0, varyingOctet).join('.');
    const remaining =
      varyingOctet < 3
        ? ` und setze die folgenden Oktette auf ${kind === 'network' ? '0' : '255'}`
        : '';
    return `Die ersten ${varyingOctet} Oktette (${before}) bleiben unverändert. Im ${varyingOctet + 1}. Oktett liegen die Grenzen ${blockSize} auseinander. Suche den Block mit ${octets[varyingOctet]}. ${kind === 'network' ? 'Nimm dessen Beginn' : 'Nimm dessen letzte Adresse'}${remaining}.`;
  }
  return nextHints[question.id] ?? question.hint;
}
