/**
 * Guided lessons based on Telematik-Lernskript.pdf, pages 2–16 and 20.
 * The original handouts were not supplied. Keep each step independently understandable:
 * explain the idea, show it, then let the learner try one small decision.
 */
export interface LessonStep {
  id: string;
  title: string;
  explanation: string[];
  example?: { title: string; lines: string[] };
  check?: { prompt: string; options: string[]; correct: number; explanation: string };
  visual?:
    | 'binary'
    | 'network-host'
    | 'subnet-blocks'
    | 'dora'
    | 'dns-path'
    | 'devices'
    | 'routing-path'
    | 'nat-table';
  takeaway?: string;
}

export const learningGroups = [
  {
    id: 'basics',
    title: 'Das Netzwerk kennenlernen',
    description:
      'Zuerst verstehst du die Geräte und ihre Adressen. Dafür musst du noch nichts rechnen.',
    topics: ['devices', 'addressing', 'binary'],
  },
  {
    id: 'ip',
    title: 'IP-Adressen verstehen und rechnen',
    description: 'Vom einfachen /24-Netz zur eigenen Subnetting-Rechnung – in kleinen Schritten.',
    topics: ['ipv4', 'subnetting'],
  },
  {
    id: 'services',
    title: 'Eine Website erreichen',
    description: 'Wie dein PC Einstellungen erhält, Namen nachschlägt und Daten ans Ziel bringt.',
    topics: ['protocols', 'dhcp', 'dns', 'routing', 'nat'],
  },
  {
    id: 'practice',
    title: 'Netze betreiben und Fehler finden',
    description: 'Funkverbindungen absichern, Netze dokumentieren und Probleme gezielt eingrenzen.',
    topics: ['wifi', 'security', 'plans', 'tools'],
  },
] as const;

