export const simulations = [
  {
    id: 'web',
    title: 'Eine Website öffnen',
    subtitle: 'Vom WLAN bis zur verschlüsselten Antwort.',
    steps: [
      [
        'WLAN verbinden',
        'Das Notebook meldet sich am Access Point an. Authentisierung und Verschlüsselung schützen den Funkzugang. Der AP verbindet das WLAN mit dem lokalen Netz.',
        'Notebook → Access Point → LAN',
      ],
      [
        'DHCP-Konfiguration',
        'Falls noch keine gültige Konfiguration vorhanden ist, erhält der Client IP, Maske, Gateway und DNS. Das passiert nicht bei jedem Webseitenaufruf neu.',
        '192.168.1.77/26 · Gateway .65 · DNS .70',
      ],
      [
        'DNS abfragen',
        'Bei fehlendem Cache fragt der Client seinen DNS-Resolver nach der Zieladresse. Auch zum lokalen DNS-Server kann zunächst eine ARP-Auflösung nötig sein.',
        'www.example.org → DNS → Webserver-IP',
      ],
      [
        'Lokales Ziel oder Gateway?',
        'IP und Maske ergeben das lokale Netz 192.168.1.64/26. Die externe Server-IP gehört nicht dazu: Das Paket geht an das Standardgateway.',
        'IP AND Maske → Ziel ausserhalb → Gateway',
      ],
      [
        'ARP und Switch',
        'Falls die Gateway-MAC unbekannt ist, fragt ARP auf dem lokalen Link danach. Der Switch stellt den Frame an das Gateway zu. Die Ziel-IP bleibt die des Webservers.',
        'Ziel-MAC: Gateway · Ziel-IP: Webserver',
      ],
      [
        'Routing und PAT',
        'Der Router wählt die längste passende Route. In diesem privaten IPv4-Beispiel übersetzt PAT Quelladresse und ggf. Port und merkt sich die Zuordnung.',
        '192.168.1.77:51000 → 203.0.113.5:40001',
      ],
      [
        'TCP, TLS und HTTP',
        'Im klassischen HTTPS-Fall wird TCP aufgebaut, TLS schützt die Verbindung und HTTP überträgt die Anfrage. HTTP/3 verwendet stattdessen QUIC über UDP.',
        'TCP: SYN → SYN-ACK → ACK · TLS · HTTP',
      ],
      [
        'Die Antwort kommt zurück',
        'Router und PAT-Tabelle führen die Antwort zurück zum Notebook. Rückrouten, Firewallregeln und die lokale Verbindung müssen funktionieren.',
        'Webserver → Router/PAT → Switch/AP → Notebook',
      ],
    ],
  },
  {
    id: 'dhcp',
    title: 'DHCP · DORA',
    subtitle: 'Wie ein Client seine Konfiguration erhält.',
    steps: [
      [
        'Discover',
        'Der Client sucht mit einem lokalen Broadcast nach DHCP-Servern. Ohne Relay bleibt die Suche im lokalen Netz.',
        'Client UDP 68 → Server UDP 67',
      ],
      [
        'Offer',
        'Ein Server bietet eine Konfiguration und Lease an. In abgestimmten Netzen können mehrere Server existieren.',
        'Angebot: 192.168.1.77/26 · Lease 8 h',
      ],
      [
        'Request',
        'Der Client fordert das ausgewählte Angebot an. Die anderen Server können erkennen, welches Angebot gewählt wurde.',
        'Client → DHCPREQUEST',
      ],
      [
        'ACK',
        'Der Server bestätigt die Zuweisung. Der Client übernimmt die Parameter. Eine normale Verlängerung beginnt standardmässig bei 50 % der Lease.',
        'IP + Maske + Gateway + DNS → einsatzbereit',
      ],
    ],
  },
  {
    id: 'dns',
    title: 'DNS · Namen auflösen',
    subtitle: 'Eine vereinfachte Auflösung ohne vorhandenen Cache.',
    steps: [
      [
        'Client fragt Resolver',
        'Der Client bittet den rekursiven Resolver um die endgültige Antwort für www.example.org. Bei einer passenden gültigen Cache-Antwort entfällt der weitere Weg.',
        'Client → Resolver: A www.example.org?',
      ],
      [
        'Root verweist auf TLD',
        'Der Resolver fragt einen Root-Server. Dieser nennt die zuständigen Server für .org, normalerweise nicht die fertige Website-Adresse.',
        'Root → Verweis auf .org',
      ],
      [
        'TLD verweist auf Zone',
        'Der Resolver fragt einen .org-Server. Dieser verweist auf die autoritativen Server für example.org.',
        'TLD .org → autoritativer Server',
      ],
      [
        'Autoritative Antwort',
        'Der zuständige Server liefert den angefragten Eintrag, falls vorhanden. Der Resolver speichert ihn gemäss TTL und antwortet dem Client.',
        'Autoritativ → Resolver → Client',
      ],
    ],
  },
  {
    id: 'routing',
    title: 'Routing · Den Weg wählen',
    subtitle: 'Zwei Router, ein Ziel und ein notwendiger Rückweg.',
    steps: [
      [
        'PC prüft das Ziel',
        'PC A mit 192.168.1.10/24 möchte 192.168.2.20 erreichen. Die Netzadresse des Ziels ist anders, also nutzt PC A sein lokales Gateway R1.',
        '192.168.1.0/24 → R1',
      ],
      [
        'R1 sucht passende Route',
        'Die Route 192.168.2.0/24 über 10.0.0.2 ist spezifischer als eine Default-Route. R1 sendet über G0/1 an R2.',
        'Zielnetz 192.168.2.0/24 · Next-Hop 10.0.0.2 · G0/1',
      ],
      [
        'R2 stellt lokal zu',
        'R2 ist direkt mit 192.168.2.0/24 verbunden. Es ermittelt bei Bedarf die lokale Ziel-MAC und sendet einen neuen Frame.',
        'R2 → lokales Netz → 192.168.2.20',
      ],
      [
        'Rückweg prüfen',
        'R2 benötigt für die Antwort eine Route nach 192.168.1.0/24 über 10.0.0.1. Ohne Rückroute funktioniert die Kommunikation trotz korrektem Hinweg nicht.',
        'R2 → 10.0.0.1 (R1) → PC A',
      ],
    ],
  },
  {
    id: 'nat',
    title: 'NAT/PAT · Übersetzen',
    subtitle: 'Zwei Clients teilen eine öffentliche Beispieladresse.',
    steps: [
      [
        'Zwei Verbindungen',
        'Zwei interne Rechner verwenden denselben Quellport. Ihre internen IP-Adressen unterscheiden sie zunächst.',
        '192.168.1.77:51000 · 192.168.1.78:51000',
      ],
      [
        'Quelladresse übersetzen',
        'Der Router ersetzt die private Quelladresse. Unterschiedliche externe Ports machen die Zuordnungen eindeutig. 203.0.113.5 ist eine Dokumentationsadresse.',
        '.77:51000 ↔ 203.0.113.5:40001 | .78:51000 ↔ 203.0.113.5:40002',
      ],
      [
        'Antwort zuordnen',
        'Die Antwort an Port 40002 passt zum zweiten Eintrag. Die Tabelle führt sie zu 192.168.1.78:51000 zurück.',
        'Antwort :40002 → interne .78:51000',
      ],
      [
        'Grenzen verstehen',
        'PAT ist weder Verschlüsselung noch ein Ersatz für Firewallregeln. Nach Ablauf einer Zuordnung kann alter Antwortverkehr nicht mehr so zugeordnet werden.',
        'Routing + Zustandstabelle + Firewall müssen passen',
      ],
    ],
  },
];
