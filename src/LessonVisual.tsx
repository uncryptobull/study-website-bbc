import { useState } from 'react';
import { ArrowRight, Laptop, Network, Router, Server, Wifi } from 'lucide-react';
import type { LessonStep } from './learning';
export default function LessonVisual({ kind }: { kind: NonNullable<LessonStep['visual']> }) {
  const [value, setValue] = useState(77),
    [block, setBlock] = useState(1);
  if (kind === 'binary')
    return (
      <figure className="lesson-visual binary-visual">
        <figcaption>Acht Schalter ergeben eine Zahl. Klicke einen Schalter an.</figcaption>
        <div className="visual-bit-row">
          {[128, 64, 32, 16, 8, 4, 2, 1].map((weight) => (
            <div key={weight}>
              <span>{weight}</span>
              <button
                aria-label={`Lernbit ${weight}`}
                aria-pressed={(value & weight) !== 0}
                onClick={() => setValue(value ^ weight)}
                className={(value & weight) !== 0 ? 'on' : ''}
              >
                {(value & weight) !== 0 ? 1 : 0}
              </button>
            </div>
          ))}
        </div>
        <p className="visual-sum" aria-live="polite">
          {[128, 64, 32, 16, 8, 4, 2, 1].filter((w) => (value & w) !== 0).join(' + ') || '0'}{' '}
          <span>=</span> <strong>{value}</strong>
        </p>
      </figure>
    );
  if (kind === 'network-host')
    return (
      <figure className="lesson-visual network-host-visual">
        <figcaption>Beispiel: 192.168.1.77/24</figcaption>
        <div className="large-ip">
          <span className="net-part">
            192.168.1.<small>Netzteil · 24 Bits</small>
          </span>
          <span className="host-part">
            77<small>Hostteil · 8 Bits</small>
          </span>
        </div>
        <div className="visual-mask">
          <span>Maske</span>
          <code>255.255.255.0</code>
          <span>entspricht /24</span>
        </div>
        <p>
          Die Maske bestimmt die Grenze. Bei /24 sind die ersten drei Oktette Netzteil. Bei anderen
          Präfixen kann die Grenze innerhalb eines Oktetts liegen.
        </p>
      </figure>
    );
  if (kind === 'subnet-blocks')
    return (
      <figure className="lesson-visual subnet-block-visual">
        <figcaption>192.168.1.0/24 → vier gleich grosse /26-Netze</figcaption>
        <div className="block-strip">
          {[0, 1, 2, 3].map((i) => (
            <button
              className={block === i ? 'chosen' : ''}
              aria-pressed={block === i}
              key={i}
              onClick={() => setBlock(i)}
            >
              <span>
                .{i * 64}–.{i * 64 + 63}
              </span>
              <small>{i === 1 ? '← .77 liegt hier' : '64 Adressen'}</small>
            </button>
          ))}
        </div>
        <dl className="block-details" aria-live="polite">
          <div>
            <dt>Netzadresse</dt>
            <dd>192.168.1.{block * 64}</dd>
          </div>
          <div>
            <dt>Nutzbare Hosts</dt>
            <dd>
              .{block * 64 + 1} bis .{block * 64 + 62}
            </dd>
          </div>
          <div>
            <dt>Broadcast</dt>
            <dd>192.168.1.{block * 64 + 63}</dd>
          </div>
        </dl>
        <p>
          Alle Adressen haben denselben Anfang 192.168.1. Die letzte Zahl zeigt hier, in welchen
          64er-Block die Adresse gehört.
        </p>
      </figure>
    );
  if (kind === 'devices')
    return (
      <figure className="lesson-visual device-path">
        <figcaption>Ein möglicher Weg vom Notebook zu einer Website</figcaption>
        <div className="device-path-nodes">
          {[
            [Laptop, 'Notebook', 'sendet'],
            [Wifi, 'Access Point', 'verbindet Funk und LAN'],
            [Network, 'Switch', 'verbindet lokale Geräte'],
            [Router, 'Router', 'verbindet Netze'],
            [Server, 'Webserver', 'liefert die Seite'],
          ].map(([Icon, label, detail], i) => {
            const Component = Icon as typeof Laptop;
            return (
              <div className="device-path-node" key={label as string}>
                <Component size={28} />
                <strong>{label as string}</strong>
                <small>{detail as string}</small>
                {i < 4 && <ArrowRight size={14} />}
              </div>
            );
          })}
        </div>
      </figure>
    );
  if (kind === 'dora')
    return (
      <figure className="lesson-visual process-visual">
        <figcaption>DHCP: Der Client fragt, der Server bietet an.</figcaption>
        {[
          ['D', 'Discover', 'Client sucht Server'],
          ['O', 'Offer', 'Server bietet Konfiguration'],
          ['R', 'Request', 'Client fordert Angebot an'],
          ['A', 'ACK', 'Server bestätigt'],
        ].map(([letter, title, description]) => (
          <div className="process-row" key={letter}>
            <span>{letter}</span>
            <strong>{title}</strong>
            <p>{description}</p>
          </div>
        ))}
      </figure>
    );
  if (kind === 'dns-path')
    return (
      <figure className="lesson-visual process-visual">
        <figcaption>Ohne gültige Cache-Antwort fragt der Resolver nacheinander nach.</figcaption>
        {[
          ['1', 'Client → Resolver', '«Welche IP gehört zu diesem Namen?»'],
          ['2', 'Resolver ↔ Root', '«Wer ist für die Endung zuständig?»'],
          ['3', 'Resolver ↔ TLD', '«Wer ist für diese Domain zuständig?»'],
          ['4', 'Resolver ↔ Autoritativ', '«Hier ist der Eintrag der Domain.»'],
          ['5', 'Resolver → Client', 'Die Antwort ist da und wird zwischengespeichert.'],
        ].map(([number, title, description]) => (
          <div className="process-row" key={number}>
            <span>{number}</span>
            <strong>{title}</strong>
            <p>{description}</p>
          </div>
        ))}
      </figure>
    );
  if (kind === 'routing-path')
    return (
      <figure className="lesson-visual routing-visual">
        <figcaption>Hinweg und Rückweg brauchen passende Routen.</figcaption>
        <div className="routing-line">
          <span>
            PC A<small>192.168.1.10/24</small>
          </span>
          <ArrowRight />
          <span>
            R1<small>10.0.0.1</small>
          </span>
          <ArrowRight />
          <span>
            R2<small>10.0.0.2</small>
          </span>
          <ArrowRight />
          <span>
            PC B<small>192.168.2.20/24</small>
          </span>
        </div>
        <p>
          Für PC A ist PC B in einem anderen Netz. Das Paket geht zuerst an R1, dann über R2 zum
          Ziel. Die Antwort muss denselben Anfangsbereich wieder erreichen können.
        </p>
      </figure>
    );
  return (
    <figure className="lesson-visual">
      <figcaption>PAT merkt sich, zu welchem Client eine Antwort gehört.</figcaption>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Interner Endpunkt</th>
              <th>Öffentliche Zuordnung</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>192.168.1.77:51000</code>
              </td>
              <td>
                <code>203.0.113.5:40001</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>192.168.1.78:51000</code>
              </td>
              <td>
                <code>203.0.113.5:40002</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Zwei Clients, derselbe interne Port: unterschiedliche externe Ports machen die Rückzuordnung
        eindeutig. Die öffentliche IP hier ist eine Dokumentationsadresse.
      </p>
    </figure>
  );
}
