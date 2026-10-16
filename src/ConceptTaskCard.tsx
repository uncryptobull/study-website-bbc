import { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  Unlink,
} from 'lucide-react';
import type { ConceptTask } from './concept-tasks';
import { topics } from './content';
import './concept-tasks.css';

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

function startingOrder(task: ConceptTask): string[] {
  if (task.kind !== 'order') return [];
  const ids = shuffled(task.items.map((item) => item.id));
  if (ids.length > 1 && ids.every((id, index) => id === task.correctOrder[index])) {
    ids.push(ids.shift()!);
  }
  return ids;
}

const bitValues = [128, 64, 32, 16, 8, 4, 2, 1];
const matchingColumns: Record<string, [string, string]> = {
  devices: ['Aufgaben', 'Geräte'],
  addressing: ['Adressbeispiele', 'Adressarten'],
  ipv4: ['Adressen', 'Bereiche'],
  subnetting: ['Teilnetze', 'Nutzbare Hostbereiche'],
  plans: ['Komponenten', 'Bezeichnungen im Plan'],
  protocols: ['Dienste', 'Protokolle und Ports'],
  dns: ['Fragen', 'DNS-Einträge'],
  routing: ['Angaben', 'Bedeutungen'],
  wifi: ['Situationen', 'Funknetzarten'],
  security: ['Risiken', 'Passende Massnahmen'],
  nat: ['Öffentliche Ziele', 'Interne Empfänger'],
};
const kindLabels = {
  choice: 'Situation entscheiden',
  order: 'Ablauf ordnen',
  match: 'Zusammenhänge zuordnen',
  bits: 'Binärzahl bauen',
};
const instructions = {
  choice: 'Wähle die Karte, die zur Situation passt. Danach prüfst du deine Entscheidung.',
  order:
    'Bringe die Schritte mit den Pfeilen in die richtige Reihenfolge. Der erste Schritt steht oben.',
  match:
    'Wähle zuerst eine Karte links und dann die passende Zuordnung rechts. Du kannst jede Verbindung wieder lösen.',
  bits: 'Schalte die Bits ein oder aus. Jedes eingeschaltete Bit zählt mit seinem Stellenwert zur Summe.',
};

