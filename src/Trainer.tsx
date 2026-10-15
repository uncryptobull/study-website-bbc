import { useMemo, useRef, useState } from 'react';
import { ArrowRight, Binary, Check, ChevronDown, Network, Shuffle } from 'lucide-react';
import { bits, compareNetworks, formatIP, splitNetwork, subnet } from './network';

type TrainerMode = 'ip' | 'binary' | 'compare' | 'split';
const trainerTabs = [
  ['ip', 'IPv4 & Subnetting'],
  ['binary', 'Binärtrainer'],
  ['compare', 'Netzvergleich'],
  ['split', 'FLSM aufteilen'],
] as const;
export default function Trainer() {
  const [mode, setMode] = useState<TrainerMode>('ip');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">NETZWERK-LABOR</p>
          <h1>
            Adressen berechnen<span>.</span>
          </h1>
          <p>Subnetze berechnen, Bits umschalten und zwei Netzkonfigurationen vergleichen.</p>
        </div>
        <div className="label-pill">
          <Network size={16} /> Vier Werkzeuge
        </div>
      </div>
      <div className="tabs" role="tablist" aria-label="Trainer auswählen">
        {trainerTabs.map(([id, label], index) => (
          <button
            key={id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            id={`trainer-tab-${id}`}
            role="tab"
            aria-selected={mode === id}
            aria-controls={`trainer-panel-${id}`}
            tabIndex={mode === id ? 0 : -1}
            onClick={() => setMode(id)}
            onKeyDown={(event) => {
              const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
              if (!keys.includes(event.key)) return;
              event.preventDefault();
              const next =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? trainerTabs.length - 1
                    : (index + (event.key === 'ArrowRight' ? 1 : -1) + trainerTabs.length) %
                      trainerTabs.length;
              setMode(trainerTabs[next][0]);
              tabRefs.current[next]?.focus();
            }}
            className={mode === id ? 'active' : ''}
          >
            {label}
          </button>
        ))}
      </div>
      {trainerTabs.map(([id]) => (
        <div
          key={id}
          id={`trainer-panel-${id}`}
          role="tabpanel"
          aria-labelledby={`trainer-tab-${id}`}
          hidden={mode !== id}
        >
          {id === 'ip' ? (
            <IPTrainer />
          ) : id === 'binary' ? (
            <BinaryTrainer />
          ) : id === 'compare' ? (
            <CompareTrainer />
          ) : (
            <SplitTrainer />
          )}
        </div>
      ))}
    </>
  );
}
function safely<T>(fn: () => T): { value: T; error?: never } | { value?: never; error: string } {
  try {
    return { value: fn() };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Ungültige Eingabe.' };
  }
}
function BitLine({ label, value, prefix }: { label: string; value: number; prefix: number }) {
  return (
    <div className="bit-line">
      <span className="bit-label">{label}</span>
      <div className="octets">
        {[0, 1, 2, 3].map((o) => (
          <div className="octet" key={o}>
            {bits(value)
              .slice(o * 8, o * 8 + 8)
              .split('')
              .map((b, i) => (
                <span
                  key={i}
                  className={o * 8 + i < prefix ? 'network-bit' : 'host-bit'}
                  title={`${o * 8 + i + 1}. Bit · ${o * 8 + i < prefix ? 'Netzteil' : 'Hostteil'}`}
                >
                  {b}
                </span>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
function IPTrainer() {
  const [ip, setIP] = useState('192.168.1.77');
  const [prefix, setPrefix] = useState('26');
  const [showAnd, setShowAnd] = useState(false);
  const result = safely(() => subnet(ip, prefix));
  const r = result.value;
  return (
    <div className="trainer-layout">
      <div>
        <section className="card trainer-input">
          <div className="section-top">
            <div>
              <p className="eyebrow">01 / AUSGANGSLAGE</p>
              <h2>IPv4-Adresse und Präfix</h2>
            </div>
            <Network className="muted" />
          </div>
          <div className="input-row">
            <label className="grow">
              IPv4-Adresse
              <input
                id="trainer-ip"
                value={ip}
                onChange={(e) => setIP(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                aria-invalid={Boolean(safely(() => subnet(ip, '24')).error)}
                aria-describedby={result.error ? 'ip-input-error ip-input-hint' : 'ip-input-hint'}
                placeholder="192.168.1.77"
              />
            </label>
            <label className="prefix-input">
              Präfix / CIDR
              <div className="prefix-control">
                <span>/</span>
                <input
                  aria-label="Präfix"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  inputMode="numeric"
                  autoComplete="off"
                  aria-invalid={Boolean(safely(() => subnet('192.168.1.1', prefix)).error)}
                  aria-describedby={result.error ? 'ip-input-error ip-input-hint' : 'ip-input-hint'}
                />
              </div>
            </label>
          </div>
          <p className="caption" id="ip-input-hint">
            Vier Oktette von 0 bis 255; ein Präfix von 0 bis 32. Beispiel: 192.168.1.77/26.
          </p>
          <div className="presets">
            <span>Beispiel laden</span>
            {[
              ['/24', '192.168.1.77', '24'],
              ['/26', '192.168.1.77', '26'],
              ['/20', '10.7.34.80', '20'],
              ['/31', '10.0.0.0', '31'],
              ['/32', '10.0.0.1', '32'],
            ].map(([label, a, p]) => (
              <button
                key={p}
                onClick={() => {
                  setIP(a);
                  setPrefix(p);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {result.error && (
            <p className="error" id="ip-input-error" role="alert">
              {result.error}
            </p>
          )}
          {r && (
            <>
              <label className="range-label" htmlFor="prefix-range">
                Netzgrösse verändern{' '}
                <strong>
                  /{r.prefix} · {32 - r.prefix} Hostbits
                </strong>
              </label>
              <input
                id="prefix-range"
                className="range"
                type="range"
                min="0"
                max="32"
                value={r.prefix}
                onChange={(e) => setPrefix(e.target.value)}
              />
              <div className="range-ends">
                <span>Grössere Netze</span>
                <span>Kleinere Netze</span>
              </div>
            </>
          )}
        </section>
        {r && (
          <>
            <section className="card bit-card">
              <div className="section-top">
                <div>
                  <p className="eyebrow">02 / DIE BITS DAHINTER</p>
                  <h2>Netz- und Hostbits</h2>
                </div>
                <div className="legend">
                  <span>
                    <i className="net-dot" />
                    Netzbits ({r.prefix})
                  </span>
                  <span>
                    <i className="host-dot" />
                    Hostbits ({32 - r.prefix})
                  </span>
                </div>
              </div>
              <BitLine label="IP" value={r.address} prefix={r.prefix} />
              <BitLine label="Maske" value={r.mask} prefix={r.prefix} />
              <BitLine label="Netz" value={r.network} prefix={r.prefix} />
              <p className="caption">
                Einsen in der Maske markieren den Netzteil. Nullen markieren den Hostteil.
              </p>
              <button
                className="text-button"
                onClick={() => setShowAnd(!showAnd)}
                aria-expanded={showAnd}
              >
                Bitweises AND verstehen <ChevronDown size={15} />
              </button>
              {showAnd && (
                <div className="explanation">
                  <strong>Nur 1 AND 1 ergibt 1.</strong>
                  <p>0 AND 0 = 0 · 0 AND 1 = 0 · 1 AND 0 = 0 · 1 AND 1 = 1</p>
                  <p>
                    Die Netzbits bleiben erhalten, alle Hostbits werden 0. Deshalb ergibt {ip} AND{' '}
                    {formatIP(r.mask)} die Netzadresse <strong>{formatIP(r.network)}</strong>.
                  </p>
                </div>
              )}
            </section>
            <section className="card">
              <p className="eyebrow">03 / SELBST ERKLÄREN</p>
              <h2>Warum genau {r.usable.toLocaleString('de-CH')}?</h2>
              <p>
                {32 - r.prefix} Hostbits ergeben 2<sup>{32 - r.prefix}</sup> ={' '}
                {r.size.toLocaleString('de-CH')} Adressen.{' '}
                {r.prefix < 31
                  ? 'Netzadresse und Broadcast sind reserviert. Ziehe zwei ab, um die nutzbaren Hostadressen zu erhalten.'
                  : r.prefix === 31
                    ? 'Auf einem /31-Punkt-zu-Punkt-Link sind beide Adressen nutzbar. Es gibt keinen Broadcast.'
                    : 'Ein /32 bezeichnet genau eine Adresse, etwa eine Hostroute. Es gibt keinen separaten Broadcast.'}
              </p>
              {!r.validHost && (
                <p className="notice">
                  Die eingegebene Adresse ist{' '}
                  {r.address === r.network ? 'die Netzadresse' : 'die Broadcastadresse'} und in
                  diesem üblichen Broadcast-Subnetz keine nutzbare Hostadresse.
                </p>
              )}
            </section>
          </>
        )}
      </div>
      <aside className="card result-card">
        <p className="eyebrow">DEIN ERGEBNIS</p>
        <h2>Netz auf einen Blick</h2>
        {r ? (
          <>
            <div className="network-result">
              <span>Netzadresse</span>
              <strong>
                {formatIP(r.network)}
                <small>/{r.prefix}</small>
              </strong>
            </div>
            <dl>
              {[
                ['Netzmaske', formatIP(r.mask)],
                ['Erster Host', formatIP(r.firstHost)],
                ['Letzter Host', formatIP(r.lastHost)],
                ['Broadcast', r.broadcast === null ? 'Kein Broadcast' : formatIP(r.broadcast)],
                ['Nutzbare Adressen', r.usable.toLocaleString('de-CH')],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="tip">
              <Check size={18} />
              <span>
                {r.prefix === 31
                  ? 'Sonderfall: /31 für Punkt-zu-Punkt.'
                  : r.prefix === 32
                    ? 'Sonderfall: /32 als einzelne Adresse.'
                    : 'Routerinterfaces zählen ebenfalls als Hosts.'}
              </span>
            </div>
          </>
        ) : (
          <p>Prüfe die Eingaben, um das Ergebnis zu sehen.</p>
        )}
      </aside>
    </div>
  );
}
function BinaryTrainer() {
  const [value, setValue] = useState(77);
  const [target, setTarget] = useState(168);
  const binary = value.toString(2).padStart(8, '0');
  return (
    <div className="card binary-trainer">
      <p className="eyebrow">ACHT BITS. 256 MÖGLICHKEITEN.</p>
      <h2>Binär und dezimal</h2>
      <p>Klicke auf die Bits. Jede 1 zählt ihren Stellenwert mit.</p>
      <div className="binary-switches">
        {[128, 64, 32, 16, 8, 4, 2, 1].map((weight, i) => (
          <div key={weight}>
            <span>{weight}</span>
            <button
              className={binary[i] === '1' ? 'on' : ''}
              aria-label={`Bit mit Stellenwert ${weight}`}
              aria-pressed={binary[i] === '1'}
              onClick={() => setValue(value ^ weight)}
            >
              {binary[i]}
            </button>
          </div>
        ))}
      </div>
      <div className="binary-total">
        <div>
          <span>Dezimal</span>
          <strong aria-live="polite" aria-atomic="true">
            {value}
          </strong>
        </div>
        <div>
          <span>Hexadezimal</span>
          <strong>{value.toString(16).toUpperCase().padStart(2, '0')}</strong>
        </div>
        <div>
          <span>Deine Rechnung</span>
          <p>
            {[128, 64, 32, 16, 8, 4, 2, 1].filter((w) => (value & w) !== 0).join(' + ') || '0'} ={' '}
            {value}
          </p>
        </div>
      </div>
      <div className="mini-challenge">
        <Binary />
        <div>
          <h3>Übung: Stelle {target} dar.</h3>
          <p aria-live="polite">
            {value === target
              ? 'Geschafft! Die gesetzten Stellenwerte ergeben genau die gesuchte Zahl.'
              : 'Schalte die passenden Bits ein. Du brauchst keine Vorlage.'}
          </p>
        </div>
        <button
          className="button secondary"
          onClick={() => {
            setTarget((previous) => (previous + 1 + Math.floor(Math.random() * 255)) % 256);
            setValue(0);
          }}
        >
          <Shuffle size={16} />
          Neue Zahl
        </button>
      </div>
    </div>
  );
}
function CompareTrainer() {
  const [a, setA] = useState('192.168.1.10');
  const [b, setB] = useState('192.168.1.130');
  const [pa, setPa] = useState('24');
  const [pb, setPb] = useState('25');
  const result = safely(() => compareNetworks(a, pa, b, pb));
  const r = result.value;
  return (
    <section className="card">
      <p className="eyebrow">ZWEI SICHTWEISEN PRÜFEN</p>
      <h2>Können sie direkt miteinander sprechen?</h2>
      <p>
        Beide Geräte müssen das jeweils andere als lokal behandeln. Wir prüfen die Adressierung;
        gleicher Link/VLAN, funktionierende Verbindung und passende Firewallregeln werden
        vorausgesetzt.
      </p>
      <div className="compare-inputs">
        {[
          [a, setA, pa, setPa, 'Gerät A'],
          [b, setB, pb, setPb, 'Gerät B'],
        ].map(([ip, change, p, changeP, label]) => (
          <div key={label as string} className="inset">
            <h3>{label as string}</h3>
            <div className="input-row">
              <label className="grow">
                IPv4-Adresse
                <input
                  aria-label={`IP ${label}`}
                  value={ip as string}
                  spellCheck={false}
                  autoComplete="off"
                  aria-invalid={Boolean(safely(() => subnet(ip as string, '24')).error)}
                  aria-describedby={result.error ? 'compare-input-error' : undefined}
                  onChange={(e) => (change as (v: string) => void)(e.target.value)}
                />
              </label>
              <label className="prefix-input">
                Präfix
                <input
                  aria-label={`Präfix ${label}`}
                  value={p as string}
                  inputMode="numeric"
                  autoComplete="off"
                  aria-invalid={Boolean(safely(() => subnet('192.168.1.1', p as string)).error)}
                  aria-describedby={result.error ? 'compare-input-error' : undefined}
                  onChange={(e) => (changeP as (v: string) => void)(e.target.value)}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
      {result.error ? (
        <p className="error" id="compare-input-error" role="alert">
          {result.error}
        </p>
      ) : (
        r && (
          <div className={`explanation ${r.direct ? 'success' : ''}`} aria-live="polite">
            <h3>
              {r.direct
                ? 'Die IP-Konfiguration erlaubt direkte lokale Kommunikation.'
                : !r.distinct
                  ? 'Adresskonflikt: Beide Geräte haben dieselbe IP.'
                  : 'Die Konfiguration ist für direkte Kommunikation ungeeignet.'}
            </h3>
            <p>
              A befindet sich in {formatIP(r.a.network)}/{r.a.prefix} und behandelt B als{' '}
              <strong>{r.aLocal ? 'lokal' : 'entfernt'}</strong>.
            </p>
            <p>
              B befindet sich in {formatIP(r.b.network)}/{r.b.prefix} und behandelt A als{' '}
              <strong>{r.bLocal ? 'lokal' : 'entfernt'}</strong>.
            </p>
            {(!r.a.validHost || !r.b.validHost) && (
              <p>Mindestens eine Adresse ist eine reservierte Netz- oder Broadcastadresse.</p>
            )}
            {r.aLocal !== r.bLocal && (
              <p>
                Unterschiedliche Masken führen hier zu einer asymmetrischen Sicht. Für eine normale
                Kommunikation ohne Router müssen beide Seiten das Ziel lokal erreichen können.
              </p>
            )}
          </div>
        )
      )}
    </section>
  );
}
function SplitTrainer() {
  const [ip, setIP] = useState('192.168.20.0');
  const [original, setOriginal] = useState('24');
  const [target, setTarget] = useState('26');
  const result = useMemo(
    () => safely(() => splitNetwork(ip, original, target)),
    [ip, original, target],
  );
  const r = result.value;
  return (
    <section className="card">
      <p className="eyebrow">GLEICH GROSSE SUBNETZE</p>
      <h2>FLSM: Ein Netz aufteilen.</h2>
      <p>Ein längerer Präfix unterteilt deinen Ausgangsbereich in gleich grosse Subnetze.</p>
      <div className="input-row">
        <label className="grow">
          Adresse im Ausgangsnetz
          <input
            value={ip}
            onChange={(e) => setIP(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            aria-invalid={Boolean(safely(() => subnet(ip, '24')).error)}
            aria-describedby={result.error ? 'split-input-error' : undefined}
          />
        </label>
        <label>
          Alter Präfix
          <input
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            aria-label="Alter Präfix"
            inputMode="numeric"
            autoComplete="off"
            aria-invalid={Boolean(safely(() => subnet('192.168.1.1', original)).error)}
            aria-describedby={result.error ? 'split-input-error' : undefined}
          />
        </label>
        <ArrowRight className="input-arrow" />
        <label>
          Neuer Präfix
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            aria-label="Neuer Präfix"
            inputMode="numeric"
            autoComplete="off"
            aria-invalid={Boolean(
              safely(() => splitNetwork('192.168.1.1', original, target)).error,
            )}
            aria-describedby={result.error ? 'split-input-error' : undefined}
          />
        </label>
      </div>
      {result.error ? (
        <p className="error" id="split-input-error" role="alert">
          {result.error}
        </p>
      ) : (
        r && (
          <>
            <div className="explanation">
              <strong>
                {r.count.toLocaleString('de-CH')} gleich grosse Subnetze aus{' '}
                {formatIP(r.base.network)}/{r.base.prefix}
              </strong>
              <p>
                2<sup>{r.rows[0].prefix - r.base.prefix}</sup> = {r.count.toLocaleString('de-CH')}{' '}
                Subnetze. Jedes hat {r.rows[0].size.toLocaleString('de-CH')} Adressen, davon{' '}
                {r.rows[0].usable.toLocaleString('de-CH')} nutzbar
                {r.rows[0].prefix === 31 ? ' auf Punkt-zu-Punkt-Links' : ''}.
              </p>
              {r.base.address !== r.base.network && (
                <p>
                  Deine Ausgangsadresse liegt im Netz {formatIP(r.base.network)}/{r.base.prefix}.
                  Aufgeteilt wird dieses ganze Netz.
                </p>
              )}
              {r.rows[0].prefix >= 31 && (
                <p>
                  {r.rows[0].prefix === 31
                    ? '/31 ist ein Sonderfall für Punkt-zu-Punkt-Verbindungen: Beide Adressen sind nutzbar, ein Broadcast entfällt.'
                    : '/32 bezeichnet jeweils genau eine Adresse. Das ist eine Hostroute, kein gewöhnliches LAN-Subnetz.'}
                </p>
              )}
            </div>
            {r.count > r.rows.length && (
              <p className="notice">
                Vorschau: die ersten {r.rows.length} von {r.count.toLocaleString('de-CH')}{' '}
                Subnetzen. Das letzte Netz ist {formatIP(r.base.last - r.rows[0].size + 1)}/
                {r.rows[0].prefix}.
              </p>
            )}
            <div className="table-scroll">
              <table>
                <caption className="sr-only">
                  Gleich grosse Subnetze mit nutzbaren Adressen und Broadcast
                </caption>
                <thead>
                  <tr>
                    <th>Subnetz</th>
                    <th>Nutzbarer Bereich</th>
                    <th>Broadcast</th>
                  </tr>
                </thead>
                <tbody>
                  {r.rows.map((row) => (
                    <tr key={row.network}>
                      <td>
                        <code>
                          {formatIP(row.network)}/{row.prefix}
                        </code>
                      </td>
                      <td>
                        {formatIP(row.firstHost)} – {formatIP(row.lastHost)}
                      </td>
                      <td>{row.broadcast === null ? 'Keiner' : formatIP(row.broadcast)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      )}
    </section>
  );
}
