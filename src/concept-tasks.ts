type ConceptTaskBase = {
  id: string;
  topic: string;
  title: string;
  prompt: string;
  explanation: string;
  hint: string;
};

export type ConceptTask = ConceptTaskBase &
  (
    | {
        kind: 'choice';
        options: { id: string; label: string; detail?: string }[];
        correct: string;
      }
    | {
        kind: 'order';
        items: { id: string; label: string }[];
        correctOrder: string[];
      }
    | { kind: 'match'; pairs: { id: string; left: string; right: string }[] }
    | { kind: 'bits'; target: number; initial?: number }
  );

export const conceptTasks: ConceptTask[] = [
  {
    id: 'binary-concept-build-77',
    topic: 'binary',
    kind: 'bits',
    title: 'Ein Oktett zusammensetzen',
    prompt: 'Schalte genau die Bits ein, deren Stellenwerte zusammen 77 ergeben.',
    target: 77,
    initial: 0,
    hint: 'Beginne links: 128 ist zu gross. 64 passt; danach fehlen noch 13.',
    explanation:
      '77 = 64 + 8 + 4 + 1. Nur diese vier Stellen stehen auf 1: 01001101. Die führende 0 zählt nicht zur Summe, gehört aber zur vollständigen Schreibweise mit acht Bits.',
  },
  {
    id: 'binary-concept-mask-192',
    topic: 'binary',
    kind: 'bits',
    title: 'Das letzte Masken-Oktett bauen',
    prompt:
      'Die Maske für /26 lautet 255.255.255.192. Baue ihr letztes Oktett: Schalte die Bits für den Dezimalwert 192 ein.',
    target: 192,
    initial: 0,
    hint: '24 Netzbits liegen in den ersten drei Oktetten. Im letzten Oktett kommen noch zwei Einsen von links dazu.',
    explanation:
      '192 = 128 + 64, also 11000000. Eine /26-Maske hat 26 zusammenhängende Netzbits: 24 in den ersten drei Oktetten und 2 im letzten. Die übrigen 6 Bits sind Hostbits; sie ermöglichen 64 Adressen pro Subnetz.',
  },
  {
    id: 'devices-concept-jobs',
    topic: 'devices',
    kind: 'match',
    title: 'Das passende Gerät einsetzen',
    prompt:
      'Für einen Schulungsraum werden vier Aufgaben verteilt. Ordne jeder Aufgabe das passende Gerät zu.',
    pairs: [
      {
        id: 'switch',
        left: 'Verbindet kabelgebundene Geräte im selben LAN.',
        right: 'Layer-2-Switch',
      },
      {
        id: 'router',
        left: 'Leitet Pakete zwischen verschiedenen IP-Netzen weiter.',
        right: 'Router',
      },
      {
        id: 'ap',
        left: 'Verbindet WLAN-Geräte als Funk-Brücke mit dem LAN.',
        right: 'Access Point',
      },
      {
        id: 'firewall',
        left: 'Erlaubt oder blockiert Verkehr nach festgelegten Regeln.',
        right: 'Firewall',
      },
    ],
    hint: 'Unterscheide lokale Verbindung, Verbindung zwischen Netzen, Funkzugang und Zugriffsregeln.',
    explanation:
      'Der Switch nutzt MAC-Adressen im lokalen Netz. Der Router entscheidet anhand der Ziel-IP über den Weg in ein anderes Netz. Der Access Point überbrückt Funk und LAN. Die Firewall prüft Regeln. Ein einzelnes Heimgerät kann mehrere dieser Aufgaben übernehmen.',
  },
  {
    id: 'devices-concept-reach-printer',
    topic: 'devices',
    kind: 'choice',
    title: 'Ein Druckauftrag im selben LAN',
    prompt:
      'PC und Drucker hängen am selben Switch, im selben VLAN und IP-Subnetz. Der Switch kennt die MAC-Adresse des Druckers. Wohin leitet er den Druckauftrag?',
    options: [
      { id: 'router', label: 'Zuerst immer zum Router.' },
      {
        id: 'printer-port',
        label: 'Zum Port des Druckers.',
        detail: 'Die bekannte Ziel-MAC bestimmt den lokalen Ausgang.',
      },
      { id: 'all-ports', label: 'Bei jedem Paket an alle Ports.' },
    ],
    correct: 'printer-port',
    hint: 'Ein Router wird erst für den Weg in ein anderes IP-Netz benötigt.',
    explanation:
      'Für eine bekannte Ziel-MAC sendet der Switch den Frame gezielt zum zugeordneten Port. Der Router ist für diese lokale Zustellung nicht nötig. Broadcasts und unbekannte Ziel-MACs behandelt ein Switch anders; sie werden im passenden VLAN verteilt.',
  },
  {
    id: 'addressing-concept-recognise',
    topic: 'addressing',
    kind: 'match',
    title: 'Adresskarten zuordnen',
    prompt: 'Erkenne an Schreibweise und Aufbau, welche Adressart auf jeder Karte steht.',
    pairs: [
      {
        id: 'ipv6',
        left: '2001:db8:0:1::10',
        right: 'IPv6: 128 Bits, Hex-Gruppen, :: kann Nullgruppen ersetzen.',
      },
      {
        id: 'mac',
        left: '02:1A:2B:3C:4D:5E',
        right: 'MAC: typischerweise 48 Bits in sechs Hex-Paaren.',
      },
      { id: 'ipv4', left: '192.168.1.77', right: 'IPv4: 32 Bits in vier Dezimal-Oktetten.' },
    ],
    hint: 'Punkte trennen die IPv4-Oktette. Doppelpunkte kommen bei MAC und IPv6 vor; vergleiche Anzahl und Form der Gruppen.',
    explanation:
      'IPv4 schreibt vier Werte von 0 bis 255. Eine typische Ethernet-MAC hat sechs Gruppen mit je zwei Hexziffern. IPv6 hat vollständig acht Gruppen mit je vier Hexziffern; :: kürzt einmalig ganze Nullgruppen. Die Schreibweise verrät die Adressart, aber nicht allein die Netzgrenze.',
  },
  {
    id: 'addressing-concept-next-hop',
    topic: 'addressing',
    kind: 'choice',
    title: 'Zwei Empfänger auf unterschiedlichen Ebenen',
    prompt:
      'Dein PC sendet ein IPv4-Paket zu einem Server in einem anderen Netz. Er schickt den ersten Ethernet-Frame zum Standardgateway. Welche Kombination ist richtig? Gehe von normalem Routing ohne NAT aus.',
    options: [
      { id: 'both-gateway', label: 'Ziel-IP und Ziel-MAC gehören zum Gateway.' },
      { id: 'both-server', label: 'Ziel-IP und Ziel-MAC gehören zum entfernten Server.' },
      { id: 'server-gateway', label: 'Ziel-IP: Server. Ziel-MAC: lokales Gateway.' },
    ],
    correct: 'server-gateway',
    hint: 'Die IP beschreibt das logische Ziel. Die MAC beschreibt den nächsten lokalen Empfänger.',
    explanation:
      'Das Paket soll bis zum Server gelangen, deshalb bleibt dessen IP das Ziel. Der erste Frame muss aber nur bis zum lokalen Router gelangen und trägt dessen MAC. Beim nächsten Ethernet-Abschnitt wird ein neuer Frame mit anderen MAC-Adressen gebildet.',
  },
  {
    id: 'ipv4-concept-address-drawers',
    topic: 'ipv4',
    kind: 'match',
    title: 'Adressen in die richtige Schublade legen',
    prompt:
      'Ordne jeder Adresse ihren Bereich zu. Privat, Link-Local und Loopback haben unterschiedliche Aufgaben.',
    pairs: [
      { id: 'private', left: '172.20.8.4', right: 'RFC-1918-Privatadresse' },
      { id: 'link-local', left: '169.254.8.4', right: 'IPv4-Link-Local-Adresse' },
      { id: 'loopback', left: '127.0.0.1', right: 'Loopback: das eigene Gerät' },
      { id: 'documentation', left: '203.0.113.8', right: 'Für Dokumentationsbeispiele reserviert' },
    ],
    hint: 'Der private 172er-Bereich reicht von 172.16.0.0 bis 172.31.255.255. Nicht jede besondere Adresse ist eine Privatadresse.',
    explanation:
      '172.20.8.4 liegt im privaten Bereich 172.16.0.0/12. 169.254.0.0/16 dient der lokalen Verbindung ohne routbare Konfiguration; 127.0.0.0/8 ist Loopback. 203.0.113.0/24 ist für Dokumentationsbeispiele reserviert. Link-Local bleibt auf dem lokalen Link; Loopback verweist auf das eigene Gerät.',
  },
  {
    id: 'ipv4-concept-local-or-gateway',
    topic: 'ipv4',
    kind: 'choice',
    title: 'Bleibt das Paket im Subnetz?',
    prompt:
      'Dein PC hat 192.168.1.77/26. Ein anderer PC hat ebenfalls /26. Welche Zieladresse liegt im selben Subnetz und ist eine nutzbare Hostadresse?',
    options: [
      { id: '192.168.1.127', label: '192.168.1.127' },
      { id: '192.168.1.130', label: '192.168.1.130' },
      { id: '192.168.1.100', label: '192.168.1.100' },
      { id: '192.168.1.64', label: '192.168.1.64' },
    ],
    correct: '192.168.1.100',
    hint: '/26 bildet Blöcke mit 64 Adressen. Die 77 liegt im Block von 64 bis 127; die beiden Grenzen sind reserviert.',
    explanation:
      '192.168.1.77/26 gehört zum Netz 192.168.1.64. Nutzbar sind .65 bis .126, also auch .100. Die .64 ist die Netzadresse, .127 der Broadcast. Die .130 liegt bereits im nächsten /26-Netz; die gleichen ersten drei Oktette reichen als Kriterium nicht aus.',
  },
  {
    id: 'subnetting-concept-quarter-network',
    topic: 'subnetting',
    kind: 'match',
    title: 'Ein /24 in vier Netze aufteilen',
    prompt:
      '192.168.1.0/24 wird in vier gleich grosse /26-Netze geteilt. Ordne jedem Teilnetz seinen nutzbaren Hostbereich zu.',
    pairs: [
      { id: 'block-0', left: '192.168.1.0/26', right: '192.168.1.1 bis 192.168.1.62' },
      { id: 'block-64', left: '192.168.1.64/26', right: '192.168.1.65 bis 192.168.1.126' },
      { id: 'block-128', left: '192.168.1.128/26', right: '192.168.1.129 bis 192.168.1.190' },
      { id: 'block-192', left: '192.168.1.192/26', right: '192.168.1.193 bis 192.168.1.254' },
    ],
    hint: 'Die Netzadressen springen in 64er-Schritten. Der erste Host ist jeweils Netz + 1; der letzte liegt eine Adresse vor dem Broadcast.',
    explanation:
      'Zwei zusätzliche Netzbits erzeugen 2² = 4 Teilnetze. Mit sechs verbleibenden Hostbits hat jedes 64 Adressen. Netzadresse und Broadcast sind in diesen /26-Netzen reserviert; pro Teilnetz bleiben 62 nutzbare Hosts. Die Broadcasts lauten .63, .127, .191 und .255.',
  },
  {
    id: 'subnetting-concept-room-for-50',
    topic: 'subnetting',
    kind: 'choice',
    title: 'Ein Netz für 50 Geräte planen',
    prompt:
      'Ein Schulungsraum braucht 50 nutzbare IPv4-Hostadressen, einschliesslich Gateway. Welches ist unter diesen Möglichkeiten das kleinste passende normale Broadcast-Subnetz?',
    options: [
      { id: '27', label: '/27', detail: '32 Adressen insgesamt' },
      { id: '25', label: '/25', detail: '128 Adressen insgesamt' },
      { id: '26', label: '/26', detail: '64 Adressen insgesamt' },
      { id: '28', label: '/28', detail: '16 Adressen insgesamt' },
    ],
    correct: '26',
    hint: 'Suche die kleinste Zweierpotenz, für die nach Abzug von Netzadresse und Broadcast mindestens 50 bleiben.',
    explanation:
      'Sechs Hostbits liefern 2⁶ − 2 = 62 nutzbare Adressen. Darum ist /26 passend: 32 − 6 = 26 Netzbits. /27 bietet nur 30 Hosts; /25 würde funktionieren, reserviert aber mehr Adressen als nötig. Bei /31 und /32 gelten andere Regeln, sie sind hier keine normalen Raum-LANs.',
  },
  {
    id: 'plans-concept-labels',
    topic: 'plans',
    kind: 'match',
    title: 'Einen Netzplan beschriften',
    prompt:
      'Im Kurs wird ein festes Namensschema verwendet. Ergänze die passende Beschriftung für jedes Element.',
    pairs: [
      { id: 'l2', left: 'Erster Layer-2-Switch', right: 'sw01' },
      { id: 'server', left: 'Erster Server', right: 's1' },
      { id: 'adapter', left: 'Erster Gigabit-Netzwerkadapter', right: 'ge0' },
      { id: 'l3', left: 'Erster Layer-3-Switch', right: 'l3sw01' },
    ],
    hint: 'sw steht für Switch; l3 ergänzt die Routing-Funktion. Die Nummerierung ist eine Kursvorgabe.',
    explanation:
      'Ein gleichmässiges Namensschema macht Geräte im Plan und in der Konfiguration wiedererkennbar. Hier gelten die Kursnamen s1, sw01, l3sw01 und ge0. Das ist kein weltweiter Standard. Für einen nutzbaren Plan brauchst du zusätzlich Funktionen, Verbindungen und Adressen mit Masken.',
  },
  {
    id: 'plans-concept-find-label-error',
    topic: 'plans',
    kind: 'choice',
    title: 'Den Fehler im Plan finden',
    prompt:
      'Im selben LAN stehen s1 mit 192.168.1.70/26 und das Gateway mit 192.168.1.65/26. Welche Beschriftung gehört an dieses IP-Netz?',
    options: [
      { id: '192.168.1.70/26', label: '192.168.1.70/26' },
      { id: '192.168.1.0/24', label: '192.168.1.0/24' },
      { id: '192.168.1.64/26', label: '192.168.1.64/26' },
    ],
    correct: '192.168.1.64/26',
    hint: 'Eine Netzbeschriftung beschreibt den gesamten Adressblock, nicht die Adresse eines einzelnen Geräts.',
    explanation:
      'Bei /26 beginnt der Block mit .64 und endet mit .127. Deshalb lautet die Netzadresse 192.168.1.64/26. Die .70 bezeichnet den Server. Eine /24-Beschriftung würde ein anderes, grösseres Netz behaupten und die tatsächliche Netzgrenze verbergen.',
  },
  {
    id: 'protocols-concept-service-ports',
    topic: 'protocols',
    kind: 'match',
    title: 'Verbindungen zum passenden Dienst legen',
    prompt: 'Ordne die typischen Zielports ihren Diensten zu. TCP und UDP gehören zur Angabe dazu.',
    pairs: [
      { id: 'https', left: 'Verschlüsselte Website über HTTPS mit TCP', right: 'TCP 443' },
      { id: 'ssh', left: 'SSH-Fernzugriff', right: 'TCP 22' },
      { id: 'dns', left: 'DNS-Namensauflösung', right: 'UDP oder TCP 53' },
      { id: 'ntp', left: 'NTP-Zeitsynchronisation', right: 'UDP 123' },
    ],
    hint: 'DNS ist nicht auf UDP beschränkt. Ein TCP-Port und ein UDP-Port mit derselben Zahl sind verschiedene Endpunkte.',
    explanation:
      'Ports ordnen Pakete einem Dienst oder Endpunkt zu. Die üblichen Zielports sind HTTPS TCP 443, SSH TCP 22, DNS UDP/TCP 53 und NTP UDP 123. Die Portnummer allein verschlüsselt nichts: Bei HTTPS übernimmt TLS den Schutz. HTTP/3 ist ein weiterer Fall und nutzt QUIC über UDP.',
  },
  {
    id: 'protocols-concept-tcp-handshake',
    topic: 'protocols',
    kind: 'order',
    title: 'Eine TCP-Verbindung aufbauen',
    prompt:
      'Bringe die drei Nachrichten des normalen TCP-Verbindungsaufbaus in die richtige Reihenfolge.',
    items: [
      { id: 'ack', label: 'Client → Server: ACK' },
      { id: 'syn', label: 'Client → Server: SYN' },
      { id: 'syn-ack', label: 'Server → Client: SYN-ACK' },
    ],
    correctOrder: ['syn', 'syn-ack', 'ack'],
    hint: 'Der Client eröffnet. Der Server bestätigt und eröffnet seine Seite. Der Client bestätigt zuletzt.',
    explanation:
      'SYN → SYN-ACK → ACK stimmt die Verbindung und die Startsequenznummern ab. Erst der abgeschlossene Aufbau ermöglicht den üblichen geordneten TCP-Datenstrom. Das ist noch keine Verschlüsselung; dafür braucht eine Anwendung beispielsweise TLS.',
  },
  {
    id: 'dns-concept-records',
    topic: 'dns',
    kind: 'match',
    title: 'Die richtige DNS-Karte wählen',
    prompt: 'Welche Art von DNS-Eintrag beantwortet die jeweilige Frage?',
    pairs: [
      { id: 'aaaa', left: 'Welche IPv6-Adresse gehört zum Namen?', right: 'AAAA' },
      { id: 'mx', left: 'Welcher Server nimmt E-Mails für die Domain an?', right: 'MX' },
      { id: 'a', left: 'Welche IPv4-Adresse gehört zum Namen?', right: 'A' },
      {
        id: 'ptr',
        left: 'Welcher Name gehört zur IP-Adresse bei der Rückwärtsauflösung?',
        right: 'PTR',
      },
    ],
    hint: 'A und AAAA sind Adress-Einträge. Rückwärtsauflösung ist eine eigene Abfrage; Mail benötigt einen anderen Eintrag.',
    explanation:
      'A enthält IPv4-Adressen, AAAA IPv6-Adressen. MX nennt Mailserver für eine Domain. PTR liefert in der passenden Reverse-Zone einen Namen zu einer Adresse. Ein A-Eintrag erzeugt nicht automatisch einen PTR-Eintrag; beide Richtungen müssen getrennt gepflegt werden.',
  },
  {
    id: 'dns-concept-no-cache',
    topic: 'dns',
    kind: 'order',
    title: 'Eine DNS-Antwort ohne Cache beschaffen',
    prompt:
      'Ein Resolver kennt noch keine Antwort für www.example.org. Ordne den vereinfachten Ablauf. Root und TLD geben dabei Verweise auf den nächsten zuständigen Server.',
    items: [
      {
        id: 'authoritative',
        label: 'Der Resolver fragt den autoritativen Server nach dem Eintrag.',
      },
      { id: 'root', label: 'Der Resolver fragt Root und erhält einen Verweis auf .org.' },
      {
        id: 'answer',
        label: 'Der Resolver gibt die Antwort an den Client und speichert sie gemäss TTL.',
      },
      {
        id: 'tld',
        label: 'Der Resolver fragt den .org-Server und erhält einen Verweis für example.org.',
      },
    ],
    correctOrder: ['root', 'tld', 'authoritative', 'answer'],
    hint: 'Die Suche beginnt allgemein und wird mit jedem Verweis spezifischer: Root → TLD → zuständige Zone.',
    explanation:
      'Ohne verwertbaren Cache folgt der Resolver der Hierarchie bis zum autoritativen Server. Root und TLD kennen normalerweise den nächsten zuständigen Server, nicht die fertige Website-IP. Die Antwort wird für ihre TTL zwischengespeichert; spätere Anfragen müssen deshalb nicht erneut alle Stationen durchlaufen.',
  },
  {
    id: 'dhcp-concept-dora',
    topic: 'dhcp',
    kind: 'order',
    title: 'Ein neuer PC erhält seine Konfiguration',
    prompt:
      'Der PC hat noch keine DHCP-Konfiguration. Ordne die vier Nachrichten der ersten Vergabe.',
    items: [
      { id: 'request', label: 'Request: Der Client fordert das ausgewählte Angebot an.' },
      { id: 'ack', label: 'ACK: Der Server bestätigt die Lease.' },
      { id: 'discover', label: 'Discover: Der Client sucht einen DHCP-Server.' },
      { id: 'offer', label: 'Offer: Ein Server bietet eine Konfiguration an.' },
    ],
    correctOrder: ['discover', 'offer', 'request', 'ack'],
    hint: 'Erst suchen, dann ein Angebot erhalten, eines auswählen und bestätigen lassen. Die Anfangsbuchstaben ergeben DORA.',
    explanation:
      'Discover sucht, Offer bietet an, Request fordert das gewählte Angebot und ACK bestätigt die Lease. Zum Paket gehören meist IP-Adresse, Maske, Gateway und DNS. Bei der späteren Verlängerung sind normalerweise nur Request und ACK nötig; die gesamte erste Suche wird nicht jedes Mal wiederholt.',
  },
  {
    id: 'dhcp-concept-remote-server',
    topic: 'dhcp',
    kind: 'choice',
    title: 'DHCP für einen zweiten Raum bereitstellen',
    prompt:
      'Der neue Raum hat ein eigenes IP-Subnetz. Der DHCP-Server steht in einem anderen Netz. Die ersten DHCP-Broadcasts bleiben lokal. Was ermöglicht die zentrale Vergabe über die Netzgrenze?',
    options: [
      {
        id: 'dns',
        label: 'Den DNS-Namen des DHCP-Servers auf dem noch unkonfigurierten PC eintragen.',
      },
      { id: 'relay', label: 'Ein DHCP-Relay für das Clientnetz konfigurieren.' },
      {
        id: 'new-server',
        label: 'Für jedes Subnetz ist zwingend ein eigener physischer DHCP-Server nötig.',
      },
    ],
    correct: 'relay',
    hint: 'Gesucht ist ein Vermittler, der lokale DHCP-Anfragen an den entfernten Server weitergibt.',
    explanation:
      'Ein DHCP-Relay vermittelt zwischen dem lokalen Clientnetz und dem entfernten DHCP-Server. Der Server benötigt dafür den passenden Adresspool; Routing und Regeln müssen den Verkehr erlauben. Ein normaler Router leitet den ursprünglichen lokalen Broadcast nicht einfach in alle anderen Netze weiter.',
  },
  {
    id: 'routing-concept-longest-prefix',
    topic: 'routing',
    kind: 'choice',
    title: 'Den passenden Weg auswählen',
    prompt:
      'Ziel ist 10.7.34.80. Die Tabelle enthält die unten stehenden drei erreichbaren Routen. Welche Route gewinnt nach dem längsten passenden Präfix?',
    options: [
      { id: '0.0.0.0/0', label: '0.0.0.0/0 → Router A' },
      { id: '10.7.32.0/20', label: '10.7.32.0/20 → Router B' },
      { id: '10.7.34.0/24', label: '10.7.34.0/24 → Router C' },
    ],
    correct: '10.7.34.0/24',
    hint: 'Alle drei passen zum Ziel. Vergleiche deshalb die Zahl hinter dem Schrägstrich: Mehr Netzbits bedeutet spezifischer.',
    explanation:
      '10.7.34.80 liegt im /24-Netz 10.7.34.0. Dieses ist spezifischer als das ebenfalls passende 10.7.32.0/20 und die Default-Route /0. Der Router wählt deshalb Router C. Die Reihenfolge der Zeilen ist nicht das Entscheidungskriterium.',
  },
  {
    id: 'routing-concept-table-fields',
    topic: 'routing',
    kind: 'match',
    title: 'Eine Routingtabelle lesen',
    prompt:
      'R1 hat die Route «192.168.2.0/24 via 10.0.0.2, Ausgang ge0». Ordne die Angaben ihrer Bedeutung zu.',
    pairs: [
      { id: 'next-hop', left: '10.0.0.2', right: 'Next-Hop: erreichbarer benachbarter Router' },
      { id: 'interface', left: 'ge0', right: 'Lokale Ausgangsschnittstelle von R1' },
      { id: 'destination', left: '192.168.2.0/24', right: 'Zielnetz, für das diese Route gilt' },
    ],
    hint: 'Der Next-Hop ist der nächste Nachbar, nicht die eigene Schnittstelle und nicht jeder einzelne Zielhost.',
    explanation:
      'Die Zielnetz-Spalte sagt, für welche Pakete die Route passt. Der Next-Hop nennt den nächsten erreichbaren Router. ge0 ist der lokale Ausgang. Auch das Zielnetz benötigt einen Rückweg zu R1s Quellnetz; ein korrekter Hinweg allein reicht für Antworten nicht aus.',
  },
  {
    id: 'wifi-concept-network-scales',
    topic: 'wifi',
    kind: 'match',
    title: 'Funkverbindungen einordnen',
    prompt: 'Drei Alltagssituationen nutzen unterschiedliche Arten von Funknetzen. Ordne sie zu.',
    pairs: [
      {
        id: 'wwan',
        left: 'Ein Smartphone nutzt unterwegs das Mobilfunknetz.',
        right: 'WWAN: weiträumiges Funknetz',
      },
      {
        id: 'wpan',
        left: 'Kopfhörer sind per Bluetooth mit dem Notebook verbunden.',
        right: 'WPAN: persönliches Netz auf kurze Distanz',
      },
      {
        id: 'wlan',
        left: 'Ein Notebook verbindet sich mit dem Access Point im Schulraum.',
        right: 'WLAN: lokales Funknetz',
      },
    ],
    hint: 'Achte auf den Zweck und die typische Reichweite: persönlich, lokal oder weiträumig.',
    explanation:
      'Bluetooth ist ein typisches WPAN, der Access Point stellt ein WLAN bereit und Mobilfunk ist ein WWAN. Das sind Kategorien von Netzen. Eine hohe Funkrate oder ein starkes WLAN-Signal garantiert noch keine schnelle Internetverbindung; die weiteren Verbindungen können begrenzen.',
  },
  {
    id: 'wifi-concept-slow-room',
    topic: 'wifi',
    kind: 'choice',
    title: 'Ein langsames WLAN untersuchen',
    prompt:
      'Im Klassenzimmer sind viele benachbarte 2,4-GHz-Netze sichtbar. Dein Notebook unterstützt 5 GHz und steht nahe am Access Point. Was ist der sinnvollste erste Vergleichstest?',
    options: [
      {
        id: 'maximum',
        label: 'Die beworbene maximale WLAN-Rate als garantierten Durchsatz übernehmen.',
      },
      {
        id: 'power',
        label: 'Die Sendeleistung aller Access Points ungeprüft auf das Maximum setzen.',
      },
      {
        id: 'compare-bands',
        label: 'Eine 5-GHz-Verbindung am gleichen Ort unter ähnlicher Last vergleichen.',
      },
    ],
    correct: 'compare-bands',
    hint: 'Ein kontrollierter Vergleich ändert möglichst nur einen Faktor. 5 GHz bietet häufig mehr geeignete Kanäle, reicht aber nicht in jeder Umgebung weiter.',
    explanation:
      'Der Vergleich zeigt, ob das stärker belegte 2,4-GHz-Band hier begrenzt. 5 GHz kann nahe am Access Point mehr Kapazität bieten. Entfernung, Wände, Kanalbreite und andere Nutzer bleiben relevant. Deshalb ist ein Test aussagekräftiger als eine pauschale Annahme aus der beworbenen Maximalrate.',
  },
  {
    id: 'security-concept-protection',
    topic: 'security',
    kind: 'match',
    title: 'Für jedes Risiko eine passende Massnahme',
    prompt: 'Ordne dem Risiko die Massnahme zu, die es direkt verringert.',
    pairs: [
      {
        id: 'guest',
        left: 'Gäste sollen nicht auf interne Schulserver zugreifen.',
        right: 'Gastnetz trennen und Zugriff mit Regeln begrenzen.',
      },
      {
        id: 'leaver',
        left: 'Der WLAN-Zugang einer einzelnen ausgetretenen Person soll gesperrt werden.',
        right: 'Individuelle Enterprise-Anmeldung mit 802.1X/EAP verwalten.',
      },
      {
        id: 'firmware',
        left: 'Im Access Point ist eine bekannte Softwarelücke vorhanden.',
        right: 'Geprüfte Firmware-Aktualisierung installieren.',
      },
      {
        id: 'credentials',
        left: 'Das Administrationskonto verwendet noch das Standardpasswort.',
        right: 'Ein eigenes starkes Administrationspasswort setzen.',
      },
    ],
    hint: 'Zugangsverwaltung, Netztrennung, Softwarepflege und Administrationsschutz lösen unterschiedliche Probleme.',
    explanation:
      'Ein starkes Passwort behebt keine Firmwarelücke, und ein Gastnetz ersetzt keine Anmeldung. Mehrere passende Massnahmen ergänzen sich. Bei individuellen Enterprise-Zugängen lässt sich eine Person gezielt sperren; bei einem gemeinsamen Personal-Passwort müsste das geteilte Geheimnis für alle betroffenen Geräte geändert werden.',
  },
  {
    id: 'security-concept-hidden-ssid',
    topic: 'security',
    kind: 'choice',
    title: 'Ein Sicherheitsversprechen prüfen',
    prompt:
      'Jemand schlägt vor: «Wir verstecken die SSID und erlauben nur bekannte MAC-Adressen. Dann brauchen wir keine sichere WLAN-Anmeldung.» Welche Entscheidung ist sinnvoll?',
    options: [
      { id: 'mac-only', label: 'Zustimmen: Eine MAC-Adresse lässt sich nicht nachahmen.' },
      {
        id: 'secure-auth',
        label:
          'Sichere Anmeldung und Verschlüsselung mit passend konfiguriertem WPA2-AES/CCMP oder WPA3 verwenden.',
      },
      { id: 'hide-only', label: 'Nur die SSID verstecken; dann bleibt das Funknetz unsichtbar.' },
    ],
    correct: 'secure-auth',
    hint: 'Eine SSID lässt sich ermitteln; eine erlaubte MAC lässt sich nachahmen. Beides schützt den Inhalt der Funkübertragung nicht.',
    explanation:
      'Versteckte SSIDs und MAC-Filter ersetzen weder sichere Authentisierung noch Verschlüsselung. WPA2 mit AES/CCMP oder WPA3 sind bei passenden Geräten und korrekter Konfiguration geeignete Verfahren. Ein starkes Geheimnis beziehungsweise eine sichere individuelle Anmeldung und aktuelle Firmware bleiben nötig.',
  },
  {
    id: 'nat-concept-return-packets',
    topic: 'nat',
    kind: 'match',
    title: 'Antwortpakete zum richtigen PC zurückschicken',
    prompt:
      'Lies die gespeicherten Zuordnungen (intern → extern): 192.168.1.77:51000 → 203.0.113.5:40001; 192.168.1.78:51000 → 203.0.113.5:40002; 192.168.1.79:52000 → 203.0.113.5:40003; 192.168.1.80:53000 → 203.0.113.5:40004. Alle Einträge nutzen dasselbe Transportprotokoll. Ordne das links angegebene öffentliche Ziel jedes Antwortpakets dem ursprünglichen internen Empfänger rechts zu.',
    pairs: [
      { id: 'pc-a', left: '203.0.113.5:40001', right: '192.168.1.77:51000' },
      { id: 'pc-b', left: '203.0.113.5:40002', right: '192.168.1.78:51000' },
      { id: 'pc-c', left: '203.0.113.5:40003', right: '192.168.1.79:52000' },
      { id: 'pc-d', left: '203.0.113.5:40004', right: '192.168.1.80:53000' },
    ],
    hint: 'Die öffentliche IP ist überall gleich. Der externe Port unterscheidet diese Zuordnungen; die Tabelle merkt sich die interne IP samt Port.',
    explanation:
      'PAT unterscheidet diese Verbindungen durch ihre externen Ports. Die beiden PCs .77 und .78 dürfen intern sogar denselben Quellport 51000 benutzen, weil ihre externen Zuordnungen verschieden sind. Die Zustandstabelle ermöglicht die Rückübersetzung; sie verschlüsselt die Daten nicht.',
  },
  {
    id: 'nat-concept-published-service',
    topic: 'nat',
    kind: 'choice',
    title: 'Eine Portweiterleitung verstehen',
    prompt:
      'Eine Regel übersetzt eingehend 203.0.113.5:8443 auf 192.168.1.70:443. Was wird bei diesem ersten eingehenden Paket geändert?',
    options: [
      { id: 'dnat', label: 'Ziel-IP und Zielport: DNAT beziehungsweise Portweiterleitung.' },
      { id: 'snat', label: 'Nur die Quell-IP: SNAT.' },
      { id: 'encrypt', label: 'Der Paketinhalt wird durch NAT verschlüsselt.' },
    ],
    correct: 'dnat',
    hint: 'Das Paket kommt für den öffentlichen Endpunkt an und soll an einen anderen internen Zielendpunkt weitergeleitet werden.',
    explanation:
      'Die Regel ändert das Ziel von der öffentlichen IP mit Port 8443 auf die interne IP mit Port 443. Das ist DNAT mit Portübersetzung. Routing, Firewallregeln und der lauschende Dienst müssen ebenfalls passen. NAT selbst liefert keine Verschlüsselung; beim HTTPS-Dienst übernimmt TLS diese Aufgabe.',
  },
  {
    id: 'tools-concept-diagnosis-order',
    topic: 'tools',
    kind: 'order',
    title: 'Eine Fehlersuche sinnvoll aufbauen',
    prompt:
      'Ein einzelner PC kann keine Website öffnen. Ordne diesen einfachen Prüfpfad von der lokalen Grundlage bis zur Anwendung. Es ist ein Startpunkt; konkrete Befunde können weitere Tests nötig machen.',
    items: [
      {
        id: 'names-service',
        label: 'DNS-Auflösung und anschliessend den benötigten Dienst testen.',
      },
      { id: 'config', label: 'IP, Maske, Gateway und DNS-Konfiguration prüfen.' },
      { id: 'link', label: 'Kabel beziehungsweise WLAN-Verbindung prüfen.' },
      {
        id: 'reachability',
        label: 'Erreichbarkeit über Gateway und zum bekannten Ziel eingrenzen.',
      },
    ],
    correctOrder: ['link', 'config', 'reachability', 'names-service'],
    hint: 'Ein DNS-Test hilft wenig, wenn bereits die lokale Verbindung fehlt. Arbeite von den Voraussetzungen zur Anwendung.',
    explanation:
      'Verbindung → Konfiguration → Erreichbarkeit → Namen und Dienst ist ein brauchbarer Startpfad. So kannst du Befunde aufeinander aufbauen. Ein fehlgeschlagener Ping beweist trotzdem keinen Ausfall, weil ICMP gefiltert sein kann. Prüfe bei Bedarf zusätzlich den tatsächlich benötigten Dienst, etwa TCP 443.',
  },
  {
    id: 'tools-concept-dns-evidence',
    topic: 'tools',
    kind: 'choice',
    title: 'Aus einem Befund den nächsten Test ableiten',
    prompt:
      'Ein bekanntes Ziel ist über seine IP erreichbar. Der Aufruf per Name scheitert. Welcher nächste Test prüft die naheliegende Vermutung gezielt?',
    options: [
      { id: 'restart', label: 'Alle Netzwerkgeräte sofort zurücksetzen.' },
      { id: 'nslookup', label: 'Mit nslookup die DNS-Antwort für den betroffenen Namen prüfen.' },
      { id: 'replace-cable', label: 'Ohne weitere Prüfung alle Kabel ersetzen.' },
    ],
    correct: 'nslookup',
    hint: 'Erreichbarkeit per IP und Namensauflösung sind unterschiedliche Aufgaben. Prüfe die fehlende Übersetzung separat.',
    explanation:
      'nslookup zeigt, ob der konfigurierte DNS-Server den Namen auflösen kann und welche Antwort er liefert. Eine erreichbare IP ist ein Hinweis auf funktionierende Netzverbindung, beweist aber noch keinen funktionierenden Webdienst. Ein gezielter Test liefert mehr Information als ein ungeplanter Reset.',
  },
];

export function findConceptTask(id: string): ConceptTask | undefined {
  return conceptTasks.find((task) => task.id === id);
}
