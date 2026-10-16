import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Check, Layers3, RotateCcw } from 'lucide-react';
import { topics } from './content';
import { learningGroups } from './learning';
import { conceptTasks, findConceptTask, type ConceptTask } from './concept-tasks';
import ConceptTaskCard from './ConceptTaskCard';
import Quiz, { shuffled } from './Quiz';
import type { Attempt } from './storage';
import './practice.css';

type Props = {
  onAnswer: (attempt: Attempt) => void;
  mistakes: string[];
  initialTopic?: string;
  mode?: 'practice' | 'mistakes';
  onSessionChange?: (active: boolean) => void;
  onStudyTopic: (topic: string) => void;
};

export default function PracticePage({ mode = 'practice', ...props }: Props) {
  const conceptsToReview = props.mistakes.filter((id) => !!findConceptTask(id)).length;
  const writtenToReview = props.mistakes.length - conceptsToReview;
  const [kind, setKind] = useState<'concepts' | 'written'>(
    mode === 'mistakes' && !conceptsToReview && writtenToReview ? 'written' : 'concepts',
  );
  const [active, setActive] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const sessionChange = useCallback(
    (running: boolean) => {
      setActive(running);
      props.onSessionChange?.(running);
    },
    [props.onSessionChange],
  );
  return (
    <>
      <div className="tabs practice-tabs" role="tablist" aria-label="Übungsart">
        {(['concepts', 'written'] as const).map((value, index) => (
          <button
            key={value}
            ref={(element) => {
              tabs.current[index] = element;
            }}
            role="tab"
            id={`${id}-${value}`}
            aria-controls={`${id}-panel`}
            aria-selected={kind === value}
            tabIndex={kind === value ? 0 : -1}
            disabled={active && kind !== value}
            className={kind === value ? 'active' : ''}
            onClick={() => setKind(value)}
            onKeyDown={(event) => {
              if (active || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
              event.preventDefault();
              const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
              setKind(next ? 'written' : 'concepts');
              tabs.current[next]?.focus();
            }}
          >
            {value === 'concepts' ? 'Interaktiv verstehen' : 'Prüfungsfragen'}
            {mode === 'mistakes' &&
              ` (${value === 'concepts' ? conceptsToReview : writtenToReview})`}
          </button>
        ))}
      </div>
      {active && (
        <p className="caption practice-mode-note">
          Beende die Runde, um die Übungsart zu wechseln.
        </p>
      )}
      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-${kind}`}>
        {kind === 'concepts' ? (
          <ConceptPractice {...props} mode={mode} onSessionChange={sessionChange} />
        ) : (
          <Quiz
            onAnswer={props.onAnswer}
            mistakes={props.mistakes}
            initialTopic={props.initialTopic}
            initialMode={mode === 'mistakes' ? 'mistakes' : 'practice'}
            onSessionChange={sessionChange}
            onStudyTopic={props.onStudyTopic}
          />
        )}
      </div>
    </>
  );
}

function ConceptPractice({
  onAnswer,
  mistakes,
  initialTopic = 'all',
  mode,
  onSessionChange,
  onStudyTopic,
}: Props) {
  const [filter, setFilter] = useState(initialTopic);
  const [session, setSession] = useState<ConceptTask[] | null>(null);
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnButton = useRef<HTMLButtonElement>(null);
  const startButton = useRef<HTMLButtonElement>(null);
  const summaryHeading = useRef<HTMLHeadingElement>(null);
  const active = !!session && !finished;
  const reviewing = mode === 'mistakes';
  const remaining = conceptTasks.filter((task) => mistakes.includes(task.id));
  const orderedTopics = learningGroups.flatMap((group) => group.topics);
  const task = session?.[index];
  useLayoutEffect(() => {
    onSessionChange?.(active);
    return () => onSessionChange?.(false);
  }, [active, onSessionChange]);
  useLayoutEffect(() => {
    if (leaving) dialog.current?.showModal();
    else dialog.current?.close();
  }, [leaving]);
  useLayoutEffect(() => {
    if (finished) summaryHeading.current?.focus({ preventScroll: true });
  }, [finished]);
  useLayoutEffect(() => {
    if (!active) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [active]);
  function start() {
    const pool = reviewing
      ? remaining
      : filter === 'ip-focus'
        ? conceptTasks.filter((item) => ['binary', 'ipv4', 'subnetting'].includes(item.topic))
        : filter === 'all'
          ? orderedTopics.flatMap((topic) =>
              shuffled(conceptTasks.filter((item) => item.topic === topic)).slice(0, 1),
            )
          : conceptTasks.filter((item) => item.topic === filter);
    if (!pool.length) return;
    setSession(reviewing ? shuffled(pool) : pool);
    setIndex(0);
    setSolved([]);
    setFinished(false);
  }
  function attempt(correct: boolean) {
    if (!task) return;
    onAnswer({ id: task.id, correct, date: new Date().toISOString() });
    if (correct) setSolved((previous) => [...new Set([...previous, task.id])]);
  }
  function exit() {
    setLeaving(false);
    setSession(null);
    setFinished(false);
    requestAnimationFrame(() => startButton.current?.focus({ preventScroll: true }));
  }
  const needingPractice = session?.filter((item) => !solved.includes(item.id)) ?? [];
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">AUSPROBIEREN & VERSTEHEN</p>
          <h1>{reviewing ? 'Konzepte wiederholen' : 'Interaktive Übungen'}</h1>
          <p>Ordne Karten zu, bringe Abläufe in Reihenfolge und setze Bits selbst zusammen.</p>
        </div>
        {session && (
          <button
            ref={returnButton}
            className="button secondary"
            onClick={() => (active ? setLeaving(true) : exit())}
          >
            <ArrowLeft size={16} /> Übersicht
          </button>
        )}
      </div>
      {!session ? (
        <div className="quiz-setup concept-setup">
          <section className="card">
            <div className="icon-tile">
              <Layers3 size={25} />
            </div>
            <h2>
              {reviewing
                ? `${remaining.length} Aufgaben zum Wiederholen`
                : 'Thema und Runde wählen'}
            </h2>
            <p>
              Du baust eine Lösung auf. Nach dem Prüfen erfährst du, warum sie passt oder was du
              noch ändern kannst. Hinweise helfen dir weiter.
            </p>
            {!reviewing && (
              <label>
                Thema auswählen
                <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                  <option value="all">Alle Themen · 14 Aufgaben</option>
                  <option value="ip-focus">IP & Subnetting · 6 Aufgaben</option>
                  {orderedTopics.map((id) => (
                    <option key={id} value={id}>
                      {topics.find((topic) => topic.id === id)?.title} ·{' '}
                      {conceptTasks.filter((item) => item.topic === id).length} Aufgaben
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button
              ref={startButton}
              className="button primary"
              onClick={start}
              disabled={reviewing && !remaining.length}
            >
              {reviewing && !remaining.length
                ? 'Keine offenen interaktiven Aufgaben'
                : 'Interaktive Runde starten'}
              <ArrowRight size={17} />
            </button>
            {reviewing && !remaining.length && (
              <p>Deine falsch beantworteten interaktiven Aufgaben erscheinen hier.</p>
            )}
          </section>
          <section className="card concept-method">
            <h2>Von der Aufgabe zur Prüfung</h2>
            <ol>
              <li>
                <span>1</span>
                <div>
                  <h3>Selbst ausprobieren</h3>
                  <p>Stelle die Lösung aus Karten, Schritten oder Bits zusammen.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <h3>Die Begründung verstehen</h3>
                  <p>
                    Eine richtige Zuordnung allein reicht nicht: Lies, welche Regel dahintersteckt.
                  </p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <h3>Ohne Hilfe erklären</h3>
                  <p>
                    Wechsle danach zu «Prüfungsfragen» und versuche es in eigenen Worten oder mit
                    einer eigenen Rechnung.
                  </p>
                </div>
              </li>
            </ol>
            <p className="caption">
              Fehler und Ergebnisse bleiben in deinem Browser. Du kannst jede Aufgabe in deinem
              Tempo bearbeiten.
            </p>
          </section>
        </div>
      ) : finished ? (
        <section className="card concept-summary">
          <Check size={27} />
          <h2 ref={summaryHeading} tabIndex={-1}>
            Runde abgeschlossen
          </h2>
          <p>
            {solved.length} von {session.length} Aufgaben richtig abgeschlossen. Aufgaben mit
            aufgedeckter Lösung bleiben zum Wiederholen offen. Diese Übungsrunde ist keine
            Prüfungsnote.
          </p>
          <ul>
            {session.map((item) => (
              <li key={item.id}>
                <span>{item.title}</span>
                <strong>
                  {solved.includes(item.id) ? 'Richtig abgeschlossen' : 'Noch einmal üben'}
                </strong>
              </li>
            ))}
          </ul>
          <p>
            Erkläre eine Regel aus der Runde laut oder auf Papier, ohne die Lösung anzusehen. So
            merkst du, ob du sie auch in einer Prüfung anwenden kannst.
          </p>
          <div className="concept-summary-actions">
            <button className="button primary" onClick={exit}>
              <RotateCcw size={16} /> Neue Runde wählen
            </button>
            {needingPractice[0] && (
              <button
                className="button secondary"
                onClick={() => onStudyTopic(needingPractice[0].topic)}
              >
                <BookOpen size={16} /> Erklärung nachlesen
              </button>
            )}
          </div>
        </section>
      ) : task ? (
        <>
          <div className="quiz-progress">
            <span>
              Aufgabe {index + 1} von {session.length}
            </span>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Aufgabe in dieser Runde"
              aria-valuemin={0}
              aria-valuemax={session.length}
              aria-valuenow={index + 1}
            >
              <span style={{ width: `${((index + 1) / session.length) * 100}%` }} />
            </div>
          </div>
          <ConceptTaskCard
            key={`${task.id}-${index}`}
            task={task}
            onAttempt={attempt}
            last={index === session.length - 1}
            onNext={() =>
              index === session.length - 1
                ? setFinished(true)
                : setIndex((previous) => previous + 1)
            }
          />
        </>
      ) : null}
      <dialog
        ref={dialog}
        className="leave-dialog"
        aria-labelledby="concept-exit-title"
        onCancel={(event) => {
          event.preventDefault();
          setLeaving(false);
          returnButton.current?.focus();
        }}
      >
        <h2 id="concept-exit-title">Übungsrunde beenden?</h2>
        <p>
          Deine geprüften Antworten bleiben gespeichert. Die aktuelle Zusammenstellung der Karten
          wird nicht gespeichert.
        </p>
        <div className="dialog-actions">
          <button
            className="button secondary"
            onClick={() => {
              setLeaving(false);
              returnButton.current?.focus();
            }}
          >
            Weiter üben
          </button>
          <button className="button primary" onClick={exit}>
            Runde beenden
          </button>
        </div>
      </dialog>
    </>
  );
}