export const learningSteps: Record<string, LessonStep[]> = {
  devices: [
    {
      id: 'devices-connection',
      title: 'Wie kommt dein PC ins Netzwerk?',
      explanation: [
        'Du möchtest vom Notebook eine Datei auf einem anderen PC öffnen. Dafür brauchen beide Geräte eine Verbindung zu einem gemeinsamen Netzwerk.',
        'Der Netzwerkadapter ist das Bauteil, das Daten sendet und empfängt. Die Abkürzung dafür ist NIC. Ein Adapter verbindet sich zum Beispiel über ein Kabel oder über WLAN, also Funk.',
        'Ein LAN ist ein lokales Netzwerk, etwa die verbundenen Geräte in deinem Büro. Ein vorhandener Adapter allein bedeutet noch nicht, dass die Verbindung funktioniert.',
      ],
      example: {
        title: 'Am Arbeitsplatz',
        lines: [
          'Notebook mit Kabel → Netzwerkadapter → Netzwerk im Büro.',
          'Notebook mit WLAN → WLAN-Adapter → Funkverbindung ins Netzwerk.',
        ],
      },
      check: {
        prompt: 'Welches Bauteil in deinem Notebook sendet Daten über das Netzwerkkabel?',
        options: ['Der Netzwerkadapter', 'Der Bildschirm', 'Der Browser-Verlauf'],
        correct: 0,
        explanation:
          'Der Netzwerkadapter stellt die Verbindung zum Übertragungsmedium her. Der Browser verwendet diese Verbindung; er ersetzt den Adapter nicht.',
      },
      takeaway: 'Der Netzwerkadapter ist der Zugang deines Geräts zum Netzwerk.',
    },
    {
      id: 'devices-switch',
      title: 'Ein Switch verbindet lokale Geräte',
      explanation: [
        'Ein Switch hat mehrere Anschlüsse, die Ports heissen. An ihnen hängen zum Beispiel dein PC, ein Drucker und ein Server.',
        'Jeder Netzwerkadapter hat eine lokale Geräteadresse: die MAC-Adresse. Der Switch lernt, über welchen Anschluss eine MAC erreichbar ist. Danach kann er Daten zum passenden Anschluss weiterleiten.',
        'Wenn er den Empfänger noch nicht kennt, verteilt er die Nachricht an die übrigen passenden Anschlüsse im selben lokalen Netz. Er schickt also nicht jede Nachricht grundsätzlich an alle.',
      ],
      example: {
        title: 'PC und Drucker',
        lines: [
          'PC an Anschluss 1, Drucker an Anschluss 3.',
          'Der Switch kennt die MAC des Druckers an Anschluss 3.',
          'Ein Druckauftrag vom PC wird gezielt an Anschluss 3 weitergeleitet.',
        ],
      },
      visual: 'devices',
      check: {
        prompt:
          'Der Switch kennt den Anschluss deines Druckers. Wohin leitet er die Nachricht an ihn?',
        options: ['Immer an jeden Anschluss', 'Zum Anschluss des Druckers', 'Zuerst ins Internet'],
        correct: 1,
        explanation:
          'Bei einer bekannten Ziel-MAC verwendet der Switch den passenden Anschluss. Ein lokaler Druckauftrag braucht dafür keinen Umweg durchs Internet.',
      },
      takeaway: 'Der Switch verbindet Geräte im lokalen Netz und orientiert sich an MAC-Adressen.',
    },
    {
      id: 'devices-access-point',
      title: 'Der Access Point bringt WLAN ins LAN',
      explanation: [
        'Ein Access Point ist der Funkzugang zum lokalen Netzwerk. Dein Notebook verbindet sich per WLAN mit ihm; der Access Point reicht die Daten ins kabelgebundene Netz weiter.',
        'Diese Verbindung zwischen Funk und Kabel heisst Bridge, auf Deutsch Brücke. Ein reiner Access Point verbindet damit zwei Übertragungsarten, ohne automatisch verschiedene IP-Netze zu verbinden.',
        'Ein Heimrouter enthält oft einen Access Point und weitere Funktionen im gleichen Gehäuse. Fürs Lernen unterscheidest du die Aufgaben trotzdem.',
      ],
      example: {
        title: 'Drucken über WLAN',
        lines: ['Notebook → WLAN → Access Point → Kabel → Switch → Drucker.'],
      },
      check: {
        prompt:
          'Was ergänzt du, damit ein Notebook per WLAN das vorhandene kabelgebundene Netz erreicht?',
        options: [
          'Einen Access Point',
          'Einen zusätzlichen Bildschirm',
          'Nur einen anderen Website-Namen',
        ],
        correct: 0,
        explanation:
          'Der Access Point stellt die Funkverbindung bereit und verbindet sie mit dem LAN. Ein DNS-Name oder ein Bildschirm kann keine Funkverbindung herstellen.',
      },
      takeaway: 'Access Point: eine Brücke zwischen WLAN und LAN.',
    },
    {
      id: 'devices-router',
      title: 'Ein Router verbindet verschiedene Netze',
      explanation: [
        'Dein Büro und das Internet sind unterschiedliche Netze. Ein Router leitet Daten von einem IP-Netz ins andere weiter. Eine IP-Adresse beschreibt dabei das logische Ziel.',
        'Der Router schaut in seine Routingtabelle: eine Liste von Zielnetzen und Wegen. Für ein Ziel wählt er den nächsten passenden Schritt.',
        'Ein Layer-3-Switch ist ein Switch mit zusätzlicher Routingfunktion. «Layer 3» bezeichnet hier die Ebene, auf der IP-Adressen und Routing verwendet werden.',
      ],
      example: {
        title: 'Lokal oder in einem anderen Netz?',
        lines: [
          'PC → Drucker im selben Netz: lokale Weiterleitung durch den Switch.',
          'PC → Server in einem anderen Netz: Router als Vermittler nötig.',
        ],
      },
      check: {
        prompt:
          'Dein PC soll einen Server in einem anderen IP-Netz erreichen. Welche Funktion brauchst du?',
        options: ['Nur ein längeres Kabel', 'Routing', 'Nur eine höhere Bildschirmauflösung'],
        correct: 1,
        explanation:
          'Routing verbindet verschiedene IP-Netze. Mehr Kabellänge ändert nicht, zu welchem logischen Netz ein Gerät gehört.',
      },
      takeaway: 'Switch: innerhalb eines lokalen Netzes. Router: zwischen IP-Netzen.',
    },
    {
      id: 'devices-firewall',
      title: 'Die Firewall prüft, was erlaubt ist',
      explanation: [
        'Eine Firewall lässt Datenverkehr nach festgelegten Regeln durch oder blockiert ihn. Ein möglicher Weg zum Ziel bedeutet also noch nicht, dass die Verbindung erlaubt ist.',
        'Bei «Default Deny» ist Verkehr zunächst verboten; nur ausdrücklich erlaubter Verkehr darf passieren. Bei «Default Allow» ist er erlaubt, solange keine Regel ihn verbietet.',
        'Eine Firewall kann auf einem einzelnen PC laufen oder zwischen Netzbereichen stehen. Sie ersetzt weder die Verkabelung noch die Routingfunktion.',
      ],
      example: {
        title: 'Eine kleine Regel',
        lines: [
          'Erlaube Zugriff auf den Webdienst.',
          'Blockiere sonstigen nicht ausdrücklich freigegebenen Verkehr.',
        ],
      },
      check: {
        prompt:
          'Eine Firewall verwendet Default Deny. Für deine Verbindung existiert keine Freigabe. Was passiert?',
        options: [
          'Sie wird trotzdem zugelassen',
          'Sie wird blockiert',
          'Die IP-Adresse verschwindet',
        ],
        correct: 1,
        explanation:
          'Default Deny verlangt eine ausdrückliche Freigabe. Die Firewall blockiert die Verbindung, verändert dadurch aber nicht automatisch deine IP-Adresse.',
      },
      takeaway: 'Router entscheiden über den Weg; Firewalls über die Erlaubnis.',
    },
  ],
  addressing: [
    {
      id: 'addressing-roles',
      title: 'Warum gibt es MAC und IP?',
      explanation: [
        'Beim Versenden brauchst du zwei Informationen: Wo liegt das endgültige Ziel? Und wer bekommt die Daten auf dem nächsten lokalen Abschnitt?',
        'Die IP-Adresse bezeichnet das logische Ziel. Die MAC-Adresse bezeichnet den lokalen Empfänger auf Ethernet oder WLAN. Ein Switch verwendet MAC-Adressen; ein Router verwendet IP-Adressen.',
        'Eine MAC-Adresse besteht typischerweise aus sechs Hexadezimalpaaren. Die Buchstaben dabei sind Ziffern eines anderen Zahlensystems; du lernst es in der nächsten Lektion.',
      ],
      example: {
        title: 'Eine Website ausserhalb deines LANs',
        lines: [
          'Ziel-IP: die Adresse des Webservers.',
          'Lokale Ziel-MAC: die Adresse deines nächsten Routers.',
          'Die MAC des entfernten Webservers brauchst du auf diesem lokalen Abschnitt nicht.',
        ],
      },
      check: {
        prompt: 'Du sendest ins Internet. Welches Ziel bezeichnet die Ziel-IP?',
        options: [
          'Immer nur deinen nächsten Router',
          'Den endgültigen Zielhost',
          'Den Anschluss am Switch',
        ],
        correct: 1,
        explanation:
          'Die Ziel-IP bezeichnet den entfernten Zielhost. Für die lokale Übergabe an den nächsten Router wird dessen MAC verwendet.',
      },
      takeaway: 'IP beschreibt das logische Ziel; MAC die lokale Übergabe.',
    },
    {
      id: 'addressing-ipv4',
      title: 'Eine IPv4-Adresse lesen',
      explanation: [
        'IPv4-Adressen sehen zum Beispiel so aus: 192.168.1.77. Es sind vier Zahlen, getrennt durch Punkte.',
        'Jede der vier Zahlen muss zwischen 0 und 255 liegen. Ein solcher Zahlenblock heisst Oktett, weil der Computer dafür acht Bits verwendet.',
        'Die Adresse alleine sagt noch nicht, welcher Teil das Netz bezeichnet. Dafür brauchst du zusätzlich die Netzmaske. Sie folgt in der IPv4-Lektion.',
      ],
      example: {
        title: 'Vier Zahlen prüfen',
        lines: [
          '192.168.1.77: vier Zahlen, alle von 0 bis 255 → gültiges IPv4-Format.',
          '192.168.1.300: die letzte Zahl ist zu gross → ungültiges Format.',
        ],
      },
      check: {
        prompt: 'Welche Adresse hat ein gültiges IPv4-Format?',
        options: ['192.168.1.300', '192.168.1.77', '192.168.77'],
        correct: 1,
        explanation:
          '192.168.1.77 enthält vier Zahlen von 0 bis 255. 300 ist zu gross; bei 192.168.77 fehlt ein Zahlenblock.',
      },
      takeaway: 'IPv4: vier Zahlen von 0 bis 255.',
    },
    {
      id: 'addressing-ipv6',
      title: 'IPv6 erkennen, ohne riesige Zahlen zu lernen',
      explanation: [
        'IPv6 ist eine weitere IP-Version mit einem viel grösseren Adressraum. Statt Punkten verwendet die Schreibweise Doppelpunkte und Hexadezimalziffern: 0 bis 9 und A bis F.',
        'Voll ausgeschrieben hat eine IPv6-Adresse acht Gruppen mit je vier Ziffern. Führende Nullen innerhalb einer Gruppe darfst du weglassen.',
        'Eine zusammenhängende Folge von Nullgruppen darf genau einmal durch :: ersetzt werden. Zweimal :: wäre mehrdeutig: Du wüsstest nicht, wie viele Nullen an welcher Stelle fehlen.',
      ],
      example: {
        title: 'Dieselbe Adresse, kürzer geschrieben',
        lines: [
          'Vollständig: 2001:0db8:0000:0001:0000:0000:0000:0010',
          'Kurz: 2001:db8:0:1::10',
          'IPv4 verwendet 32 Bits, IPv6 128 Bits.',
        ],
      },
      check: {
        prompt: 'Warum darf :: nur einmal in einer IPv6-Adresse stehen?',
        options: [
          'Sonst ist unklar, wie die fehlenden Nullgruppen verteilt sind',
          'Weil IPv6 nur zwei Gruppen hat',
          'Weil IPv6 keine Nullen erlaubt',
        ],
        correct: 0,
        explanation:
          'Ein einziges :: lässt sich eindeutig zur nötigen Anzahl Nullgruppen ergänzen. Bei zwei solchen Lücken wäre ihre Aufteilung unklar.',
      },
      takeaway: 'IPv6 hat acht Gruppen; :: kürzt einmalig ganze Nullgruppen ab.',
    },
    {
      id: 'addressing-interfaces',
      title: 'Adressen gehören zu Schnittstellen',
      explanation: [
        'Eine Schnittstelle ist ein Anschluss ans Netzwerk, etwa dein LAN-Adapter oder dein WLAN-Adapter. Ein Notebook mit beidem hat zwei verschiedene Netzwerkschnittstellen.',
        'Die IP-Konfiguration gehört zu einer solchen Schnittstelle. Eine Schnittstelle kann sogar mehrere IP-Adressen haben, zum Beispiel eine IPv4- und mehrere IPv6-Adressen.',
        'Auch eine MAC-Adresse ist nicht zwangsläufig unveränderlich: Software kann sie ändern. Viele Geräte verwenden im WLAN absichtlich wechselnde private MAC-Adressen.',
      ],
      example: {
        title: 'Ein Notebook, zwei Verbindungen',
        lines: [
          'LAN-Adapter: eigene MAC und IP-Konfiguration.',
          'WLAN-Adapter: andere MAC und eigene IP-Konfiguration.',
        ],
      },
      check: {
        prompt: 'Dein Notebook hat LAN und WLAN. Muss es immer genau eine IP-Adresse besitzen?',
        options: [
          'Ja, ein Gerät darf nur eine IP besitzen',
          'Nein, Adressen gehören zu den Schnittstellen',
          'Nein, weil MAC und IP dieselbe Adresse sind',
        ],
        correct: 1,
        explanation:
          'LAN und WLAN sind getrennte Schnittstellen mit eigenen Konfigurationen. Zudem kann eine einzelne Schnittstelle mehrere IP-Adressen verwenden.',
      },
      takeaway: 'Ein Gerät kann mehrere Schnittstellen und mehrere IP-Adressen haben.',
    },
  ],
  binary: [
    {
      id: 'binary-bits',
      title: 'Ein Bit hat nur zwei Zustände',
      explanation: [
        'Ein Bit ist eine einzelne Stelle mit dem Wert 0 oder 1. Stell dir dafür einen Schalter vor: aus oder an.',
        'Acht Bits zusammen ergeben ein Byte. Ein IPv4-Zahlenblock verwendet genau ein Byte und heisst deshalb auch Oktett.',
        'Die Zeichenfolge 01001101 besteht aus acht Bits. Sie ist eine Zahl in Binärschreibweise: Statt zehn Ziffern werden nur 0 und 1 verwendet.',
      ],
      example: {
        title: 'Von Stellen zu einer Zahl',
        lines: [
          'Ein Bit: 1',
          'Ein Byte: 01001101',
          'Eine IPv4-Adresse besteht aus vier solchen Bytes.',
        ],
      },
      check: {
        prompt: 'Wie viele Bits gehören zu einem Byte?',
        options: ['2', '4', '8'],
        correct: 2,
        explanation:
          'Ein Byte hat acht Bits. Ein einzelnes Bit kennt nur die beiden Zustände 0 und 1; acht Bits bilden gemeinsam eine grössere Zahl.',
      },
      takeaway: 'Ein Bit: 0 oder 1. Ein Byte: acht Bits.',
    },
    {
      id: 'binary-place-values',
      title: 'Jede Stelle hat einen eigenen Wert',
      explanation: [
        'Bei einer Binärzahl hat nicht jede 1 denselben Wert. Von links nach rechts sind die Werte eines Bytes: 128, 64, 32, 16, 8, 4, 2, 1.',
        'Eine 1 bedeutet: Zähle den Wert dieser Stelle mit. Eine 0 bedeutet: Lass diesen Wert weg. Addiere die mitgezählten Werte.',
        'Lies 10000000 also nicht als «zehn Millionen». In Binärschreibweise steht nur die Stelle mit dem Wert 128 auf 1.',
      ],
      example: {
        title: '11000000 ausrechnen',
        lines: [
          'Stellenwerte: 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1',
          'Bits:             1 |  1 |  0 |  0 | 0 | 0 | 0 | 0',
          'Nur die ersten zwei Stellen zählen: 128 + 64 = 192.',
        ],
      },
      check: {
        prompt:
          'Bei 00001000 ist nur die Stelle mit dem Wert 8 eingeschaltet. Welche Zahl ergibt das?',
        options: ['8', '1', '1000'],
        correct: 0,
        explanation:
          'Die eingeschaltete Stelle hat den Wert 8. Entscheidend ist die Position der 1, nicht nur die Anzahl der Einsen.',
      },
      takeaway: 'Addiere die Stellenwerte unter den Einsen.',
    },
    {
      id: 'binary-build-77',
      title: 'Eine normale Zahl in Bits zerlegen',
      explanation: [
        '«Dezimal» ist die gewöhnliche Zahlenschreibweise mit 0 bis 9. Um 77 binär zu schreiben, gehst du die Stellenwerte von links nach rechts durch.',
        'Passt ein Stellenwert in den Rest, setzt du dort eine 1 und ziehst ihn ab. Passt er nicht, setzt du eine 0.',
        'Behalte alle acht Stellen bei, auch die führende 0. So bleibt bei IPv4 klar, wo ein Oktett beginnt und endet.',
      ],
      example: {
        title: '77 Schritt für Schritt',
        lines: [
          '128 passt nicht → 0. 64 passt → 1; Rest 13.',
          '32 und 16 passen nicht → 0, 0. 8 passt → 1; Rest 5.',
          '4 passt → 1; Rest 1. 2 passt nicht → 0. 1 passt → 1.',
          'Ergebnis: 01001101. Kontrolle: 64 + 8 + 4 + 1 = 77.',
        ],
      },
      visual: 'binary',
      check: {
        prompt: 'Du wandelst 77 um und hast 64 abgezogen. Welcher Rest bleibt?',
        options: ['64', '13', '8'],
        correct: 1,
        explanation:
          '77 − 64 = 13. Mit diesem Rest prüfst du die nächsten Stellenwerte. 8 passt später hinein; danach bleiben 5.',
      },
      takeaway: 'Von gross nach klein prüfen, passende Werte abziehen, am Schluss kontrollieren.',
    },
    {
      id: 'binary-range',
      title: 'Warum ein IPv4-Block bei 255 endet',
      explanation: [
        'Wenn alle acht Bits auf 1 stehen, addierst du alle Stellenwerte: 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255.',
        'Wenn alle auf 0 stehen, ist der Wert 0. Ein Byte kann also die Werte von 0 bis 255 darstellen.',
        'Das sind 256 verschiedene Werte, weil die 0 mitzählt. «Grösster Wert» und «Anzahl der Werte» sind zwei verschiedene Fragen.',
      ],
      example: {
        title: 'Die beiden Enden',
        lines: [
          '00000000 → 0',
          '11111111 → 255',
          'Insgesamt: 2⁸ = 256 Kombinationen. 2⁸ bedeutet achtmal mit 2 multiplizieren.',
        ],
      },
      check: {
        prompt: 'Ein Byte stellt 0 bis 255 dar. Wie viele verschiedene Werte sind das?',
        options: ['255', '8', '256'],
        correct: 2,
        explanation:
          'Es sind 256 Werte: die 255 positiven Werte plus die 0. Acht ist die Anzahl Bits, nicht die Anzahl darstellbarer Zahlen.',
      },
      takeaway: 'Ein Byte hat 256 mögliche Werte; der grösste ist 255.',
    },
    {
      id: 'binary-hex',
      title: 'Hexadezimal ist eine kurze Schreibweise',
      explanation: [
        'Hexadezimal verwendet 16 Ziffern: 0 bis 9 und A bis F. Dabei steht A für 10, B für 11, C für 12, D für 13, E für 14 und F für 15.',
        'Eine Hexziffer ersetzt genau vier Bits. Zwei Hexziffern ergeben deshalb ein Byte. Diese Schreibweise begegnet dir bei MAC- und IPv6-Adressen.',
        'Die Hexzahl C0 liest du nicht als gewöhnliche Dezimalzahl: C ist eine Ziffer mit dem Wert 12 an der Sechzehnerstelle.',
      ],
      example: {
        title: 'C0 in Binär und Dezimal',
        lines: [
          'C → 1100, 0 → 0000.',
          'C0 → 11000000 → 128 + 64 = 192.',
          'Alternativ: 12 × 16 + 0 = 192.',
        ],
      },
      check: {
        prompt: 'Zwei Hexziffern, zum Beispiel C0, entsprechen wie vielen Bits?',
        options: ['2', '8', '16'],
        correct: 1,
        explanation:
          'Eine Hexziffer steht für vier Bits. Zwei Hexziffern ergeben 2 × 4 = 8 Bits, also ein Byte.',
      },
      takeaway: 'Vier Bits passen in eine Hexziffer; acht Bits in zwei.',
    },
  ],
  ipv4: [
    {
      id: 'ipv4-prefix',
      title: 'Die Maske trennt Netz und Gerät',
      explanation: [
        'Ein Host ist ein Gerät oder eine Schnittstelle im Netz. Eine IPv4-Adresse enthält einen Netzteil und einen Hostteil. Denk an Strasse und Hausnummer: Erst beides zusammen beschreibt die Adresse.',
        'Die Netzmaske legt fest, welche Bits zum Netz gehören. Die Kurzschreibweise /24 nennt man Präfix oder CIDR-Schreibweise. Sie bedeutet: 24 der 32 Bits sind Netzbits; 8 bleiben für den Host.',
        '/24 zählt also Bits – weder 24 Geräte noch 24 Dezimalzahlen. Bei /24 gehören die ersten drei vollständigen Oktette zum Netz.',
      ],
      example: {
        title: '192.168.1.77/24',
        lines: [
          'Netzteil: 192.168.1',
          'Hostteil: 77',
          '32 Bits insgesamt − 24 Netzbits = 8 Hostbits.',
        ],
      },
      visual: 'network-host',
      check: {
        prompt: 'Was sagt /24 bei einer IPv4-Adresse aus?',
        options: [
          'Im Netz dürfen genau 24 PCs stehen',
          '24 Bits gehören zum Netzteil',
          'Die letzte Zahl muss 24 sein',
        ],
        correct: 1,
        explanation:
          '/24 zählt 24 Netzbits. IPv4 hat 32 Bits, deshalb bleiben 8 Hostbits. Es ist keine direkte Geräteanzahl.',
      },
      takeaway: 'Die IP braucht eine Maske. Der Präfix zählt die Netzbits.',
    },
    {
      id: 'ipv4-mask',
      title: 'Zwei Schreibweisen für dieselbe Maske',
      explanation: [
        'In der binären Netzmaske stehen zuerst Einsen für den Netzteil und danach Nullen für den Hostteil.',
        'Bei /24 sind drei Bytes vollständig mit Einsen gefüllt. 11111111 ergibt 255. Das letzte Byte hat nur Nullen und ergibt 0.',
        'Darum sind /24 und 255.255.255.0 dieselbe Maske. Die Punkte sind nur die Grenzen der vier Bytes; die eigentliche Netzgrenze kann später auch innerhalb eines Bytes liegen.',
      ],
      example: {
        title: '/24 ausgeschrieben',
        lines: [
          'Binär: 11111111.11111111.11111111.00000000',
          'Dezimal: 255.255.255.0',
          'Erste 24 Bits: Netz. Letzte 8 Bits: Host.',
        ],
      },
      check: {
        prompt: 'Welche dezimale Netzmaske entspricht /24?',
        options: ['255.255.255.0', '24.24.24.24', '255.0.0.0'],
        correct: 0,
        explanation:
          '24 Einsen ergeben drei vollständige 255-Oktette; die übrigen acht Nullen ergeben 0. 255.0.0.0 hätte nur acht Netzbits und wäre /8.',
      },
      takeaway: 'In der Maske heisst 1 «Netz» und 0 «Host».',
    },
    {
      id: 'ipv4-boundaries',
      title: 'Netzadresse, Geräte und Broadcast',
      explanation: [
        'Die Netzadresse ist der Name des gesamten Netzes. Dafür werden alle Hostbits auf 0 gesetzt. Bei 192.168.1.77/24 wird daraus 192.168.1.0.',
        'Der Broadcast ist die Adresse für eine Nachricht an alle Teilnehmer dieses Netzes. Dafür werden alle Hostbits auf 1 gesetzt. Hier ergibt das 192.168.1.255.',
        'In einem gewöhnlichen Broadcast-Subnetz sind diese beiden Adressen für ihre besonderen Aufgaben reserviert. Geräteadressen liegen dazwischen. Ein Routeranschluss benötigt ebenfalls eine dieser Geräteadressen.',
      ],
      example: {
        title: 'Das Netz 192.168.1.0/24',
        lines: [
          'Netzadresse: 192.168.1.0',
          'Erster Host: 192.168.1.1',
          'Letzter Host: 192.168.1.254',
          'Broadcast: 192.168.1.255',
          '256 Adressen − 2 reservierte = 254 nutzbare Hostadressen.',
        ],
      },
      check: {
        prompt: 'Welche Adresse darf ein PC im gewöhnlichen Netz 192.168.1.0/24 erhalten?',
        options: ['192.168.1.0', '192.168.1.77', '192.168.1.255'],
        correct: 1,
        explanation:
          '.77 liegt im Hostbereich .1 bis .254. .0 bezeichnet hier das ganze Netz; .255 ist dessen Broadcast.',
      },
      takeaway: 'Im gewöhnlichen Subnetz liegen die Hosts zwischen Netzadresse und Broadcast.',
    },
    {
      id: 'ipv4-local',
      title: 'Im eigenen Netz oder über das Gateway?',
      explanation: [
        'Bevor dein PC sendet, prüft er mit seiner Maske, ob das Ziel im eigenen Netz liegt. Bei einer passenden lokalen Verbindung kann er es direkt erreichen.',
        'Liegt das Ziel ausserhalb, braucht er eine Route – meist über das Standardgateway. Das ist in einem üblichen LAN die lokale Adresse eines Routers.',
        'Vergleiche nie nur die ersten drei Zahlen, ohne die Maske zu prüfen. Diese Abkürzung gilt für /24, aber nicht für jedes Netz. Auch beide Geräte müssen eine zueinander passende Konfiguration haben.',
      ],
      example: {
        title: 'Dein PC: 192.168.1.77/24',
        lines: [
          'Ziel 192.168.1.100/24 → gleiches Netz 192.168.1.0/24.',
          'Ziel 192.168.2.100/24 → anderes Netz, Router nötig.',
          'Mit /16 auf beiden Geräten liegen .1.77 und .2.100 dagegen im selben Netz 192.168.0.0/16.',
        ],
      },
      check: {
        prompt:
          'Beide Geräte verwenden /24: 192.168.1.77 und 192.168.2.100. Brauchen sie einen Router dazwischen?',
        options: [
          'Ja, sie liegen in verschiedenen Netzen',
          'Nein, weil beide mit 192.168 beginnen',
          'Nein, weil die letzten Zahlen kleiner als 255 sind',
        ],
        correct: 0,
        explanation:
          'Mit /24 gehören die ersten drei Oktette zum Netz. 192.168.1 und 192.168.2 unterscheiden sich, deshalb ist Routing nötig.',
      },
      takeaway: 'Erst IP und Maske zusammen vergleichen, dann lokal oder Gateway wählen.',
    },
    {
      id: 'ipv4-private',
      title: 'Private Adressen sind für interne Netze',
      explanation: [
        'Private IPv4-Adressen dürfen verschiedene Schulen, Firmen oder Haushalte in ihren eigenen Netzen wiederverwenden. Sie werden im öffentlichen Internet nicht als weltweit erreichbare Adressen geroutet.',
        'Die drei privaten Vorräte sind 10.0.0.0/8, 172.16.0.0/12 und 192.168.0.0/16. Der mittlere reicht von 172.16.0.0 bis 172.31.255.255; nicht jede 172-Adresse ist privat.',
        'Ein privater Vorrat ist nicht die Maske deines konkreten LANs. Aus 192.168.0.0/16 kann deine Schule beispielsweise ein kleines 192.168.1.0/24-Netz verwenden. Zwischen privaten Firmennetzen kann ganz normal geroutet werden.',
      ],
      example: {
        title: 'Vorrat und konkretes Netz',
        lines: [
          'Privater Vorrat: 192.168.0.0/16.',
          'Dein PC: 192.168.1.77/24.',
          'Für deine Rechnung gilt das konfigurierte /24, nicht automatisch /16.',
        ],
      },
      check: {
        prompt:
          'Dein PC ist als 192.168.1.77/24 konfiguriert. Welche Maske verwendest du für sein lokales Netz?',
        options: [
          '/16, weil 192.168 privat ist',
          '/24, wie am PC konfiguriert',
          '/8 für alle privaten Adressen',
        ],
        correct: 1,
        explanation:
          'Die tatsächliche Konfiguration bestimmt das konkrete Netz. /16 beschreibt hier nur den gesamten privaten Adressvorrat.',
      },
      takeaway: 'Privater Adressvorrat und konfigurierte Netzmaske sind verschiedene Dinge.',
    },
    {
      id: 'ipv4-settings',
      title: 'Vier Einstellungen und zwei Sonderadressen',
      explanation: [
        'Für die typische PC-Konfiguration brauchst du eigene IP, Maske, Standardgateway und DNS-Server. DNS ist der Dienst, der Website-Namen in Adressen auflöst; du lernst ihn später genauer.',
        'Das Gateway muss im üblichen LAN direkt lokal erreichbar sein. Der DNS-Server darf auch in einem anderen erreichbaren Netz liegen. Ein Gateway endet nicht zwingend auf .1.',
        '127.0.0.1 ist Loopback: Dein PC spricht sich selbst an. Eine 169.254.x.x-Adresse ist Link-Local und kann bei Windows auf fehlende automatische Konfiguration hinweisen. Beide gehören nicht zu den drei privaten Adressvorräten.',
      ],
      example: {
        title: 'Eine passende Konfiguration',
        lines: [
          'IP 192.168.1.77, Maske /24.',
          'Gateway 192.168.1.1 → Router für andere Netze.',
          'DNS 192.168.1.70 → Namensauflösung.',
          '127.0.0.1 prüfen testet den eigenen PC, nicht den Weg zum Router.',
        ],
      },
      check: {
        prompt:
          'Dein PC antwortet auf 127.0.0.1. Ist damit die Kabelverbindung zum Router bewiesen?',
        options: [
          'Ja, jede Ping-Antwort beweist das',
          'Nein, diese Adresse bleibt auf dem eigenen PC',
          'Ja, 127.0.0.1 ist immer das Gateway',
        ],
        correct: 1,
        explanation:
          'Loopback bleibt im eigenen Rechner. Eine funktionierende Kabelverbindung oder die Erreichbarkeit des Routers musst du separat prüfen.',
      },
      takeaway: 'IP: ich. Maske: mein Netz. Gateway: andere Netze. DNS: Namen.',
    },
  ],
  subnetting: [
    {
      id: 'subnetting-size',
      title: 'Ein längerer Präfix macht das Netz kleiner',
      explanation: [
        'Subnetting bedeutet: einen Adressbereich in kleinere Netze aufteilen. Du verwendest dafür mehr Bits für den Netzteil und lässt weniger Bits für die Hosts übrig.',
        'Wir rechnen mit 192.168.1.77/26. Von 32 Bits gehören 26 zum Netz; 32 − 26 = 6 Hostbits bleiben. Sechs Bits ergeben 2⁶ = 64 Adressen.',
        'Die ersten 24 Netzbits füllen drei Oktette. Im letzten Oktett kommen zwei Einsen dazu: 11000000 = 128 + 64 = 192. Die Maske lautet also 255.255.255.192.',
      ],
      example: {
        title: 'Von /24 zu /26',
        lines: [
          '/24: 8 Hostbits → 256 Adressen.',
          '/25: 7 Hostbits → 128 Adressen.',
          '/26: 6 Hostbits → 64 Adressen.',
          'Jedes zusätzliche Netzbit halbiert die Anzahl Adressen pro Netz.',
        ],
      },
      check: {
        prompt:
          'Du erhöhst den Präfix von /24 auf /26. Werden die einzelnen Netze grösser oder kleiner?',
        options: [
          'Grösser, weil 26 grösser ist',
          'Kleiner, weil weniger Hostbits bleiben',
          'Die Grösse bleibt gleich',
        ],
        correct: 1,
        explanation:
          '/26 reserviert zwei zusätzliche Bits fürs Netz. Die Hostbits sinken von 8 auf 6, deshalb sinkt die Netzgrösse von 256 auf 64 Adressen.',
      },
      takeaway: '32 − Präfix = Hostbits. 2 hoch Hostbits = Adressen pro Netz.',
    },
    {
      id: 'subnetting-block',
      title: 'Finde den Block, in dem 77 liegt',
      explanation: [
        'Ein /26-Netz hat 64 Adressen. Im letzten Oktett passen daher vier gleich grosse Blöcke: 0–63, 64–127, 128–191 und 192–255.',
        'Die Zahl 77 liegt im zweiten Block, also von 64 bis 127. Dessen erste Adresse ist die Netzadresse; die letzte ist der Broadcast.',
        'Merke dir nicht einfach «ein Netz beginnt bei .0». Berechne die Blockgrösse und suche den passenden Block. Bei /26 kann ein Netz auch bei .64, .128 oder .192 beginnen.',
      ],
      example: {
        title: '192.168.1.77/26 einordnen',
        lines: [
          'Blockgrösse: 64.',
          '77 liegt zwischen 64 und 127.',
          'Netzadresse: 192.168.1.64.',
          'Broadcast: 192.168.1.127.',
        ],
      },
      visual: 'subnet-blocks',
      check: {
        prompt: 'In welchem /26-Block liegt die letzte Zahl 77?',
        options: ['0–63', '64–127', '128–191'],
        correct: 1,
        explanation:
          '77 ist mindestens 64 und kleiner als 128. Sie liegt deshalb im Block 64–127; der nächste Block beginnt erst bei 128.',
      },
      takeaway:
        'Erst die Blockgrösse berechnen, dann die Adresse in den passenden Block einordnen.',
    },
    {
      id: 'subnetting-bits',
      title: 'Warum .64 das Netz und .127 der Broadcast ist',
      explanation: [
        'Im letzten Oktett der /26-Maske gehören zwei Bits zum Netz und sechs zum Host. 77 lautet binär 01|001101; der Strich zeigt diese Grenze.',
        'Für die Netzadresse behältst du die zwei Netzbits 01 und setzt die sechs Hostbits auf 0. Das ergibt 01|000000 = 64. Diese Berechnung heisst IP AND Maske: Nur 1 mit 1 ergibt 1.',
        'Für den Broadcast setzt du stattdessen alle Hostbits auf 1: 01|111111 = 127. Die nutzbaren Hosts liegen dazwischen: .65 bis .126.',
      ],
      example: {
        title: 'Die Hostbits ändern, die Netzbits behalten',
        lines: [
          'IP:        01|001101 → 77',
          'Maske:     11|000000 → 192',
          'IP AND Maske: 01|000000 → 64',
          'Broadcast: 01|111111 → 127',
          '64 Adressen − Netzadresse − Broadcast = 62 nutzbare Hosts.',
        ],
      },
      check: {
        prompt: 'Welche Adresse ist ein nutzbarer Host in 192.168.1.64/26?',
        options: ['192.168.1.64', '192.168.1.126', '192.168.1.127'],
        correct: 1,
        explanation:
          'Die Hosts reichen von .65 bis .126. .64 ist die Netzadresse und .127 der Broadcast; beide sind hier reserviert.',
      },
      takeaway: 'Netz: Hostbits 0. Broadcast: Hostbits 1. Hosts: die Adressen dazwischen.',
    },
    {
      id: 'subnetting-flsm',
      title: 'Ein Netz gleichmässig aufteilen',
      explanation: [
        'FLSM bedeutet, dass alle neuen Subnetze gleich gross sind und dieselbe Maske haben. Aus einem /24 kannst du zum Beispiel vier /26-Netze machen.',
        'Du ergänzt zwei Netzbits: 26 − 24 = 2. Zwei Bits haben vier Kombinationen, also 2² = 4 Subnetze. Bei /27 wären es drei zusätzliche Bits und acht Subnetze.',
        'Wähle die Grösse nach der benötigten Hostanzahl. Für 50 Hosts reicht /27 mit 30 nutzbaren Adressen nicht; /26 mit 62 reicht. Zähle Routeranschlüsse und Reserven mit.',
      ],
      example: {
        title: '192.168.1.0/24 in vier /26-Netze',
        lines: [
          '192.168.1.0/26 → Hosts .1–.62',
          '192.168.1.64/26 → Hosts .65–.126',
          '192.168.1.128/26 → Hosts .129–.190',
          '192.168.1.192/26 → Hosts .193–.254',
          '/27, /28, /29, /30 bieten 30, 14, 6, 2 nutzbare Hosts.',
        ],
      },
      check: {
        prompt: 'Du brauchst mindestens 50 nutzbare Adressen je Subnetz. Welche Grösse reicht?',
        options: ['/27 mit 30 Hosts', '/26 mit 62 Hosts', '/28 mit 14 Hosts'],
        correct: 1,
        explanation:
          '/26 hat sechs Hostbits: 2⁶ − 2 = 62. /27 hat nur 30 und /28 nur 14 nutzbare Adressen; beide reichen für 50 nicht.',
      },
      takeaway:
        'FLSM: gleiche Maske für alle Teilnetze. Grösse nach dem tatsächlichen Bedarf wählen.',
    },
    {
      id: 'subnetting-20',
      title: 'Bei /20 liegt die Grenze im dritten Oktett',
      explanation: [
        'Bisher lag die Netzgrenze im letzten Oktett. Bei /20 sind zuerst zwei vollständige Oktette Netzbits, dann vier Bits im dritten Oktett. Die Maske lautet 255.255.240.0.',
        'Im dritten Oktett ist die Schrittweite 256 − 240 = 16. Die Blöcke beginnen bei 0, 16, 32, 48 und so weiter. Das dritte Oktett 34 gehört zum Block 32–47.',
        'Das vierte Oktett besteht vollständig aus Hostbits: Für das Netz setzt du es auf 0, für den Broadcast auf 255. Rechne deshalb nicht automatisch nur an der letzten Zahl.',
      ],
      example: {
        title: '10.7.34.80/20',
        lines: [
          'Drittes Oktett 34 → Block 32–47.',
          'Netz: 10.7.32.0. Broadcast: 10.7.47.255.',
          'Hosts: 10.7.32.1 bis 10.7.47.254.',
          '12 Hostbits → 2¹² = 4096 Adressen → 4094 nutzbare Hosts.',
        ],
      },
      check: {
        prompt: 'Welche Netzadresse gehört zu 10.7.34.80/20?',
        options: ['10.7.34.0', '10.7.32.0', '10.7.0.0'],
        correct: 1,
        explanation:
          'Die /20-Grenze liegt im dritten Oktett. 34 liegt im 16er-Block ab 32. Die Hostbits werden 0, also ergibt sich 10.7.32.0.',
      },
      takeaway:
        'Prüfe, in welchem Oktett die Grenze liegt. Nicht jede Aufgabe wird im letzten Oktett gelöst.',
    },
    {
      id: 'subnetting-special',
      title: '/31 und /32 sind Sonderfälle',
      explanation: [
        'Die Formel «alle Adressen minus zwei» gilt für gewöhnliche Broadcast-Subnetze. Wende sie nicht blind auf jeden Präfix an.',
        'Ein /31 kann eine Punkt-zu-Punkt-Verbindung mit genau zwei Endpunkten beschreiben. Beide Adressen sind dort nutzbar; es gibt keinen Broadcast wie im normalen LAN.',
        'Ein /32 beschreibt genau eine einzelne IPv4-Adresse, etwa als Route zu einem bestimmten Host. Es ist kein gewöhnliches LAN mit einem zusätzlichen Hostbereich.',
      ],
      example: {
        title: 'Zwei unterschiedliche Sonderfälle',
        lines: [
          '/31: 10.0.0.0 und 10.0.0.1 können die zwei Endpunkte einer passenden Verbindung sein.',
          '/32: 192.168.1.77/32 bezeichnet genau 192.168.1.77.',
          'Ein normales Büro-LAN planst du mit den gewöhnlichen Subnetzregeln.',
        ],
      },
      check: {
        prompt: 'Wie viele nutzbare Endpunkte hat eine passende /31-Punkt-zu-Punkt-Verbindung?',
        options: ['0, weil immer zwei abgezogen werden', '2', '254'],
        correct: 1,
        explanation:
          'Bei diesem /31-Sonderfall sind beide Adressen nutzbar. Die gewöhnliche Reservierung von Netzadresse und Broadcast wird hier nicht angewendet.',
      },
      takeaway: 'Erst den Anwendungsfall prüfen; bei /31 und /32 nicht blind minus zwei rechnen.',
    },
  ],
  plans: [
    {
      id: 'plans-purpose',
      title: 'Welche Frage soll dein Netzplan beantworten?',
      explanation: [
        'Ein Netzplan stellt Geräte und Verbindungen übersichtlich dar. Ein schematischer Plan zeigt, welche Geräte und Netze wie zusammenhängen.',
        'Ein geographischer Plan zeigt dagegen, wo sie stehen: etwa in welchem Gebäude oder Raum. Damit kannst du einen Standort für die Kabelprüfung finden.',
        'Ein Plan muss nicht beides gleichzeitig leisten. Wähle die Darstellung passend zur Frage und halte Verbindungen möglichst gerade und ohne unnötige Kreuzungen.',
      ],
      example: {
        title: 'Zwei Aufgaben, zwei Sichtweisen',
        lines: [
          '«Über welchen Router kommt der Server ins Internet?» → schematischer Plan.',
          '«In welchem Raum finde ich sw01?» → geographischer Plan.',
        ],
      },
      check: {
        prompt: 'Du suchst den Raum, in dem ein Switch steht. Welcher Plan hilft dafür direkt?',
        options: [
          'Ein geographischer Netzplan',
          'Nur eine Liste von TCP-Ports',
          'Ein Binärzahlenblatt',
        ],
        correct: 0,
        explanation:
          'Der geographische Plan zeigt den Standort. Die logische Weiterleitung im Netzwerk zeigt dagegen der schematische Plan.',
      },
      takeaway: 'Schematisch: Verbindungen und Funktion. Geographisch: Standort.',
    },
    {
      id: 'plans-labels',
      title: 'Adressen machen den Plan brauchbar',
      explanation: [
        'Ein Kabelstrich allein verrät nicht, ob zwei Geräte korrekt konfiguriert sind. Beschrifte jedes IP-Netz mit Netzadresse und Maske.',
        'Beschrifte Geräte mit Name, Funktion und ihrer IP samt Maske oder ihrer MAC, falls keine IP vorhanden ist. Ergänze das Betriebssystem, soweit es passt.',
        'Ein VLAN ist ein eigenes logisch getrenntes lokales Netz. Nach euren Kursvorgaben braucht es im Plan seine Netzadresse; die VLAN-Nummer allein genügt nicht.',
      ],
      example: {
        title: 'Ein beschrifteter Serveranschluss',
        lines: [
          'Netz: 192.168.1.64/26.',
          'Server s1: 192.168.1.70/26 → Switch sw01.',
          'Gateway: 192.168.1.65.',
          'Mit diesen Angaben kannst du prüfen: Server und Gateway liegen im selben Netz.',
        ],
      },
      check: {
        prompt: 'Welche Angabe beschreibt ein IP-Netz im Plan vollständig?',
        options: ['Nur «VLAN 10»', '192.168.1.64/26', 'Nur «blaues Kabel»'],
        correct: 1,
        explanation:
          'Netzadresse und Präfix beschreiben den Adressbereich. Eine VLAN-Nummer bezeichnet eine Trennung, verrät aber für sich allein weder Netzadresse noch Maske.',
      },
      takeaway: 'Pro Netz: Netzadresse und Maske. Pro Gerät: Name, Adresse und Funktion.',
    },
    {
      id: 'plans-names',
      title: 'Die Namen aus eurem Kurs lesen',
      explanation: [
        'Euer Kurs nutzt feste Namen, damit du Geräte im Plan wiedererkennst. Sie sind klein geschrieben und enthalten Buchstaben und Zahlen.',
        'Der erste Server heisst s1, der erste Layer-2-Switch sw01 und der erste Layer-3-Switch l3sw01. Der erste Gigabit-Netzwerkadapter heisst ge0.',
        'Diese Namen sind eine Kursvorgabe. Sie sind kein weltweiter Standard. Verwende passende Gerätesymbole und die gleichen Namen im Plan und auf den Geräten.',
      ],
      example: {
        title: 'Namen auseinanderhalten',
        lines: [
          's1 → Server 1.',
          'sw01 → Switch 1.',
          'l3sw01 → Switch 1 mit Routingfunktion.',
          'ge0 → Gigabit-Netzwerkadapter 0.',
        ],
      },
      check: {
        prompt: 'Welcher Name steht im Kurs für den ersten Switch mit Routingfunktion?',
        options: ['s1', 'ge0', 'l3sw01'],
        correct: 2,
        explanation:
          'l3sw01 bezeichnet den ersten Layer-3-Switch. «l3» weist auf die zusätzliche Routingfunktion hin; s1 ist ein Server und ge0 ein Adapter.',
      },
      takeaway:
        'Einheitliche Namen helfen beim Wiederfinden; die genaue Schreibweise ist kursabhängig.',
    },
  ],
  protocols: [
    {
      id: 'protocols-ports',
      title: 'Die Adresse findet den PC, der Port den Dienst',
      explanation: [
        'Ein Protokoll ist eine Vereinbarung darüber, wie Geräte miteinander kommunizieren. Es legt beispielsweise Nachrichten und deren Reihenfolge fest.',
        'Auf einem Server können gleichzeitig verschiedene Dienste laufen. Die IP bezeichnet seine Schnittstelle; ein TCP- oder UDP-Port hilft, die Daten dem passenden Dienst oder Endpunkt zuzuordnen.',
        'Die Kurzschreibweise IP:Port nennt euer Unterricht einen Socket. Ein Dienstport ist eine Nummer in der Kommunikation, keine Kabelbuchse am Switch.',
      ],
      example: {
        title: 'Eine HTTPS-Verbindung',
        lines: [
          'Dein PC: 192.168.1.77:52341.',
          'Webserver: 203.0.113.10:443.',
          '443 bezeichnet hier den HTTPS-Dienst; 52341 den lokalen Endpunkt deines Clients.',
        ],
      },
      check: {
        prompt:
          'Ein Server hat einen Web- und einen Maildienst. Womit wird der Verkehr dem passenden Dienst zugeordnet?',
        options: [
          'Mit der Bildschirmgrösse',
          'Mit einem TCP- oder UDP-Port',
          'Nur mit der Kabelfarbe',
        ],
        correct: 1,
        explanation:
          'Die IP erreicht die Serverschnittstelle. Der Port ordnet den Verkehr dem passenden Endpunkt zu. Er ist keine physische Buchse.',
      },
      takeaway: 'IP: welche Schnittstelle? Port: welcher Dienst oder Endpunkt?',
    },
    {
      id: 'protocols-tcp',
      title: 'TCP kümmert sich um Reihenfolge und Wiederholung',
      explanation: [
        'TCP baut zuerst eine Verbindung auf. Die drei Nachrichten heissen SYN, SYN-ACK und ACK: anfangen, bestätigen, Bestätigung bestätigen.',
        'Danach liefert TCP Daten in der richtigen Reihenfolge und wiederholt verlorene Daten. Du musst dafür nicht jedes Paket selbst kontrollieren.',
        'Zuverlässigkeit bedeutet keine Verschlüsselung. TLS ist ein zusätzliches Schutzverfahren, das zum Beispiel HTTPS verwendet. Bei einem dauerhaften Netzausfall kann auch TCP keine Zustellung erzwingen.',
      ],
      example: {
        title: 'Der Verbindungsaufbau',
        lines: [
          'Client → Server: SYN.',
          'Server → Client: SYN-ACK.',
          'Client → Server: ACK.',
          'Danach kann die Anwendung Daten über die aufgebaute Verbindung senden.',
        ],
      },
      check: {
        prompt: 'Eine Verbindung verwendet TCP. Sind ihre Daten damit automatisch verschlüsselt?',
        options: [
          'Ja, Wiederholung ist Verschlüsselung',
          'Nein, dafür braucht es zusätzlichen Schutz wie TLS',
          'Ja, sobald Port 80 verwendet wird',
        ],
        correct: 1,
        explanation:
          'TCP sorgt für einen geordneten Datenstrom und Wiederholungen. Es verschlüsselt selbst nichts. HTTPS ergänzt dafür TLS.',
      },
      takeaway: 'TCP ordnet und wiederholt. TLS schützt die Verbindung.',
    },
    {
      id: 'protocols-udp-icmp',
      title: 'UDP sendet ohne TCP-Aufbau; ICMP meldet Netzwerkzustände',
      explanation: [
        'UDP sendet einzelne Nachrichten, sogenannte Datagramme, ohne den dreistufigen TCP-Verbindungsaufbau. Es garantiert selbst weder Ankunft noch Reihenfolge.',
        'Das ist keine Aussage, dass jede UDP-Anwendung unzuverlässig sein muss: Die Anwendung kann eigene Sicherungsmechanismen ergänzen. UDP ist auch nicht in jeder Situation automatisch schneller.',
        'ICMP ist ein anderes Protokoll für Kontroll- und Fehlermeldungen. Ping verwendet ICMP-Echo. ICMP verwendet keine TCP- oder UDP-Ports.',
      ],
      example: {
        title: 'Zwei verschiedene Aufgaben',
        lines: [
          'DNS kann eine Anfrage als UDP-Nachricht senden.',
          'Ping bittet per ICMP-Echo um eine Antwort.',
          'Ein fehlgeschlagener Ping beweist nicht, dass ein HTTPS-Dienst ebenfalls ausfällt.',
        ],
      },
      check: {
        prompt: 'Welches Protokoll verwendet Ping für seine Echo-Anfragen?',
        options: ['TCP auf Port 80', 'ICMP', 'DHCP auf Port 67'],
        correct: 1,
        explanation:
          'Ping nutzt ICMP-Echo. ICMP hat keine TCP-/UDP-Dienstports und ist nicht dasselbe wie eine Prüfung des Webdienstes.',
      },
      takeaway: 'UDP: einzelne Nachrichten ohne TCP-Aufbau. ICMP: Kontroll- und Fehlermeldungen.',
    },
    {
      id: 'protocols-services',
      title: 'Ports an eine konkrete Aufgabe knüpfen',
      explanation: [
        'Lerne zuerst den Dienst, dann seine übliche Portnummer: Websites verwenden HTTP oder HTTPS, Namensauflösung verwendet DNS und automatische Konfiguration verwendet DHCP.',
        'Für die Grundfälle gilt: HTTP TCP 80, HTTPS meist TCP 443, DNS UDP und TCP 53, DHCPv4 UDP 67 am Server und 68 am Client.',
        'Weitere Kurswerte: SSH TCP 22 für eine geschützte Fernkonsole, FTP TCP 21 für Steuerung und bei aktiven Datenverbindungen 20, SMTP TCP 25 für Mailtransport, IMAP TCP 143 für Postfächer, NTP UDP 123 für Uhrzeit. Das sind typische Grundfälle, nicht alle möglichen Varianten.',
      ],
      example: {
        title: 'Eine Website öffnen',
        lines: [
          'DNS auf Port 53 findet zunächst die Adresse zum Namen.',
          'HTTPS üblicherweise auf TCP 443 lädt die Website mit TLS-Schutz.',
          'HTTP/3 ist eine Variante über QUIC und UDP; für den Einstieg betrachten wir den klassischen TCP-Fall.',
        ],
      },
      check: {
        prompt:
          'Du willst den klassischen HTTPS-Dienst prüfen. Welchen TCP-Port testest du normalerweise?',
        options: ['53', '443', '67'],
        correct: 1,
        explanation:
          'HTTPS verwendet im klassischen TCP-Fall gewöhnlich Port 443. 53 gehört zu DNS, 67 zum DHCPv4-Server.',
      },
      takeaway: 'Merke die Aufgabe mit: DNS 53, HTTPS 443, DHCP 67/68.',
    },
  ],
  dns: [
    {
      id: 'dns-job',
      title: 'Du kennst den Namen, der PC braucht die Adresse',
      explanation: [
        'Du tippst einen Website-Namen ein. Für die Netzwerkverbindung braucht dein PC eine passende IP-Adresse. DNS liefert Informationen zu Namen, zum Beispiel diese Adresse.',
        'DNS ist eine verteilte Datenbank: Nicht ein einziger Server kennt alle Namen. Der Name bildet einen Baum, den du von rechts nach links liest.',
        'Bei www.de.wikipedia.org. steht der letzte Punkt für die Wurzel, dann folgt org, darunter wikipedia, dann de und www. Ein vollständig angegebener Name heisst FQDN; den letzten Punkt lässt man im Alltag oft weg.',
      ],
      example: {
        title: 'Name und Adresse sind verschiedene Dinge',
        lines: [
          'Eingabe im Browser: www.example.org.',
          'DNS-Frage: Welche IP-Adresse gehört zu diesem Namen?',
          'Erst mit der Antwort kann die passende Netzwerkverbindung aufgebaut werden.',
        ],
      },
      check: {
        prompt: 'Welcher Dienst hilft deinem PC, die IP-Adresse zu einem Website-Namen zu finden?',
        options: ['DNS', 'Der Netzwerkadapter allein', 'Die Bildschirmauflösung'],
        correct: 0,
        explanation:
          'DNS liefert Einträge zu Namen, zum Beispiel eine IP-Adresse. Der Netzwerkadapter überträgt Daten, verwaltet aber nicht diese Namensdatenbank.',
      },
      takeaway: 'DNS beantwortet Fragen zu Namen; es verteilt nicht deine eigene IP-Konfiguration.',
    },
    {
      id: 'dns-path',
      title: 'Der Resolver beschafft die Antwort',
      explanation: [
        'Dein PC fragt normalerweise einen rekursiven Resolver. Das ist ein DNS-Dienst, der die endgültige Antwort oder eine Fehlermeldung für dich beschafft.',
        'Wenn er noch keine passende gespeicherte Antwort hat, kann er die zuständigen Server fragen: zuerst Root, dann den Server der Top-Level-Domain wie org, dann den autoritativen Server.',
        'Root und TLD geben normalerweise Hinweise auf die nächste zuständige Stelle. Der autoritative Server kennt die Einträge seiner Zone. Die Website-Daten werden dabei noch nicht heruntergeladen.',
      ],
      example: {
        title: 'Mehrere Fragen statt eines durchgereichten Pakets',
        lines: [
          'PC → Resolver: «Beschaffe die Antwort für www.example.org.»',
          'Resolver → Root: «Wer kennt org?»',
          'Resolver → org-Server: «Wer ist für example.org zuständig?»',
          'Resolver → zuständiger Server: «Welche Adresse hat www.example.org?»',
        ],
      },
      visual: 'dns-path',
      check: {
        prompt: 'Der Root-Server kennt nicht die Website-IP. Ist das automatisch ein Fehler?',
        options: [
          'Ja, Root muss jede Website-IP kennen',
          'Nein, er verweist normalerweise auf die nächste zuständige Stelle',
          'Ja, DNS funktioniert ohne mehrere Server',
        ],
        correct: 1,
        explanation:
          'Root ist ein Einstieg in die Hierarchie. Er liefert normalerweise den Verweis auf die zuständige TLD; die eigentlichen Einträge liegen weiter unten.',
      },
      takeaway: 'Der Resolver sucht für dich; die Hierarchie verteilt die Zuständigkeit.',
    },
    {
      id: 'dns-cache',
      title: 'Gespeicherte Antworten sparen Nachfragen',
      explanation: [
        'Ein Cache ist ein Zwischenspeicher. DNS-Antworten dürfen dort für eine bestimmte Zeit aufbewahrt werden. Diese Gültigkeitsdauer heisst TTL, Time To Live.',
        'Solange eine passende Antwort gültig im Cache liegt, muss der Resolver nicht erneut den ganzen Namensbaum abfragen.',
        '«Rekursiv» heisst: Beschaffe die fertige Antwort. «Iterativ» heisst: Gib vorhandene Daten oder einen Verweis auf die nächste Stelle. Diese Wörter beschreiben die Art der Anfrage, keine zwei verschiedenen Arten von Website.',
      ],
      example: {
        title: 'Dieselbe Website kurz darauf',
        lines: [
          'Erste Anfrage: Antwort wird beschafft und mit ihrer TTL gespeichert.',
          'Zweite Anfrage innerhalb der Gültigkeit: passende Antwort kann aus dem Cache kommen.',
          'Nach Ablauf muss die Antwort bei Bedarf neu beschafft werden.',
        ],
      },
      check: {
        prompt:
          'Der Resolver hat eine noch gültige Antwort im Cache. Muss er wieder bei Root beginnen?',
        options: [
          'Ja, bei jeder Anfrage',
          'Nein, er kann die gespeicherte Antwort nutzen',
          'Nein, weil DNS nur einmal im Leben funktioniert',
        ],
        correct: 1,
        explanation:
          'Eine gültige Cache-Antwort kann direkt verwendet werden. Das spart Fragen; nach Ablauf der Gültigkeit ist bei Bedarf eine neue Auflösung nötig.',
      },
      takeaway: 'Nicht jeder Website-Aufruf führt zu einer kompletten neuen DNS-Suche.',
    },
    {
      id: 'dns-records',
      title: 'DNS kennt mehr als Website-Adressen',
      explanation: [
        'Ein DNS-Eintrag heisst Resource Record. Sein Typ beschreibt, welche Information er enthält.',
        'A enthält eine IPv4-Adresse, AAAA eine IPv6-Adresse, CNAME einen anderen Namen als Alias und MX den zuständigen Mailserver.',
        'PTR dient der umgekehrten Suche von IP zu Name. Diese Rückwärtsauflösung muss separat eingerichtet sein; sie entsteht nicht automatisch aus jedem A-Eintrag.',
      ],
      example: {
        title: 'Die passende Frage stellen',
        lines: [
          'IPv4 zu einem Namen suchen → A.',
          'Mailserver zu einer Domain suchen → MX.',
          'Unter Windows: nslookup -type=MX example.org.',
        ],
      },
      check: {
        prompt: 'Du suchst den Mailserver einer Domain. Welchen DNS-Eintrag fragst du ab?',
        options: ['A', 'MX', 'PTR'],
        correct: 1,
        explanation:
          'MX beschreibt den zuständigen Mailserver. A liefert eine IPv4-Adresse; PTR gehört zur Rückwärtsauflösung.',
      },
      takeaway: 'Wähle den Record-Typ passend zur Information, die du brauchst.',
    },
  ],
  dhcp: [
    {
      id: 'dhcp-settings',
      title: 'Dein PC bekommt die Einstellungen automatisch',
      explanation: [
        'Du verbindest ein Notebook mit dem Netzwerk und möchtest nicht alle IP-Einstellungen von Hand eintragen. Dafür gibt es DHCP.',
        'Ein DHCP-Server verteilt Einstellungen aus einem erlaubten Vorrat, dem Adresspool. Häufig liefert er eigene IP, Netzmaske, Standardgateway und DNS-Server.',
        'Der DHCP-Server ist nicht dasselbe wie der DNS-Server. DHCP gibt dir die Adresse des DNS-Dienstes; der DNS-Dienst beantwortet anschliessend Namensfragen.',
      ],
      example: {
        title: 'Was das Notebook erhält',
        lines: [
          'Eigene IP: 192.168.1.77.',
          'Maske: /26. Gateway: 192.168.1.65.',
          'DNS-Server: 192.168.1.70.',
          'Danach kann das Notebook seine Netzzugehörigkeit prüfen und Namen abfragen.',
        ],
      },
      check: {
        prompt:
          'Welcher Dienst kann deinem PC automatisch IP, Maske, Gateway und DNS-Server zuweisen?',
        options: ['DHCP', 'DNS allein', 'HTTP'],
        correct: 0,
        explanation:
          'DHCP verteilt die Netzkonfiguration. DNS verwendet der PC danach zur Namensauflösung; HTTP transportiert Webinhalte.',
      },
      takeaway: 'DHCP verteilt Einstellungen; DNS löst Namen auf.',
    },
    {
      id: 'dhcp-dora',
      title: 'Suchen, anbieten, auswählen, bestätigen',
      explanation: [
        'Beim ersten Bezug einer DHCPv4-Konfiguration durchläuft der Client vier Schritte. Ihre Anfangsbuchstaben ergeben DORA.',
        'Discover: Der Client sucht einen Server. Offer: Der Server bietet Einstellungen an. Request: Der Client fordert das gewählte Angebot an. ACK: Der Server bestätigt die Zuweisung.',
        'Die erste Suche ist ein lokaler Broadcast, weil der Client den Server noch nicht kennt. DHCPv4 verwendet UDP-Port 67 am Server und 68 am Client.',
      ],
      example: {
        title: 'Eine kurze Unterhaltung',
        lines: [
          'Client: «Ist ein DHCP-Server da?» → Discover.',
          'Server: «Diese Konfiguration kann ich anbieten.» → Offer.',
          'Client: «Diese möchte ich verwenden.» → Request.',
          'Server: «Bestätigt.» → ACK.',
        ],
      },
      visual: 'dora',
      check: {
        prompt: 'Der Server hat ein Angebot gesendet. Welche Nachricht sendet der Client danach?',
        options: ['Offer', 'Request', 'Discover'],
        correct: 1,
        explanation:
          'Nach Offer fordert der Client das ausgewählte Angebot mit Request an. Erst danach bestätigt der Server die Zuweisung mit ACK.',
      },
      takeaway: 'DORA: Discover → Offer → Request → ACK.',
    },
    {
      id: 'dhcp-lease',
      title: 'Die Adresse ist geliehen, nicht für immer vergeben',
      explanation: [
        'Eine Lease ist die begrenzte Zeit, für die ein Client die zugeteilte Adresse verwenden darf.',
        'Standardmässig beginnt der Client nach der Hälfte dieser Zeit die Verlängerung. Er verwendet dafür Request und ACK, nicht einen eigenen Nachrichtentyp namens DHCP-RENEW.',
        'Wenn die Lease ohne erfolgreiche Verlängerung abläuft, darf er die Adresse nicht einfach weiter nutzen. Ein plötzlich ausgeschalteter PC meldet seine Adresse auch nicht zwingend aktiv zurück.',
      ],
      example: {
        title: 'Eine Lease von acht Stunden',
        lines: [
          'Zuteilung: acht Stunden gültig.',
          'Erster Verlängerungsversuch standardmässig nach vier Stunden.',
          'Erfolgreiche Bestätigung: die Gültigkeit wird erneuert.',
        ],
      },
      check: {
        prompt:
          'Eine Lease gilt acht Stunden. Wann beginnt standardmässig der erste Verlängerungsversuch?',
        options: ['Erst nach acht Stunden', 'Nach vier Stunden', 'Nach acht Tagen'],
        correct: 1,
        explanation:
          'Der Standardwert ist die Hälfte der Lease: 8 ÷ 2 = 4 Stunden. Der Client versucht also zu verlängern, bevor seine Erlaubnis abläuft.',
      },
      takeaway: 'Lease = zeitlich begrenzte Zuweisung; die Verlängerung beginnt vor dem Ablauf.',
    },
    {
      id: 'dhcp-pool-relay',
      title: 'Adresskonflikte vermeiden und andere Netze erreichen',
      explanation: [
        'Ein Pool enthält die verteilbaren Adressen. Ein Ausschluss nimmt statisch belegte Adressen aus diesem Vorrat, damit der Server sie nicht zusätzlich vergibt.',
        'Eine Reservierung sorgt dafür, dass ein bestimmter Client über DHCP wieder die vorgesehene Adresse erhält. Mehrere DHCP-Server sind möglich, müssen ihre Vergabe aber abstimmen.',
        'Ein Relay ist ein Vermittler zum DHCP-Server in einem anderen Netz. Ein Router leitet die anfängliche Broadcast-Suche nicht einfach überall weiter; das Relay überbrückt diese Grenze gezielt.',
      ],
      example: {
        title: 'Der Router hat bereits .65',
        lines: [
          'Gateway statisch: 192.168.1.65.',
          'Diese Adresse aus der dynamischen Vergabe ausschliessen.',
          'Sonst könnte ein weiterer Client dieselbe Adresse erhalten und einen Konflikt verursachen.',
        ],
      },
      check: {
        prompt:
          'Dein Router verwendet eine feste Adresse. Was verhindert, dass DHCP dieselbe Adresse zusätzlich an einen PC vergibt?',
        options: [
          'Die Adresse aus dem dynamischen Pool ausschliessen',
          'Alle DNS-Einträge löschen',
          'Den Namen des Routers ändern',
        ],
        correct: 0,
        explanation:
          'Ein Ausschluss schützt die statisch belegte Adresse. DNS und Gerätenamen ändern nicht, welche Adressen der DHCP-Server vergeben darf.',
      },
      takeaway:
        'Ausschlüsse verhindern Doppelvergaben; ein Relay erreicht einen entfernten DHCP-Server.',
    },
  ],
  routing: [
    {
      id: 'routing-next-hop',
      title: 'Der Router muss den nächsten Schritt kennen',
      explanation: [
        'Routing bestimmt anhand der Ziel-IP den weiteren Weg. Ein Router muss dafür nicht jeden späteren Router kennen, sondern den passenden nächsten Schritt.',
        'Eine Route nennt das Zielnetz und den nächsten Nachbarn, den Next-Hop, oder den Ausgangsanschluss, das Exit-Interface. Der Next-Hop ist nicht die eigene Adresse des Routers.',
        'Das Standardgateway deines PCs ist normalerweise der erste Router für Ziele ausserhalb des lokalen Netzes.',
      ],
      example: {
        title: 'R1 erreicht ein Netz hinter R2',
        lines: [
          'R1 hat 10.0.0.1; der benachbarte R2 hat 10.0.0.2.',
          'Zielnetz hinter R2: 192.168.2.0/24.',
          'Route auf R1: Ziel 192.168.2.0/24 → Next-Hop 10.0.0.2.',
          'R1 gibt das Paket seinem Nachbarn R2.',
        ],
      },
      visual: 'routing-path',
      check: {
        prompt:
          'R1 hat .1 und sein Nachbar R2 hat .2. Welche Adresse ist der Next-Hop auf R1 für ein Netz hinter R2?',
        options: [
          'Die eigene Adresse .1',
          'Die Adresse des Nachbarn .2',
          'Immer die Broadcastadresse',
        ],
        correct: 1,
        explanation:
          'Der Next-Hop ist der nächste erreichbare Nachbar, also R2 mit .2. Die eigene Adresse würde das Paket nicht an den Nachbarn übergeben.',
      },
      takeaway: 'Next-Hop = nächster Nachbar. Exit-Interface = eigener Ausgang.',
    },
    {
      id: 'routing-match',
      title: 'Die genaueste passende Route gewinnt',
      explanation: [
        'Ein Ziel kann zu mehreren Einträgen passen. Dann verwendet der Router die passende Route mit dem längsten Präfix: Sie beschreibt den kleinsten und genauesten Zielbereich.',
        'Eine passende /24 ist genauer als eine passende /16. Prüfe aber zuerst, ob das Ziel überhaupt in den jeweiligen Bereich gehört; eine unpassende /24 gewinnt nicht.',
        '0.0.0.0/0 ist die Default-Route, also der allgemeine Weg, wenn keine genauere Route passt. Ohne irgendeine passende Route wird das Paket verworfen.',
      ],
      example: {
        title: 'Ziel 192.168.2.77',
        lines: [
          '192.168.0.0/16 → passt.',
          '192.168.2.0/24 → passt und ist genauer.',
          '0.0.0.0/0 → passt auch, ist aber am allgemeinsten.',
          'Gewählt wird die passende /24-Route.',
        ],
      },
      check: {
        prompt: 'Das Ziel passt zu einer /16- und einer /24-Route. Welche wird bevorzugt?',
        options: [
          'Die /16, weil sie mehr Adressen umfasst',
          'Die /24, weil sie genauer passt',
          'Immer die Default-Route',
        ],
        correct: 1,
        explanation:
          'Die längere passende Netzbeschreibung ist spezifischer. /24 grenzt den Zielbereich genauer ein als /16 und wird bevorzugt.',
      },
      takeaway: 'Erst passende Routen suchen; davon den längsten Präfix wählen.',
    },
    {
      id: 'routing-return',
      title: 'Die Antwort braucht ebenfalls einen Weg',
      explanation: [
        'Wenn ein Paket den Zielserver erreicht, ist erst der Hinweg gelungen. Damit du die Antwort erhältst, muss auch in der Gegenrichtung eine passende Route existieren.',
        'Für die lokale Übergabe an den Router verwendet dein PC dessen MAC-Adresse. ARP ist der IPv4-Dienst, der die MAC eines lokalen Nachbarn ermittelt.',
        'Dabei bleibt die Ziel-IP die des entfernten Zielhosts. IP und MAC beantworten verschiedene Fragen: endgültiges logisches Ziel und nächster lokaler Empfänger.',
      ],
      example: {
        title: 'Netz A → Netz B → Netz A',
        lines: [
          'R1 braucht eine Route zum Netz B über R2.',
          'R2 braucht für Antworten eine Route zum Netz A über R1.',
          'Der PC ermittelt lokal die MAC seines Gateways, nicht die MAC des entfernten Servers.',
        ],
      },
      check: {
        prompt:
          'Ein Paket erreicht den Server, aber der Server hat keinen Rückweg zum Client. Was fehlt für die Antwort?',
        options: [
          'Eine passende Route zurück',
          'Eine zweite Bildschirmseite',
          'Eine andere MAC des entfernten Servers auf deinem PC',
        ],
        correct: 0,
        explanation:
          'Eine Antwort wird ebenfalls geroutet. Ein funktionierender Hinweg ersetzt die Route in Gegenrichtung nicht.',
      },
      takeaway: 'Hinweg und Rückweg prüfen. ARP sucht nur einen lokalen Nachbarn.',
    },
    {
      id: 'routing-static-dynamic',
      title: 'Routen eintragen oder austauschen lassen',
      explanation: [
        'Eine statische Route wird von einer Person konfiguriert. Das ist übersichtlich, wenn ein Netz klein ist und sich selten ändert.',
        'Dynamische Routingprotokolle lassen Router Erreichbarkeitsinformationen austauschen. Beispiele aus dem Kurs sind OSPF, RIP und BGP.',
        'Dynamisch heisst nicht, dass ein Ersatzweg aus dem Nichts entsteht. Bei einem Ausfall kann nur dann ausgewichen werden, wenn ein geeigneter anderer Weg tatsächlich vorhanden ist.',
      ],
      example: {
        title: 'Ein einziges Verbindungskabel fällt aus',
        lines: [
          'Ohne zweite Verbindung existiert kein Ausweichweg.',
          'Ein Routingprotokoll kann keine neue physische Verbindung erzeugen.',
          'Mit einem geeigneten vorhandenen Ersatzweg kann neu geroutet werden.',
        ],
      },
      check: {
        prompt:
          'Zwischen zwei Netzbereichen existiert nur eine Verbindung. Sie fällt aus. Garantiert dynamisches Routing einen Ersatzweg?',
        options: [
          'Ja, es erzeugt ein neues Kabel',
          'Nein, ein geeigneter anderer Weg muss vorhanden sein',
          'Ja, ein grösserer Präfix repariert die Verbindung',
        ],
        correct: 1,
        explanation:
          'Routingprotokolle können vorhandene Wege bewerten und auswählen. Ohne einen anderen geeigneten Weg können sie die unterbrochene Verbindung nicht ersetzen.',
      },
      takeaway: 'Statisch: eingetragen. Dynamisch: ausgetauscht. Ein Ersatzweg muss existieren.',
    },
  ],
  wifi: [
    {
      id: 'wifi-local',
      title: 'WLAN ist dein lokaler Funkzugang',
      explanation: [
        'WLAN bedeutet lokales drahtloses Netzwerk. Im üblichen Infrastrukturmodus verbindet sich dein Notebook über einen Access Point mit dem LAN.',
        'WLAN und Internet sind verschiedene Dinge: Eine Funkverbindung zum Access Point kann funktionieren, während der Weg ins Internet ausfällt.',
        'WPAN bezeichnet einen kleinen persönlichen Funkbereich wie Bluetooth. WWAN beschreibt weiträumigen Funkzugang wie Mobilfunk. Ad-hoc meint eine direkte Verbindung ohne den üblichen zentralen Access Point.',
      ],
      example: {
        title: 'Das WLAN-Symbol ist da, die Website lädt nicht',
        lines: [
          'Funkverbindung zum Access Point kann bereits stehen.',
          'Danach können noch IP-Konfiguration, DNS, Routing oder der Webdienst fehlen.',
          'Das WLAN-Symbol allein beweist nicht, dass alle späteren Schritte funktionieren.',
        ],
      },
      check: {
        prompt:
          'Dein Notebook ist mit dem Access Point verbunden. Ist damit der Internetzugang sicher bewiesen?',
        options: [
          'Ja, WLAN bedeutet immer Internet',
          'Nein, der weitere Netzwerkweg muss ebenfalls funktionieren',
          'Ja, wenn der Netzwerkname sichtbar ist',
        ],
        correct: 1,
        explanation:
          'WLAN ist zunächst die lokale Funkverbindung. Internetzugang braucht zusätzlich passende Einstellungen und einen funktionierenden Weg über weitere Netze.',
      },
      takeaway: 'WLAN ist eine lokale Verbindung, keine Garantie für Internetzugang.',
    },
    {
      id: 'wifi-bands',
      title: 'Frequenzbänder passend zur Umgebung wählen',
      explanation: [
        'Ein Frequenzband ist ein Bereich von Funkfrequenzen. WLAN verwendet je nach Geräten 2,4, 5 oder 6 GHz.',
        '2,4 GHz bietet häufig bessere Reichweite und Durchdringung, ist aber oft stärker belegt. 5 GHz bietet häufig mehr geeignete Kanäle und Kapazität. 6 GHz ergänzt den Funkraum bei passenden Geräten und lokalen Vorgaben.',
        'Ein Kanal ist ein Teilbereich eines Bandes. Bei 20 MHz breiten Kanälen ist 1/6/11 eine häufige 2,4-GHz-Planung. Betrachte Reichweite, Belegung und Kanalbreite zusammen.',
      ],
      example: {
        title: 'Mehrere Wände zwischen Notebook und Access Point',
        lines: [
          '2,4 GHz kann hier stabiler ankommen.',
          '5 GHz kann unter guten Funkbedingungen mehr Kapazität bieten.',
          'Es gibt kein Band, das an jedem Standort automatisch das beste ist.',
        ],
      },
      check: {
        prompt:
          'Ein Notebook steht hinter mehreren Wänden. Welches Band kann wegen seiner häufig besseren Durchdringung sinnvoll sein?',
        options: [
          '2,4 GHz',
          'Immer 6 GHz, unabhängig von Geräten und Wänden',
          'Keines, denn Funk geht nur im selben Raum',
        ],
        correct: 0,
        explanation:
          '2,4 GHz bietet häufig bessere Reichweite und Durchdringung. Die tatsächliche Verbindung hängt zusätzlich von Störungen, Geräten und Standort ab.',
      },
      takeaway: 'Bandwahl hängt von Reichweite, Belegung, Geräten und Umgebung ab.',
    },
    {
      id: 'wifi-throughput',
      title: 'Die Zahl auf der Verpackung ist nicht dein Downloadtempo',
      explanation: [
        'Wi-Fi 5 verwendet 5 GHz. Wi-Fi 6 verwendet 2,4 und 5 GHz; 6E ergänzt 6 GHz. Wi-Fi 7 kann alle drei Bänder verwenden.',
        'Die angegebenen Maximalraten eines Standards gelten unter bestimmten technischen Bedingungen. Sie sind keine garantierte Geschwindigkeit für dein einzelnes Notebook.',
        'Der tatsächliche Durchsatz hängt unter anderem von Funkbedingungen, Kanalbreite, Geräten und gleichzeitigen Nutzern ab. Eine feste Regel wie «netto immer ein Drittel» ist nicht korrekt.',
      ],
      example: {
        title: 'Zwei Notebooks am gleichen WLAN',
        lines: [
          'Notebook nahe am Access Point: gute Funkbedingungen.',
          'Notebook hinter Wänden: schwächerer Empfang und eventuell niedrigerer Durchsatz.',
          'Derselbe WLAN-Standard kann dabei verschiedene tatsächliche Datenraten liefern.',
        ],
      },
      check: {
        prompt:
          'Garantiert die theoretische Maximalrate von Wi-Fi 7 diese Rate auf deinem Notebook?',
        options: [
          'Ja, immer',
          'Nein, Umgebung und Geräte bestimmen den tatsächlichen Durchsatz mit',
          'Ja, wenn die SSID kurz ist',
        ],
        correct: 1,
        explanation:
          'Ein Standardmaximum ist keine Einzelgerätegarantie. Funkbedingungen, Fähigkeiten der Geräte und die gemeinsam genutzte Kapazität wirken sich auf den Durchsatz aus.',
      },
      takeaway:
        'Verstehe die Bedingungen der Verbindung, statt nur Maximalraten auswendig zu lernen.',
    },
  ],
  security: [
    {
      id: 'security-protection',
      title: 'Ein WLAN-Name ist noch kein Schutz',
      explanation: [
        'Die SSID ist der Name des WLANs, den du in der Netzwerkliste siehst. Der Name allein verhindert keinen fremden Zugriff.',
        'Für sicheren Zugang brauchst du ein geeignetes Anmelde- und Verschlüsselungsverfahren. WPA2 mit AES/CCMP oder WPA3 sind bei passenden Geräten und korrekter Konfiguration geeignet.',
        'WEP und das alte WPA mit TKIP sind überholt. WPA3-Personal verwendet SAE für die Anmeldung; WPA3 ist nicht einfach ein anderes Wort für AES-256.',
      ],
      example: {
        title: 'Ein neues WLAN einrichten',
        lines: [
          'SSID wählen: der sichtbare Netzwerkname.',
          'Geeigneten Schutz konfigurieren: WPA2 mit AES/CCMP oder WPA3.',
          'Ein starkes Geheimnis verwenden und veraltete Schutzverfahren vermeiden.',
        ],
      },
      check: {
        prompt: 'Welche Konfiguration ist für ein neues WLAN unter passenden Bedingungen geeignet?',
        options: [
          'WEP, weil es alt und bekannt ist',
          'Nur ein schwer erratbarer WLAN-Name',
          'WPA2 mit AES/CCMP oder WPA3',
        ],
        correct: 2,
        explanation:
          'WPA2 mit AES/CCMP oder WPA3 bieten geeigneten Schutz bei korrekter Konfiguration. Ein Name ist keine Zugangskontrolle; WEP ist überholt.',
      },
      takeaway:
        'Die SSID benennt das Netz; Authentisierung und Verschlüsselung schützen den Zugang.',
    },
    {
      id: 'security-identities',
      title: 'Gemeinsames Passwort oder eigene Zugänge?',
      explanation: [
        'Bei Personal verwenden die Nutzer ein gemeinsames Geheimnis. Das passt beispielsweise zu einem kleinen privaten Netz.',
        'Enterprise ermöglicht individuelle Anmeldungen. Dafür werden Verfahren wie 802.1X/EAP verwendet, häufig mit einem RADIUS-Dienst zur Prüfung der Anmeldung.',
        'Der praktische Unterschied: Einen individuellen Zugang kannst du einzeln sperren. Ein geteiltes Passwort musst du ändern, wenn eine ausgeschiedene Person es nicht weiter kennen soll.',
      ],
      example: {
        title: 'Eine Person verlässt die Firma',
        lines: [
          'Enterprise: ihren persönlichen Zugang sperren.',
          'Personal: das gemeinsame Passwort ändern und die betroffenen Geräte neu konfigurieren.',
        ],
      },
      check: {
        prompt:
          'Du möchtest genau den Zugang einer ausgeschiedenen Person sperren. Welches Modell unterstützt das?',
        options: [
          'Ein geteiltes Passwort ohne einzelne Konten',
          'Enterprise mit individuellen Zugängen',
          'Nur eine versteckte SSID',
        ],
        correct: 1,
        explanation:
          'Individuelle Enterprise-Zugänge lassen sich gezielt verwalten. Bei einem gemeinsamen Passwort gibt es keinen separat sperrbaren persönlichen Zugang.',
      },
      takeaway: 'Personal teilt ein Geheimnis; Enterprise verwaltet individuelle Anmeldungen.',
    },
    {
      id: 'security-limits',
      title: 'Verstecken ersetzt keine Zugangskontrolle',
      explanation: [
        'Ein versteckter WLAN-Name kann trotzdem ermittelt werden. Auch eine erlaubte MAC-Adresse kann nachgeahmt werden.',
        'Eine versteckte SSID und ein MAC-Filter ersetzen deshalb keine sichere Anmeldung und Verschlüsselung.',
        'Ändere Standard-Zugangsdaten, aktualisiere die Gerätesoftware, trenne Gäste vom internen LAN und begrenze den Verwaltungszugriff. Das sind zusätzliche sinnvolle Massnahmen.',
      ],
      example: {
        title: 'Ein Gast braucht nur Internetzugang',
        lines: [
          'Ein getrenntes Gastnetz kann Zugriff auf interne Geräte verhindern.',
          'Die sichere Anmeldung und Verschlüsselung bleiben trotzdem nötig.',
          'Ein unsichtbarer Netzwerkname alleine löst diese Aufgabe nicht.',
        ],
      },
      check: {
        prompt: 'Du versteckst die SSID. Kannst du deswegen auf verschlüsselten Zugang verzichten?',
        options: [
          'Ja, unsichtbar bedeutet unauffindbar',
          'Nein, Verstecken ist kein Ersatz für den Schutz',
          'Ja, wenn zusätzlich ein MAC-Filter aktiv ist',
        ],
        correct: 1,
        explanation:
          'SSID und MAC können ermittelt beziehungsweise nachgeahmt werden. Geeignete Authentisierung und Verschlüsselung bleiben erforderlich.',
      },
      takeaway: 'Zugang schützen, Geräte pflegen, Gäste trennen; Verstecken allein reicht nicht.',
    },
  ],
  nat: [
    {
      id: 'nat-purpose',
      title: 'Routing wählt den Weg; NAT schreibt Adressen um',
      explanation: [
        'Dein PC verwendet eine private IPv4-Adresse. Beim üblichen direkten Internetzugang wird nach aussen eine tatsächlich zugeteilte öffentliche Adresse verwendet.',
        'NAT bedeutet Network Address Translation, also Übersetzung von Netzwerkadressen. Es kann die Quell- oder die Zieladresse einer Verbindung ändern.',
        'Routing und NAT sind unterschiedliche Funktionen, auch wenn sie im gleichen Gerät laufen. Private Firmensubnetze können untereinander ohne NAT geroutet werden.',
      ],
      example: {
        title: 'Eine Anfrage geht ins Internet',
        lines: [
          'Vor der Übersetzung: Quelle 192.168.1.77.',
          'Nach der Übersetzung: andere Quelladresse am Internetanschluss.',
          'Die Zieladresse des Webservers bleibt bei diesem Source-NAT-Beispiel gleich.',
        ],
      },
      check: {
        prompt: 'Was ist die eigentliche Aufgabe von NAT?',
        options: ['Adressen übersetzen', 'Alle Daten verschlüsseln', 'Website-Namen auflösen'],
        correct: 0,
        explanation:
          'NAT schreibt Netzwerkadressen um. Verschlüsselung ist eine andere Aufgabe; Namensauflösung übernimmt DNS.',
      },
      takeaway: 'Routing entscheidet wohin; NAT verändert die verwendete Adresse.',
    },
    {
      id: 'nat-pat',
      title: 'Mehrere PCs teilen eine Adresse dank Portzuordnung',
      explanation: [
        'PAT ist eine Form der Übersetzung, bei der mehrere interne Verbindungen dieselbe öffentliche IPv4-Adresse teilen. Ports helfen, die Verbindungen auseinanderzuhalten.',
        'Das NAT-Gerät speichert die Zuordnung in einer Zustandstabelle. Dadurch weiss es, welcher interne PC eine zurückkommende Antwort erhalten soll.',
        'Ein Quellport wird bei Bedarf geändert, damit die Zuordnung eindeutig bleibt. Die Adresse 203.0.113.5 im Beispiel ist nur eine Dokumentationsadresse, kein echter Anschluss für diese Übung.',
      ],
      example: {
        title: 'Zwei PCs, eine äussere Adresse',
        lines: [
          'PC A: 192.168.1.77:51000 → 203.0.113.5:40001.',
          'PC B: 192.168.1.78:51000 → 203.0.113.5:40002.',
          'Antwort an 40001 → zurück zu PC A.',
          'Antwort an 40002 → zurück zu PC B.',
        ],
      },
      visual: 'nat-table',
      check: {
        prompt: 'Eine Antwort kommt an den externen Port 40002 im Beispiel. Welcher PC erhält sie?',
        options: ['PC A mit 192.168.1.77', 'PC B mit 192.168.1.78', 'Automatisch alle PCs'],
        correct: 1,
        explanation:
          'Die Tabelle ordnet 40002 der Verbindung von PC B zu. Die unterschiedlichen externen Ports unterscheiden hier die beiden internen Verbindungen.',
      },
      takeaway: 'PAT speichert, welche äussere Verbindung zu welchem inneren Endpunkt gehört.',
    },
    {
      id: 'nat-forwarding',
      title: 'Quelladresse, Zieladresse und Portweiterleitung',
      explanation: [
        'Source NAT oder SNAT verändert die Quelladresse. Das war unser Beispiel mit dem privaten PC, der eine Website aufruft.',
        'Destination NAT oder DNAT verändert die Zieladresse. Eine Portweiterleitung ist ein Anwendungsfall: Eine Anfrage an einen äusseren Port wird an einen bestimmten internen Dienst weitergeleitet.',
        'Eine Weiterleitung allein genügt nicht: Auch Routing, Firewallregel und der laufende Dienst müssen passen. DNAT bedeutet nicht einfach «Antwortverkehr». Ein 1:1-NAT bildet dagegen eine Adresse auf genau eine andere ab.',
      ],
      example: {
        title: 'Ein konfigurierter Eingang',
        lines: [
          'Extern: TCP-Port 8443 am Anschluss.',
          'Weiterleitung auf intern: 192.168.1.70:443.',
          'Dabei wird das Ziel der eingehenden Verbindung angepasst.',
        ],
      },
      check: {
        prompt:
          'Eine eingehende Verbindung wird auf den internen Server 192.168.1.70 umgeschrieben. Welche Adresse wird geändert?',
        options: [
          'Die Zieladresse – Destination NAT',
          'Nur die MAC des Browsers',
          'Keine Adresse, das ist immer nur DNS',
        ],
        correct: 0,
        explanation:
          'Das Ziel wird vom äusseren Anschluss auf den internen Server abgebildet. Das ist Destination NAT, wie es bei Portweiterleitungen verwendet wird.',
      },
      takeaway:
        'SNAT ändert die Quelle. DNAT ändert das Ziel. Portweiterleitung benötigt passende Freigaben.',
    },
    {
      id: 'nat-limits',
      title: 'NAT ist weder Verschlüsselung noch Firewall',
      explanation: [
        'NAT übersetzt Adressen, schützt aber nicht automatisch den Inhalt der Verbindung. Für Verschlüsselung brauchst du ein Verfahren wie TLS.',
        'Eine Firewall kontrolliert nach Regeln, welcher Verkehr erlaubt ist. NAT ersetzt diese Funktion nicht.',
        'Mit globalen IPv6-Adressen braucht man normalerweise kein PAT, um Adressen zu sparen. Übersetzung kann trotzdem vorkommen, zum Beispiel NAT64 zwischen IPv6 und IPv4. Auch bei IPv6 bestimmen Routing, Firewall und Dienst die Erreichbarkeit.',
      ],
      example: {
        title: 'Zwei getrennte Fragen',
        lines: [
          '«Wie wird die Adresse dargestellt?» → NAT.',
          '«Darf die Verbindung durch?» → Firewall.',
          '«Kann jemand den Inhalt mitlesen?» → Verschlüsselung prüfen.',
        ],
      },
      check: {
        prompt: 'Deine Verbindung verwendet NAT. Sind ihre Inhalte deswegen verschlüsselt?',
        options: [
          'Ja, umgeschriebene Adressen verschlüsseln alles',
          'Nein, NAT übersetzt Adressen und verschlüsselt den Inhalt nicht',
          'Ja, bei jeder privaten IPv4-Adresse',
        ],
        correct: 1,
        explanation:
          'Adressübersetzung ist keine Inhaltsverschlüsselung. Ein geschützter Inhalt benötigt zusätzlichen Schutz wie TLS.',
      },
      takeaway: 'NAT, Firewall und Verschlüsselung erfüllen unterschiedliche Aufgaben.',
    },
  ],
  tools: [
    {
      id: 'tools-observe',
      title: 'Erst das Fehlerbild eingrenzen',
      explanation: [
        'Eine Website lädt nicht. Ändere jetzt nicht wahllos Einstellungen. Frage zuerst: Betrifft es nur mein Gerät, nur diese Website oder alle Geräte und Dienste?',
        'Prüfe dann von der Verbindung nach oben: Kabel oder WLAN, IP-Konfiguration, Erreichbarkeit, Namensauflösung und den konkreten Dienst.',
        'Jeder Test beantwortet eine begrenzte Frage. Ein einzelner Fehlschlag ist noch kein sicherer Beweis für eine bestimmte Ursache.',
      ],
      example: {
        title: 'Nur dein Notebook ist betroffen',
        lines: [
          'Andere PCs können dieselbe Website öffnen.',
          'Beginne bei deinem Anschluss und deiner Konfiguration.',
          'Ein Ausfall des gesamten Internetanschlusses ist damit weniger naheliegend, aber die konkrete Ursache ist noch nicht bewiesen.',
        ],
      },
      check: {
        prompt: 'Nur dein PC kommt nicht ins Netz. Was ist ein sinnvoller erster Schritt?',
        options: [
          'Alle Router auf Werkseinstellungen zurücksetzen',
          'Eigene Kabel-/WLAN-Verbindung und IP-Einstellungen prüfen',
          'Zufällig DNS und Gateway ändern',
        ],
        correct: 1,
        explanation:
          'Beginne mit dem betroffenen Gerät und überprüfbaren Voraussetzungen. Zufällige Änderungen können zusätzliche Fehler erzeugen, ohne die ursprüngliche Ursache zu klären.',
      },
      takeaway:
        'Vom einfachen Anschluss zum konkreten Dienst prüfen und die Frage jedes Tests kennen.',
    },
    {
      id: 'tools-config',
      title: 'Die tatsächliche Konfiguration ansehen',
      explanation: [
        'Unter Windows zeigt ipconfig /all die vorhandenen Einstellungen, unter anderem IP, Maske, Gateway, DNS, DHCP und MAC. Lies zuerst diese Werte, statt sie zu erraten.',
        'Eine automatisch gewählte 169.254.x.x-Adresse kann darauf hindeuten, dass DHCP nicht funktioniert hat. Prüfe dann Verbindung, Server und gegebenenfalls Relay, bevor du die Ursache festlegst.',
        'arp -a zeigt bekannte lokale IPv4-Nachbarn mit ihren MAC-Adressen. Es ist kein Verzeichnis der MAC-Adressen aller Server im Internet.',
      ],
      example: {
        title: 'Ein falsches Gateway erkennen',
        lines: [
          'PC: 192.168.1.77/26 → lokaler Bereich .64–.127.',
          'Eingetragenes Gateway: 192.168.1.1 → ausserhalb dieses lokalen Netzes.',
          'Im üblichen LAN braucht der PC ein direkt erreichbares Gateway, zum Beispiel .65.',
        ],
      },
      check: {
        prompt:
          'Welcher Windows-Befehl zeigt dir die tatsächlich eingetragenen IP-, Gateway- und DNS-Werte?',
        options: ['ipconfig /all', 'Nur ping 127.0.0.1', 'Nur den Browser-Verlauf öffnen'],
        correct: 0,
        explanation:
          'ipconfig /all zeigt die Konfiguration. Ein Loopback-Ping prüft den eigenen Rechner, zeigt aber nicht die vollständigen Netzwerkeinstellungen.',
      },
      takeaway:
        'Einstellungen anzeigen, mit Netz und Aufgabe vergleichen, erst danach korrigieren.',
    },
    {
      id: 'tools-name-reachability',
      title: 'Erreichbarkeit und DNS getrennt prüfen',
      explanation: [
        'Ping prüft, ob ein Ziel auf ICMP-Echo antwortet. Tracert untersucht, welche Stationen auf Wegproben antworten. Eine fehlende Antwort kann durch Filter entstehen und beweist nicht alleine einen Totalausfall.',
        'Nslookup prüft die Namensauflösung. Wenn eine Verbindung zu einer bekannten Ziel-IP klappt, aber die Namensauflösung scheitert, ist DNS ein sinnvoller nächster Prüfpunkt.',
        'Eine Website direkt mit ihrer IP im Browser zu öffnen ist kein universeller Ersatz für den Namen: Manche Webdienste und Zertifikate benötigen den richtigen Namen. Trenne deshalb die Fragen deiner Tests.',
      ],
      example: {
        title: 'Ein gezielter Vergleich',
        lines: [
          'Verbindung zu einer bekannten Ziel-IP funktioniert.',
          'nslookup example.org liefert keine passende Antwort.',
          'DNS-Konfiguration und DNS-Erreichbarkeit gezielt untersuchen.',
          'Ein Stern in tracert bedeutet zunächst nur: auf diese Probe kam keine Antwort.',
        ],
      },
      check: {
        prompt:
          'Eine bekannte Ziel-IP ist erreichbar, aber nslookup scheitert. Was prüfst du als Nächstes?',
        options: [
          'Gezielt die DNS-Konfiguration und den DNS-Dienst',
          'Sofort alle Netzwerkkabel austauschen',
          'Die Zahlensysteme des Bildschirms',
        ],
        correct: 0,
        explanation:
          'Die Tests grenzen die Namensauflösung als Problem ein. DNS getrennt zu prüfen ist gezielter als unverbundene Hardwareänderungen.',
      },
      takeaway:
        'Keine Ping-Antwort ist kein endgültiger Ausfallbeweis. Namen separat mit nslookup prüfen.',
    },
    {
      id: 'tools-service',
      title: 'Den benötigten Dienst prüfen, dann Pakete ansehen',
      explanation: [
        'Ein erreichbarer Rechner bedeutet noch nicht, dass sein Webdienst erreichbar ist. Test-NetConnection example.org -Port 443 prüft unter Windows den TCP-Verbindungsaufbau zum üblichen HTTPS-Port.',
        'Netstat -an zeigt lokale Verbindungen und lauschende Ports. Wireshark zeichnet sichtbare Netzwerkpakete auf und hilft, DNS-Fragen, TCP-Aufbau oder Wiederholungen zu untersuchen.',
        'Nmap untersucht Ports systematisch. Eure Kursunterlagen schliessen externe Scans aus; hier lernst du seine Aufgabe ohne einen Scan auszuführen.',
      ],
      example: {
        title: 'Name klappt, Website trotzdem nicht',
        lines: [
          'DNS liefert eine passende Adresse.',
          'TCP-Port 443 mit Test-NetConnection prüfen.',
          'Bei unklaren Ergebnissen in Wireshark nach DNS- oder TCP-Verkehr schauen.',
          'Eine erfolgreiche TCP-Verbindung beweist noch nicht, dass TLS und die eigentliche Website fehlerfrei funktionieren.',
        ],
      },
      check: {
        prompt:
          'DNS funktioniert. Du möchtest gezielt prüfen, ob der klassische HTTPS-TCP-Port erreichbar ist. Welcher Test passt?',
        options: ['Nur ping 127.0.0.1', 'Test-NetConnection example.org -Port 443', 'Nur arp -a'],
        correct: 1,
        explanation:
          'Test-NetConnection mit Port 443 prüft den TCP-Aufbau zu diesem Dienst. Ping und die ARP-Tabelle beantworten andere Fragen.',
      },
      takeaway:
        'Konfiguration → Erreichbarkeit → DNS → Dienst. Mit Paketen weiter eingrenzen, wenn nötig.',
    },
  ],
};
