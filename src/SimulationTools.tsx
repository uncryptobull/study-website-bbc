import { useState } from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import { formatIP, parseIP, subnet } from './network';

export type RouteEntry = {
  id: string;
  destination: string;
  gateway: string;
  interface: string;
  metric: string;
};

function routeNetwork(destination: string) {
  const parts = destination.trim().split('/');
  if (parts.length !== 2) throw new Error('Zielnetz als IPv4/Präfix eingeben.');
  return subnet(parts[0], parts[1]);
}

/** Compare prefix lengths first; a metric only resolves equally specific routes. */
export function exploreRoutes(target: string, entries: RouteEntry[]) {
  const address = parseIP(target);
  const routes = entries.map((entry, index) => {
    try {
      const network = routeNetwork(entry.destination);
      if (entry.gateway.trim()) parseIP(entry.gateway);
      if (!entry.interface.trim()) throw new Error('Eine Schnittstelle angeben.');
      if (!/^\d{1,5}$/.test(entry.metric) || Number(entry.metric) > 65535)
        throw new Error('Die Metrik muss eine ganze Zahl von 0 bis 65535 sein.');
      return {
        ...entry,
        gateway: entry.gateway.trim(),
        network,
        metricValue: Number(entry.metric),
        matches: address >= network.network && address <= network.last,
      };
    } catch (error) {
      throw new Error(
        `Route ${index + 1}: ${error instanceof Error ? error.message : 'Ungültige Eingabe.'}`,
      );
    }
  });
  const matching = routes.filter((route) => route.matches);
  const longestPrefix = Math.max(-1, ...matching.map((route) => route.network.prefix));
  const mostSpecific = matching.filter((route) => route.network.prefix === longestPrefix);
  const lowestMetric = Math.min(Infinity, ...mostSpecific.map((route) => route.metricValue));
  return {
    address,
    routes,
    selected: mostSpecific.filter((route) => route.metricValue === lowestMetric),
  };
}

const exampleRoutes: RouteEntry[] = [
  {
    id: 'default',
    destination: '0.0.0.0/0',
    gateway: '192.0.2.1',
    interface: 'wan0',
    metric: '10',
  },
  {
    id: 'wide',
    destination: '203.0.113.0/24',
    gateway: '192.0.2.2',
    interface: 'wan1',
    metric: '5',
  },
  {
    id: 'narrow',
    destination: '203.0.113.128/25',
    gateway: '192.0.2.3',
    interface: 'wan2',
    metric: '20',
  },
  { id: 'local', destination: '203.0.113.160/27', gateway: '', interface: 'lan0', metric: '30' },
];

function attempt<T>(
  compute: () => T,
): { value: T; error?: never } | { value?: never; error: string } {
  try {
    return { value: compute() };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Ungültige Eingabe.' };
  }
}