export default function ConceptTaskCard({
  task,
  onAttempt,
  onNext,
  last,
}: {
  task: ConceptTask;
  onAttempt: (correct: boolean) => void;
  onNext: () => void;
  last: boolean;
}) {
  const id = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLButtonElement>(null);
  const orderRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const leftRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const submittedRef = useRef(false);
  const [choice, setChoice] = useState<string | null>(null);
  const [options] = useState(() => (task.kind === 'choice' ? shuffled(task.options) : []));
  const [order, setOrder] = useState(() => startingOrder(task));
  const [rightPairs] = useState(() => {
    if (task.kind !== 'match') return [];
    const pairs = shuffled(task.pairs);
    if (pairs.length > 1 && pairs.every((pair, index) => pair.id === task.pairs[index].id)) {
      pairs.push(pairs.shift()!);
    }
    return pairs;
  });
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [bits, setBits] = useState(() => (task.kind === 'bits' ? (task.initial ?? 0) & 255 : 0));
  const [result, setResult] = useState<boolean | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const locked = result === true || revealed;
  const canContinue = locked;
  const ready =
    task.kind === 'choice'
      ? choice !== null
      : task.kind === 'match'
        ? Object.keys(matches).length === task.pairs.length
        : true;

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (result !== null || revealed) feedbackRef.current?.focus({ preventScroll: true });
  }, [result, revealed]);

  function changed() {
    submittedRef.current = false;
    setResult(null);
  }

  function move(itemId: string, offset: number) {
    if (locked) return;
    const current = order.indexOf(itemId);
    const destination = current + offset;
    if (destination < 0 || destination >= order.length) return;
    const updated = [...order];
    [updated[current], updated[destination]] = [updated[destination], updated[current]];
    setOrder(updated);
    changed();
    requestAnimationFrame(() => orderRefs.current[itemId]?.focus({ preventScroll: true }));
  }

  function connect(rightId: string) {
    if (locked || !selectedLeft) return;
    const updated = { ...matches, [selectedLeft]: rightId };
    setMatches(updated);
    setSelectedLeft(null);
    changed();
    const nextPair = task.kind === 'match' ? task.pairs.find((pair) => !updated[pair.id]) : null;
    requestAnimationFrame(() => {
      if (nextPair) leftRefs.current[nextPair.id]?.focus({ preventScroll: true });
      else checkRef.current?.focus({ preventScroll: true });
    });
  }

  function disconnect(leftId: string) {
    const updated = { ...matches };
    delete updated[leftId];
    setMatches(updated);
    setSelectedLeft(leftId);
    changed();
    requestAnimationFrame(() => leftRefs.current[leftId]?.focus({ preventScroll: true }));
  }

  function check() {
    if (!ready || locked || submittedRef.current) return;
    submittedRef.current = true;
    const correct =
      task.kind === 'choice'
        ? choice === task.correct
        : task.kind === 'order'
          ? order.every((itemId, index) => itemId === task.correctOrder[index])
          : task.kind === 'match'
            ? task.pairs.every((pair) => matches[pair.id] === pair.id)
            : bits === task.target;
    setResult(correct);
    onAttempt(correct);
  }

  function reveal() {
    if (locked) return;
    if (result !== false) onAttempt(false);
    submittedRef.current = true;
    setRevealed(true);
    setSelectedLeft(null);
  }

  return (
    <section className="card concept-task" aria-labelledby={`${id}-title`}>
      <div className="concept-task-header">
        <span className="label-pill">{kindLabels[task.kind]}</span>
        <span className="caption">{topics.find((topic) => topic.id === task.topic)?.title}</span>
      </div>
      <h2 id={`${id}-title`} ref={headingRef} tabIndex={-1}>
        {task.title}
      </h2>
      <p className="concept-task-prompt">{task.prompt}</p>
      <p className="concept-instructions" id={`${id}-instructions`}>
        {instructions[task.kind]}
      </p>

      {task.kind === 'choice' && (
        <div
          className="concept-options"
          role="group"
          aria-label="Antwort auswählen"
          aria-describedby={`${id}-instructions`}
        >
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`concept-option ${choice === option.id ? 'selected' : ''}`}
              aria-pressed={choice === option.id}
              disabled={locked}
              onClick={() => {
                setChoice(option.id);
                changed();
              }}
            >
              <span className="concept-option-indicator" aria-hidden="true">
                {choice === option.id && <Check size={16} />}
              </span>
              <span>
                <strong>{option.label}</strong>
                {option.detail && <span className="concept-option-detail">{option.detail}</span>}
              </span>
            </button>
          ))}
        </div>
      )}

      {task.kind === 'order' && (
        <ol className="concept-order" aria-describedby={`${id}-instructions`}>
          {order.map((itemId, index) => (
            <li
              key={itemId}
              ref={(element) => {
                orderRefs.current[itemId] = element;
              }}
              tabIndex={-1}
              aria-label={`Schritt ${index + 1}: ${task.items.find((item) => item.id === itemId)?.label}`}
            >
              <span className="concept-order-number" aria-hidden="true">
                {index + 1}
              </span>
              <span className="concept-order-label">
                {task.items.find((item) => item.id === itemId)?.label}
              </span>
              <div className="concept-order-controls">
                <button
                  type="button"
                  aria-label={`${task.items.find((item) => item.id === itemId)?.label}: nach oben`}
                  disabled={locked || index === 0}
                  onClick={() => move(itemId, -1)}
                >
                  <ArrowUp size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={`${task.items.find((item) => item.id === itemId)?.label}: nach unten`}
                  disabled={locked || index === order.length - 1}
                  onClick={() => move(itemId, 1)}
                >
                  <ArrowDown size={17} aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {task.kind === 'match' && (
        <div className="concept-match" aria-describedby={`${id}-instructions`}>
          {Object.keys(matches).length < task.pairs.length && (
            <>
              <div className="concept-match-columns">
                <div role="group" aria-label="Linke Karten">
                  <h3>{matchingColumns[task.topic]?.[0] ?? 'Karten'}</h3>
                  {task.pairs
                    .filter((pair) => !matches[pair.id])
                    .map((pair) => (
                      <button
                        type="button"
                        key={pair.id}
                        ref={(element) => {
                          leftRefs.current[pair.id] = element;
                        }}
                        className={`concept-match-chip ${selectedLeft === pair.id ? 'selected' : ''}`}
                        aria-pressed={selectedLeft === pair.id}
                        disabled={locked}
                        onClick={() => setSelectedLeft(pair.id)}
                      >
                        {pair.left}
                        {selectedLeft === pair.id && <ArrowRight size={16} aria-hidden="true" />}
                      </button>
                    ))}
                </div>
                <div role="group" aria-label="Rechte Karten">
                  <h3>{matchingColumns[task.topic]?.[1] ?? 'Passende Zuordnungen'}</h3>
                  {rightPairs
                    .filter((pair) => !Object.values(matches).includes(pair.id))
                    .map((pair) => (
                      <button
                        type="button"
                        key={pair.id}
                        className="concept-match-chip"
                        disabled={locked || !selectedLeft}
                        onClick={() => connect(pair.id)}
                      >
                        {pair.right}
                      </button>
                    ))}
                </div>
              </div>
              <p className="caption concept-match-status" role="status">
                {selectedLeft
                  ? `Gewählt: ${task.pairs.find((pair) => pair.id === selectedLeft)?.left}. Wähle rechts die passende Zuordnung.`
                  : 'Wähle links eine Karte aus.'}
              </p>
            </>
          )}
          {Object.keys(matches).length > 0 && (
            <div className="concept-formed-pairs">
              <h3>Deine Verbindungen</h3>
              <ul>
                {task.pairs
                  .filter((pair) => matches[pair.id])
                  .map((pair) => (
                    <li key={pair.id}>
                      <strong>{pair.left}</strong>
                      <ArrowRight size={15} aria-hidden="true" />
                      <span>
                        {task.pairs.find((right) => right.id === matches[pair.id])?.right}
                      </span>
                      <button
                        type="button"
                        aria-label={`Verbindung von ${pair.left} lösen`}
                        disabled={locked}
                        onClick={() => disconnect(pair.id)}
                      >
                        <Unlink size={16} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {task.kind === 'bits' && (
        <div className="concept-bits" aria-describedby={`${id}-instructions`}>
          <div className="concept-bit-readout">
            <div>
              <span>Zielzahl</span>
              <strong>{task.target}</strong>
            </div>
            <div role="status" aria-live="polite" aria-atomic="true">
              <span>Deine Dezimalzahl</span>
              <strong>{bits}</strong>
            </div>
          </div>
          <div className="concept-bit-grid" role="group" aria-label="Acht Bits umschalten">
            {bitValues.map((value) => (
              <button
                type="button"
                key={value}
                aria-label={`Bit mit Wert ${value}: ${bits & value ? 'ein' : 'aus'}`}
                aria-pressed={Boolean(bits & value)}
                className={bits & value ? 'selected' : ''}
                disabled={locked}
                onClick={() => {
                  setBits(bits ^ value);
                  changed();
                }}
              >
                <span>{value}</span>
                <strong>{bits & value ? 1 : 0}</strong>
              </button>
            ))}
          </div>
          <p className="concept-bit-sum">
            {bitValues.filter((value) => bits & value).join(' + ') || '0'} = <strong>{bits}</strong>
          </p>
        </div>
      )}

      <div className="concept-help-actions">
        <button
          type="button"
          className="text-button"
          aria-expanded={hintOpen}
          aria-controls={`${id}-hint`}
          onClick={() => setHintOpen(!hintOpen)}
        >
          <Lightbulb size={15} aria-hidden="true" />
          {hintOpen ? 'Hinweis ausblenden' : 'Hinweis'}
        </button>
        {!locked && (
          <button type="button" className="text-button" onClick={reveal}>
            Lösung ansehen
          </button>
        )}
      </div>
      <div className="concept-hint" id={`${id}-hint`} hidden={!hintOpen}>
        <strong>Denkhilfe</strong>
        <p>{task.hint}</p>
      </div>

      {(result !== null || revealed) && (
        <div
          className={`concept-feedback ${result === true ? 'solved' : revealed ? 'revealed' : 'retry'}`}
          ref={feedbackRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
        >
          <h3>
            {result === true ? (
              <>
                <CheckCircle2 size={18} aria-hidden="true" /> Richtig gelöst
              </>
            ) : revealed ? (
              'Lösung und Erklärung'
            ) : (
              'Noch nicht ganz – du kannst es nochmals versuchen'
            )}
          </h3>
          <p>{task.explanation}</p>
          {(revealed || result === true) && (
            <div className="concept-solution">
              <strong>Richtige Lösung</strong>
              {task.kind === 'choice' && (
                <p>{task.options.find((option) => option.id === task.correct)?.label}</p>
              )}
              {task.kind === 'order' && (
                <ol>
                  {task.correctOrder.map((itemId) => (
                    <li key={itemId}>{task.items.find((item) => item.id === itemId)?.label}</li>
                  ))}
                </ol>
              )}
              {task.kind === 'match' && (
                <ul>
                  {task.pairs.map((pair) => (
                    <li key={pair.id}>
                      <strong>{pair.left}:</strong> {pair.right}
                    </li>
                  ))}
                </ul>
              )}
              {task.kind === 'bits' && (
                <p>
                  <code>{task.target.toString(2).padStart(8, '0')}</code> ={' '}
                  {bitValues.filter((value) => task.target & value).join(' + ') || '0'} ={' '}
                  {task.target}
                </p>
              )}
            </div>
          )}
          {revealed && result !== true && (
            <p className="concept-reveal-note">
              Angesehene Lösungen zählen nicht als richtig gelöst.
            </p>
          )}
          {result === false && !revealed && (
            <button
              type="button"
              className="text-button"
              onClick={() => {
                changed();
                headingRef.current?.focus({ preventScroll: true });
              }}
            >
              <RotateCcw size={15} aria-hidden="true" /> Nochmals versuchen
            </button>
          )}
        </div>
      )}

      <div className="concept-task-actions">
        {!canContinue ? (
          <>
            <span className="caption">
              {!ready
                ? task.kind === 'match'
                  ? 'Verbinde zuerst alle Karten.'
                  : 'Wähle zuerst eine Antwort.'
                : result === false
                  ? 'Ändere deine Antwort oder versuche es nochmals.'
                  : 'Bereit? Prüfe deine Lösung.'}
            </span>
            <button
              type="button"
              ref={checkRef}
              className="button primary"
              disabled={!ready || result !== null}
              onClick={check}
            >
              Prüfen <Check size={16} aria-hidden="true" />
            </button>
          </>
        ) : (
          <>
            <span className="caption">
              {result === true
                ? 'Du kannst mit der nächsten Aufgabe weiterüben.'
                : 'Lies die Erklärung und übe danach weiter.'}
            </span>
            <button type="button" className="button primary" onClick={onNext}>
              {last ? 'Auswertung ansehen' : 'Nächste Aufgabe'}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
