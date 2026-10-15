import { useRef, useState, type ReactNode } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  Play,
  Target,
  Upload,
} from 'lucide-react';
import { topics, videos } from './content';
import { guidedCompleted } from './learning-progress';
import { glossary } from './glossary';
import { emptyProgress, validateProgress, type Progress } from './storage';
function Stat({
  icon,
  label,
  value,
  note,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  note: string;
}) {
  return (
    <div className="card stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong className="stat-value">{value}</strong>
      <p>{note}</p>
    </div>
  );
}
export function ProgressPage({
  progress,
  setProgress,
  openTopic,
}: {
  progress: Progress;
  setProgress: (p: Progress) => void;
  openTopic: (id: string) => void;
}) {
  const [status, setStatus] = useState('');
  const [reset, setReset] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  function exportProgress() {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `telematik-fortschritt-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Dein Export wurde zum Download vorbereitet. Bewahre die Datei als Sicherung auf.');
  }
  async function importProgress(file: File) {
    try {
      if (file.size > 5_000_000) throw new Error('Die Datei ist zu gross (maximal 5 MB).');
      const incoming = validateProgress(JSON.parse(await file.text()));
      setProgress({
        completed: [...new Set([...progress.completed, ...incoming.completed])],
        mistakes: [...new Set([...progress.mistakes, ...incoming.mistakes])],
        lessonSteps: Object.fromEntries(
          [
            ...new Set([
              ...Object.keys(progress.lessonSteps ?? {}),
              ...Object.keys(incoming.lessonSteps ?? {}),
            ]),
          ].map((id) => [
            id,
            [
              ...new Set([
                ...(progress.lessonSteps?.[id] ?? []),
                ...(incoming.lessonSteps?.[id] ?? []),
              ]),
            ],
          ]),
        ),
        lastLesson: incoming.lastLesson ?? progress.lastLesson,
        attempts: [
          ...new Map(
            [...progress.attempts, ...incoming.attempts].map((a) => [`${a.id}-${a.date}`, a]),
          ).values(),
        ],
      });
      setStatus('Fortschritt importiert und mit deinem vorhandenen Stand zusammengeführt.');
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Import nicht möglich.');
    }
  }
  const finishedTopics = guidedCompleted(progress);
  const previousReadMarkers = progress.completed.filter((id) => !finishedTopics.includes(id));
  const auto = progress.attempts.filter((a) => !a.self);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">LERNSTAND</p>
          <h1>
            Fortschritt<span>.</span>
          </h1>
          <p>
            Durchgearbeitete Lektionen und Übungsergebnisse. Die Daten bleiben in diesem Browser.
          </p>
        </div>
        <button className="button secondary" onClick={exportProgress}>
          <Download size={17} />
          Fortschritt sichern
        </button>
      </div>
      {previousReadMarkers.length > 0 && (
        <p className="notice">
          {previousReadMarkers.length} Lesemarkierungen aus der ersten Version sind in deiner
          Sicherung erhalten. Für die neuen geführten Lektionen sind noch Verständnisfragen offen.
        </p>
      )}
      <div className="stats-grid three-stats">
        <Stat
          label="Lektionen"
          icon={<BookOpen size={21} />}
          value={`${finishedTopics.length}/14`}
          note="abgeschlossene Lektionen"
        />
        <Stat
          label="Geprüfte Antworten"
          icon={<Target size={21} />}
          value={auto.length.toString()}
          note={`${auto.filter((a) => a.correct).length} richtig · ${auto.filter((a) => !a.correct).length} noch üben`}
        />
        <Stat
          label="Selbstkontrolle"
          icon={<CheckCircle2 size={21} />}
          value={progress.attempts.filter((a) => a.self).length.toString()}
          note="Erklärfragen von dir selbst eingeschätzt"
        />
      </div>
      <section className="card">
        <h2>Deine Themen im Überblick</h2>
        <p>Trefferquoten beziehen sich auf alle bisherigen automatisch geprüften Versuche.</p>
        <div className="progress-topic-list">
          {topics.map((t) => {
            const a = auto.filter(
              (a) =>
                a.id.startsWith(t.id + '-') ||
                (t.id === 'subnetting' && a.id.startsWith('generated:')),
            );
            const percent = a.length
              ? Math.round((a.filter((v) => v.correct).length / a.length) * 100)
              : 0;
            return (
              <button key={t.id} onClick={() => openTopic(t.id)}>
                <span className={`completion-dot ${finishedTopics.includes(t.id) ? 'done' : ''}`}>
                  {finishedTopics.includes(t.id) ? <Check size={13} /> : null}
                </span>
                <span className="grow">{t.title}</span>
                <span className="progress-track">
                  <span style={{ width: `${percent}%` }} />
                </span>
                <strong>{a.length ? `${percent}%` : '–'}</strong>
                <span className="caption">{a.length} Versuche</span>
                <ChevronRight size={16} />
              </button>
            );
          })}
        </div>
      </section>
      <section className="card data-card">
        <h2>Fortschritt sichern und übertragen.</h2>
        <p>
          Ein Browserwechsel, private Fenster oder das Löschen von Browserdaten können deinen Stand
          entfernen. Exportiere eine Sicherung; importierte Daten werden zusammengeführt.
        </p>
        <div className="data-actions">
          <button className="button secondary" onClick={exportProgress}>
            <ArrowDownToLine size={16} />
            Exportieren
          </button>
          <button className="button secondary" onClick={() => fileInput.current?.click()}>
            <Upload size={16} />
            Sicherung importieren
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importProgress(file);
              e.target.value = '';
            }}
          />
          <button className="button ghost danger" onClick={() => setReset(true)}>
            Fortschritt zurücksetzen
          </button>
        </div>
        {reset && (
          <div className="notice warning">
            <span>Alle lokalen Lernstände wirklich löschen? Sichere sie vorher als Export.</span>
            <button className="button secondary" onClick={() => setReset(false)}>
              Abbrechen
            </button>
            <button
              className="button danger-fill"
              onClick={() => {
                setProgress({ ...emptyProgress });
                setReset(false);
                setStatus('Lokaler Fortschritt zurückgesetzt.');
              }}
            >
              Jetzt löschen
            </button>
          </div>
        )}
        {status && (
          <p className="notice" role="status">
            {status}
          </p>
        )}
      </section>
    </>
  );
}
export function Sources() {
  const [term, setTerm] = useState('');
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">MATERIAL</p>
          <h1>
            Begriffe und Quellen<span>.</span>
          </h1>
          <p>Die Grundlagen hinter deinem Lernraum.</p>
        </div>
      </div>
      <section className="glossary-section">
        <h2>Begriffe einfach erklärt</h2>
        <label>
          Begriff suchen
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Netzmaske, Gateway, DNS …"
          />
        </label>
        <div className="glossary-grid">
          {glossary
            .filter(([word, definition]) =>
              `${word} ${definition}`.toLowerCase().includes(term.toLowerCase()),
            )
            .map(([word, definition]) => (
              <details key={word}>
                <summary>
                  {word}
                  <ChevronRight size={15} />
                </summary>
                <p>{definition}</p>
              </details>
            ))}
        </div>
        {!glossary.some(([word, definition]) =>
          `${word} ${definition}`.toLowerCase().includes(term.toLowerCase()),
        ) && <p>Kein Begriff gefunden. Versuche einen anderen Suchbegriff.</p>}
      </section>
      <section className="card">
        <h2>Unser Ausgangspunkt</h2>
        <p>
          Die Lerninhalte basieren auf dem bereitgestellten{' '}
          <strong>Telematik-Lernskript (21 Seiten, 15. Oktober 2026)</strong>. Die fachlichen
          Präzisierungen auf Seite 20 sind berücksichtigt. Die 14 Originalhandouts mit 164 Seiten
          und ihre Abbildungen wurden diesem Projekt nicht bereitgestellt; ihre vollständige
          Abdeckung ist deshalb nicht unabhängig geprüft.
        </p>
        <p>
          Diese Website ist ein privates Lernprojekt und kein offizielles Angebot von BBC oder
          Moodle. Die Fragen sind ergänzende Übungen, keine offiziellen Prüfungsfragen.
        </p>
      </section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">VIDEOS</p>
          <h2>Videos aus dem Lernskript</h2>
        </div>
        <span className="caption">Öffnen erst nach deinem Klick</span>
      </div>
      <div className="video-grid">
        {videos.map(([title, channel, id, goal]) => (
          <a
            className="card video-card"
            href={`https://www.youtube.com/watch?v=${id}`}
            key={id}
            target="_blank"
            rel="noreferrer"
          >
            <span className="video-play">
              <Play size={20} />
            </span>
            <div>
              <span className="caption">{channel}</span>
              <h3>{title}</h3>
              <p>{goal}</p>
            </div>
            <ExternalLink size={16} />
          </a>
        ))}
      </div>
      <p className="caption">
        Titel, Kanäle und Links wurden aus dem Skript übernommen. Die aktuelle Videoverfügbarkeit
        wurde hier nicht geprüft; es werden keine Videos automatisch eingebettet.
      </p>
      <section className="card sources-card">
        <h2>Offizielle Referenzen</h2>
        {[
          ['RFC 1918 · Private IPv4-Adressen', 'https://www.rfc-editor.org/rfc/rfc1918'],
          ['RFC 3021 · /31 auf Punkt-zu-Punkt-Links', 'https://www.rfc-editor.org/rfc/rfc3021'],
          ['RFC 2131 · DHCP', 'https://www.rfc-editor.org/rfc/rfc2131'],
          ['RFC 9293 · TCP', 'https://www.rfc-editor.org/rfc/rfc9293'],
          ['RFC 3927 · IPv4 Link-Local', 'https://www.rfc-editor.org/rfc/rfc3927'],
          ['RFC 6146 · NAT64', 'https://www.rfc-editor.org/rfc/rfc6146'],
          [
            'Microsoft · tracert',
            'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/tracert',
          ],
          ['Apple · Private WLAN-Adressen', 'https://support.apple.com/en-us/102509'],
        ].map(([label, url]) => (
          <a key={url} href={url} target="_blank" rel="noreferrer">
            {label}
            <ExternalLink size={15} />
          </a>
        ))}
      </section>
    </>
  );
}
