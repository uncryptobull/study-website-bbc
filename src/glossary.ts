export const glossary = [
  ['Netzwerk', 'Mehrere verbundene Geräte, die Daten austauschen können.'],
  [
    'Host',
    'Ein Gerät beziehungsweise eine Schnittstelle mit einer Adresse im Netzwerk, z. B. dein Notebook.',
  ],
  ['Bit', 'Die kleinste digitale Information: entweder 0 oder 1.'],
  ['Oktett', 'Eine Gruppe aus acht Bits. In IPv4 ist jede Zahl zwischen zwei Punkten ein Oktett.'],
  [
    'IP-Adresse',
    'Eine logische Adresse einer Netzwerkschnittstelle. IPv4 schreibt sie als vier Zahlen, z. B. 192.168.1.77.',
  ],
  [
    'MAC',
    'Eine Adresse für die Zustellung auf dem lokalen Link. Bei Ethernet/WLAN meist sechs Hexadezimalpaare.',
  ],
  ['Switch', 'Verbindet lokale Geräte und leitet Datenrahmen anhand ihrer Ziel-MAC weiter.'],
  ['Router', 'Leitet IP-Pakete zwischen verschiedenen Netzen weiter.'],
  [
    'Access Point',
    'Verbindet drahtlose Geräte mit dem lokalen Netzwerk. Ein reiner AP ist eine Bridge.',
  ],
  ['Netzmaske', 'Legt fest, welche Bits einer IPv4-Adresse zum Netz und welche zum Host gehören.'],
  ['Präfix', 'Die Anzahl der Netzbits. /24 bedeutet: 24 Netzbits von insgesamt 32 Bits.'],
  [
    'CIDR',
    'Die Schreibweise einer IP-Adresse oder eines Netzes mit Präfix, z. B. 192.168.1.77/26.',
  ],
  [
    'Netzadresse',
    'Die erste Adresse eines normalen IPv4-Subnetzes. Alle Hostbits sind 0. Sie bezeichnet das Netz.',
  ],
  [
    'Broadcast',
    'Eine Nachricht an alle Teilnehmer des lokalen Broadcastbereichs; bei IPv4 auch die Adresse mit allen Hostbits auf 1. /31-Punkt-zu-Punkt und /32 haben keinen Broadcast.',
  ],
  ['Subnetz', 'Ein kleineres IP-Netz, das aus einem grösseren Adressbereich gebildet wird.'],
  ['FLSM', 'Fixed Length Subnet Masking: ein Netz in gleich grosse Subnetze aufteilen.'],
  [
    'Gateway',
    'Der nächste Router, den ein Gerät für Ziele ausserhalb seines lokalen Netzes verwendet.',
  ],
  [
    'DNS',
    'Der Dienst, der zu Namen passende Einträge liefert, zum Beispiel eine IP-Adresse zu einem Websitenamen.',
  ],
  ['DHCP', 'Der Dienst, der Geräten automatisch eine IP-Konfiguration zuweist.'],
  ['Lease', 'Eine zeitlich begrenzte Zuweisung der IP-Konfiguration durch DHCP.'],
  [
    'Resolver',
    'Der DNS-Ansprechpartner, der die Antwort auf eine Namensabfrage beschafft oder aus seinem Cache liefert.',
  ],
  [
    'Cache',
    'Ein Zwischenspeicher für bereits bekannte Informationen. Seine Einträge sind nicht immer aktuell.',
  ],
  [
    'TTL',
    'Time To Live. Bei DNS die Gültigkeitsdauer im Cache; im IPv4-Paket dagegen ein Wert, der bei Routerdurchläufen sinkt.',
  ],
  [
    'Port',
    'Eine Nummer, die bei TCP oder UDP den Endpunkt beziehungsweise Dienst zuordnet. HTTPS verwendet üblicherweise 443.',
  ],
  [
    'TCP',
    'Ein Transportprotokoll für einen geordneten Bytestrom mit Wiederholungen bei Verlust. Es verschlüsselt nicht selbst.',
  ],
  [
    'UDP',
    'Ein Transportprotokoll für Datagramme, ohne eigene Garantie für Reihenfolge oder Zustellung.',
  ],
  ['TLS', 'Schützt eine Verbindung mit Verschlüsselung, Integritätsprüfung und Authentisierung.'],
  ['NAT', 'Adressübersetzung: ein Gerät schreibt Quell- oder Zieladressen um.'],
  [
    'PAT',
    'Adress- und Portübersetzung: mehrere interne Verbindungen können eine öffentliche IPv4-Adresse teilen.',
  ],
  ['ARP', 'Ermittelt zu einer IPv4-Adresse die MAC eines lokalen Nachbarn.'],
  ['VLAN', 'Ein logisch getrenntes Layer-2-Netz auf einer gemeinsamen Switch-Infrastruktur.'],
  ['Next-Hop', 'Der nächste erreichbare Nachbar, an den ein Router ein Paket weitergibt.'],
  [
    'Schnittstelle',
    'Der Anschluss beziehungsweise logische Netzwerkzugang eines Geräts, z. B. LAN oder WLAN.',
  ],
] as const;