export function RoutingTableExplorer() {
  const [target, setTarget] = useState('203.0.113.174');
  const [routes, setRoutes] = useState<RouteEntry[]>(() =>
    exampleRoutes.map((route) => ({ ...route })),
  );
  const [sequence, setSequence] = useState(1);
  const result = attempt(() => exploreRoutes(target, routes));
  const selection = new Set(result.value?.selected.map((route) => route.id));
  function update(id: string, field: keyof Omit<RouteEntry, 'id'>, value: string) {
    setRoutes((current) =>
      current.map((route) => (route.id === id ? { ...route, [field]: value } : route)),
    );
  }
  return (
    <section className="card simulation-tool" aria-labelledby="route-tool-title">
      <div className="section-top">
        <div>
          <p className="eyebrow">SELBST AUSPROBIEREN</p>
          <h2 id="route-tool-title">Welche Route gewinnt?</h2>
        </div>
        <button
          className="button secondary"
          onClick={() => {
            setRoutes(exampleRoutes.map((route) => ({ ...route })));
            setTarget('203.0.113.174');
          }}
        >
          <RotateCcw size={15} /> Beispiel zurücksetzen
        </button>
      </div>
      <p>
        Ändere die Zieladresse oder bearbeite die Tabelle. Der längste passende Präfix gewinnt, auch
        wenn eine kürzere Route eine kleinere Metrik hat.
      </p>
      <div className="input-row tool-inputs">
        <label className="grow">
          Zieladresse des Pakets
          <input
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            spellCheck={false}
            autoComplete="off"
            aria-invalid={Boolean(attempt(() => parseIP(target)).error)}
            aria-describedby={result.error ? 'route-input-error' : 'route-rule'}
          />
        </label>
      </div>
      <div className="presets">
        <span>Ziel wählen</span>
        {['203.0.113.174', '203.0.113.140', '203.0.113.42', '198.51.100.8'].map((ip) => (
          <button key={ip} onClick={() => setTarget(ip)}>
            {ip}
          </button>
        ))}
      </div>
      <div className="table-scroll">
        <table className="route-table">
          <caption className="sr-only">
            Bearbeitbare Routingtabelle. Das Ergebnis markiert die ausgewählte Route.
          </caption>
          <thead>
            <tr>
              <th scope="col">Zielnetz / Präfix</th>
              <th scope="col">Gateway</th>
              <th scope="col">Schnittstelle</th>
              <th scope="col">Metrik</th>
              <th scope="col">Ergebnis</th>
              <th scope="col">
                <span className="sr-only">Aktion</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route, index) => {
              const calculated = result.value?.routes.find((item) => item.id === route.id);
              const normalised = calculated
                ? `${formatIP(calculated.network.network)}/${calculated.network.prefix}`
                : '';
              return (
                <tr key={route.id} className={selection.has(route.id) ? 'selected-row' : ''}>
                  <td>
                    <input
                      value={route.destination}
                      aria-label={`Zielnetz Route ${index + 1}`}
                      onChange={(event) => update(route.id, 'destination', event.target.value)}
                      spellCheck={false}
                      autoComplete="off"
                      aria-invalid={Boolean(attempt(() => routeNetwork(route.destination)).error)}
                      aria-describedby={result.error ? 'route-input-error' : undefined}
                    />
                    {normalised && normalised !== route.destination && (
                      <span className="caption">Netz: {normalised}</span>
                    )}
                  </td>
                  <td>
                    <input
                      value={route.gateway}
                      aria-label={`Gateway Route ${index + 1}`}
                      placeholder="Direkt verbunden"
                      onChange={(event) => update(route.id, 'gateway', event.target.value)}
                      spellCheck={false}
                      autoComplete="off"
                      aria-invalid={Boolean(
                        route.gateway.trim() && attempt(() => parseIP(route.gateway)).error,
                      )}
                      aria-describedby={result.error ? 'route-input-error' : undefined}
                    />
                  </td>
                  <td>
                    <input
                      value={route.interface}
                      aria-label={`Schnittstelle Route ${index + 1}`}
                      onChange={(event) => update(route.id, 'interface', event.target.value)}
                      aria-invalid={!route.interface.trim()}
                      aria-describedby={result.error ? 'route-input-error' : undefined}
                    />
                  </td>
                  <td>
                    <input
                      value={route.metric}
                      aria-label={`Metrik Route ${index + 1}`}
                      inputMode="numeric"
                      onChange={(event) => update(route.id, 'metric', event.target.value)}
                      aria-invalid={!/^\d{1,5}$/.test(route.metric) || Number(route.metric) > 65535}
                      aria-describedby={result.error ? 'route-input-error' : undefined}
                    />
                  </td>
                  <td>
                    {!calculated
                      ? '—'
                      : selection.has(route.id)
                        ? 'Ausgewählt'
                        : calculated.matches
                          ? 'Passt ebenfalls'
                          : 'Kein Treffer'}
                  </td>
                  <td>
                    <button
                      className="icon-button tool-table-action"
                      aria-label={`Route ${index + 1} entfernen`}
                      onClick={() =>
                        setRoutes((current) => current.filter((item) => item.id !== route.id))
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="tool-actions">
        <button
          className="button secondary"
          disabled={routes.length >= 8}
          onClick={() => {
            setRoutes((current) => [
              ...current,
              {
                id: `added-${sequence}`,
                destination: '198.51.100.0/24',
                gateway: '192.0.2.4',
                interface: 'wan3',
                metric: '10',
              },
            ]);
            setSequence((current) => current + 1);
          }}
        >
          <Plus size={15} /> Route hinzufügen
        </button>
        <span className="caption">
          Bis zu 8 Routen. Ein leeres Gateway bedeutet direkt verbunden.
        </span>
      </div>
      {result.error ? (
        <p className="error" id="route-input-error" role="alert">
          {result.error}
        </p>
      ) : (
        <div
          className={`explanation ${result.value?.selected.length ? 'success' : ''}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {!result.value?.selected.length ? (
            <>
              <strong>Keine passende Route.</strong>
              <p>
                Das Paket wird verworfen. Eine Standardroute 0.0.0.0/0 würde jedes Ziel abdecken.
              </p>
            </>
          ) : (
            <>
              <strong>
                {result.value.selected.length > 1
                  ? 'Mehrere gleichwertige Routen.'
                  : 'Ausgewählte Route:'}{' '}
                {result.value.selected
                  .map((route) => `${formatIP(route.network.network)}/${route.network.prefix}`)
                  .join(', ')}
              </strong>
              {result.value.selected.map((route) => (
                <p key={route.id}>
                  {route.gateway
                    ? `Nächster Hop: ${route.gateway}`
                    : 'Direkt verbunden; das Ziel wird auf dem lokalen Link erreicht'}{' '}
                  · Schnittstelle {route.interface} · Metrik {route.metric}.
                </p>
              ))}
              {result.value.selected.length > 1 && (
                <p>
                  Reale Router können gleichwertige Wege mit ECMP nutzen. Dieses Modell zeigt alle
                  gleichwertigen Einträge.
                </p>
              )}
            </>
          )}
        </div>
      )}
      <p className="caption" id="route-rule">
        Lernmodell mit IPv4-Dokumentationsadressen: zuerst längster Präfix, dann kleinste Metrik bei
        gleichem Präfix. Routing-Protokolle und administrative Distanz sind hier nicht modelliert.
      </p>
    </section>
  );
}

export type PATMapping = {
  id: string;
  internalIP: string;
  internalPort: number;
  publicPort: number;
  remoteIP: string;
  remotePort: number;
};

export const PAT_PUBLIC_IP = '198.51.100.5';
const PAT_SERVER_IP = '203.0.113.80';

export function parsePort(value: string | number): number {
  if (!/^\d{1,5}$/.test(String(value)) || Number(value) < 1 || Number(value) > 65535)
    throw new Error('Ein TCP-Port muss eine ganze Zahl von 1 bis 65535 sein.');
  return Number(value);
}

export function addPATMapping(
  mappings: PATMapping[],
  internalIP: string,
  internalPort: string,
  id: string,
): PATMapping {
  const source = subnet(internalIP, 24);
  if (source.network !== parseIP('192.168.1.0') || !source.validHost)
    throw new Error(
      'Für dieses Beispiel eine Hostadresse von 192.168.1.1 bis 192.168.1.254 verwenden.',
    );
  const port = parsePort(internalPort);
  const canonicalIP = formatIP(source.address);
  if (
    mappings.some(
      (mapping) =>
        mapping.internalIP === canonicalIP &&
        mapping.internalPort === port &&
        mapping.remoteIP === PAT_SERVER_IP &&
        mapping.remotePort === 443,
    )
  )
    throw new Error(
      'Für diese TCP-Verbindung besteht bereits eine Zuordnung. Ändere die IP oder den lokalen Port.',
    );
  const used = new Set(mappings.map((mapping) => mapping.publicPort));
  let publicPort = 40001;
  while (used.has(publicPort) && publicPort <= 60999) publicPort += 1;
  if (publicPort > 60999)
    throw new Error('Im Beispiel ist kein freier öffentlicher Port mehr verfügbar.');
  return {
    id,
    internalIP: canonicalIP,
    internalPort: port,
    publicPort,
    remoteIP: PAT_SERVER_IP,
    remotePort: 443,
  };
}

export function receivePATReply(
  mappings: PATMapping[],
  publicPort: string | number,
  remoteIP = PAT_SERVER_IP,
  remotePort = 443,
) {
  const port = parsePort(publicPort);
  const remote = formatIP(parseIP(remoteIP));
  const serverPort = parsePort(remotePort);
  return (
    mappings.find(
      (mapping) =>
        mapping.publicPort === port &&
        mapping.remoteIP === remote &&
        mapping.remotePort === serverPort,
    ) ?? null
  );
}

function exampleMappings(): PATMapping[] {
  const first = addPATMapping([], '192.168.1.10', '51514', 'first');
  return [first, addPATMapping([first], '192.168.1.11', '51514', 'second')];
}

export function PATMappingExplorer() {
  const [mappings, setMappings] = useState<PATMapping[]>(exampleMappings);
  const [internalIP, setInternalIP] = useState('192.168.1.12');
  const [internalPort, setInternalPort] = useState('51514');
  const [replyPort, setReplyPort] = useState('40002');
  const [sequence, setSequence] = useState(1);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const reply = attempt(() => receivePATReply(mappings, replyPort));
  const sourceValidation = attempt(() =>
    addPATMapping(mappings, internalIP, internalPort, 'preview'),
  );
  return (
    <section className="card simulation-tool" aria-labelledby="pat-tool-title">
      <div className="section-top">
        <div>
          <p className="eyebrow">SELBST AUSPROBIEREN</p>
          <h2 id="pat-tool-title">Eine öffentliche IP, mehrere Verbindungen</h2>
        </div>
        <button
          className="button secondary"
          onClick={() => {
            setMappings(exampleMappings());
            setInternalIP('192.168.1.12');
            setInternalPort('51514');
            setReplyPort('40002');
            setError('');
            setStatus('Beispiel zurückgesetzt.');
          }}
        >
          <RotateCcw size={15} /> Beispiel zurücksetzen
        </button>
      </div>
      <p>
        Beide Geräte benutzen lokal denselben TCP-Port. PAT übersetzt sie in verschiedene
        öffentliche Ports, damit die Antwort beim richtigen Gerät ankommt.
      </p>
      <div className="mapping-flow">
        <code>LAN 192.168.1.0/24</code>
        <span aria-hidden="true">→</span>
        <code>Router {PAT_PUBLIC_IP}</code>
        <span aria-hidden="true">→</span>
        <code>Server {PAT_SERVER_IP}:443</code>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (mappings.length >= 12) return;
          if (!sourceValidation.value) {
            setError(sourceValidation.error);
            setStatus('');
            return;
          }
          const mapping = { ...sourceValidation.value, id: `added-${sequence}` };
          setMappings((current) => [...current, mapping]);
          setSequence((current) => current + 1);
          setReplyPort(String(mapping.publicPort));
          setError('');
          setStatus(
            `Verbindung hinzugefügt: ${mapping.internalIP}:${mapping.internalPort} wird auf ${PAT_PUBLIC_IP}:${mapping.publicPort} übersetzt.`,
          );
        }}
      >
        <div className="input-row tool-inputs">
          <label className="grow">
            Interne IPv4-Adresse
            <input
              value={internalIP}
              onChange={(event) => {
                setInternalIP(event.target.value);
                setError('');
              }}
              spellCheck={false}
              autoComplete="off"
              aria-describedby={error ? 'pat-input-error pat-model' : 'pat-model'}
              aria-invalid={Boolean(error)}
            />
          </label>
          <label>
            Lokaler TCP-Port
            <input
              value={internalPort}
              onChange={(event) => {
                setInternalPort(event.target.value);
                setError('');
              }}
              inputMode="numeric"
              autoComplete="off"
              aria-describedby={error ? 'pat-input-error' : undefined}
              aria-invalid={Boolean(error)}
            />
          </label>
          <button type="submit" className="button secondary" disabled={mappings.length >= 12}>
            <Plus size={15} /> Verbindung öffnen
          </button>
        </div>
      </form>
      {error && (
        <p className="error" role="alert" id="pat-input-error">
          {error}
        </p>
      )}
      <p className="caption" role="status">
        {status || `${mappings.length} von maximal 12 Verbindungen im Beispiel.`}
      </p>
      <div className="table-scroll">
        <table className="pat-table">
          <caption className="sr-only">
            TCP-PAT-Tabelle mit internen und öffentlichen Ports. Die passende Antwort markiert ihr
            Zielgerät.
          </caption>
          <thead>
            <tr>
              <th scope="col">Intern: IP und Port</th>
              <th scope="col">Öffentlich: IP und Port</th>
              <th scope="col">Zielserver</th>
              <th scope="col">Antwort</th>
              <th scope="col">
                <span className="sr-only">Aktion</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((mapping) => (
              <tr key={mapping.id} className={reply.value?.id === mapping.id ? 'selected-row' : ''}>
                <td>
                  <code>
                    {mapping.internalIP}:{mapping.internalPort}
                  </code>
                </td>
                <td>
                  <code>
                    {PAT_PUBLIC_IP}:{mapping.publicPort}
                  </code>
                </td>
                <td>
                  <code>
                    {mapping.remoteIP}:{mapping.remotePort}
                  </code>
                </td>
                <td>{reply.value?.id === mapping.id ? 'Dieses Gerät' : '—'}</td>
                <td>
                  <button
                    className="icon-button tool-table-action"
                    aria-label={`Verbindung ${mapping.internalIP}:${mapping.internalPort} schliessen`}
                    onClick={() => {
                      setMappings((current) => current.filter((item) => item.id !== mapping.id));
                      setError('');
                      setStatus(
                        `Verbindung zu ${mapping.internalIP}:${mapping.internalPort} geschlossen; öffentlicher Port ${mapping.publicPort} ist wieder frei.`,
                      );
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="input-row tool-inputs">
        <label className="grow">
          Antwort des Servers an öffentlichen TCP-Port
          <input
            value={replyPort}
            onChange={(event) => setReplyPort(event.target.value)}
            inputMode="numeric"
            autoComplete="off"
            aria-invalid={Boolean(reply.error)}
            aria-describedby={reply.error ? 'pat-reply-error' : 'pat-reply-result'}
          />
        </label>
      </div>
      <div className="presets">
        <span>Antwort testen</span>
        {[...mappings.map((mapping) => mapping.publicPort), 49999].map((port) => (
          <button key={port} onClick={() => setReplyPort(String(port))}>
            {port === 49999 ? '49999 · unbekannt' : port}
          </button>
        ))}
      </div>
      {reply.error ? (
        <p className="error" role="alert" id="pat-reply-error">
          {reply.error}
        </p>
      ) : (
        <div
          className={`explanation ${reply.value ? 'success' : ''}`}
          id="pat-reply-result"
          aria-live="polite"
          aria-atomic="true"
        >
          {reply.value ? (
            <>
              <strong>
                Die Antwort erreicht {reply.value.internalIP}:{reply.value.internalPort}.
              </strong>
              <p>
                Der Server sendet an {PAT_PUBLIC_IP}:{reply.value.publicPort}. Der Router findet die
                Zuordnung, ersetzt Ziel-IP und Zielport und leitet das Paket ins LAN weiter.
              </p>
            </>
          ) : (
            <>
              <strong>Keine passende Zuordnung.</strong>
              <p>
                Für Port {replyPort} ist keine Verbindung zu diesem Server gespeichert. Das Modell
                verwirft die Antwort.
              </p>
            </>
          )}
        </div>
      )}
      <p className="caption" id="pat-model">
        Vereinfachtes TCP-Lernmodell: LAN 192.168.1.0/24, ein HTTPS-Server, Beispielports ab 40001.
        IPs im Internet stammen aus Dokumentationsbereichen. Reale Router vergeben Ports nach
        eigenen Regeln und löschen inaktive Zuordnungen automatisch.
      </p>
    </section>
  );
}
