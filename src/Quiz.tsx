import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  Shuffle,
  Target,
  X,
} from 'lucide-react';
import { findQuestion, generatedQuestion, questions, topics, type Question } from './content';
import { answerFormatError, answerFormatHint, answerMatches, nextQuestionHint } from './quiz-utils';
import type { Attempt } from './storage';
export { answerMatches } from './quiz-utils';
export function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export function QuestionCard({
  question: q,
  onAnswer,
  onNext,
  last = false,
  onStudyTopic,
}: {
  question: Question;
  onAnswer: (attempt: Attempt) => void;
  onNext: () => void;
  last?: boolean;
  onStudyTopic?: (topic: string) => void;
}) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const [hint, setHint] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [validation, setValidation] = useState<string | null>(null);
  const [choices] = useState(() => (q.choices ? shuffled(q.choices) : []));
  const fieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null);
  const choiceRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const questionId = useId();
  const helpId = `${questionId}-help`;
  const errorId = `${questionId}-error`;
  const formatHint = answerFormatHint(q);
  const answeredRef = useRef(false);

  function revealSolution() {
    setValidation(null);
    setRevealed(true);
  }

  useEffect(() => {
    if (q.choices) headingRef.current?.focus({ preventScroll: true });
    else fieldRef.current?.focus({ preventScroll: true });
  }, [q]);
  useEffect(() => {
    if (result === null) return;
    nextRef.current?.focus({ preventScroll: true });
    feedbackRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [result]);
  useEffect(() => {
    if (revealed && result === null) explanationRef.current?.focus({ preventScroll: true });
  }, [revealed, result]);

  function submit(correct?: boolean) {
    if (answeredRef.current) return;
    if (!q.self && !revealed) {
      const error = q.choices
        ? input
          ? null
          : 'Wähle zuerst eine Antwort aus.'
        : answerFormatError(input, q.answer);
      if (error) {
        setValidation(error);
        fieldRef.current?.focus();
        return;
      }
    }
    answeredRef.current = true;
    const right = correct ?? (answerMatches(input, q.answer) && !revealed);
    setResult(right);
    onAnswer({
      id: q.id,
      correct: right,
      date: new Date().toISOString(),
      ...(q.self ? { self: true } : {}),
    });
  }
  return (
    <section className="card question-card">
      <div className="section-top">
        <span className="label-pill">{topics.find((t) => t.id === q.topic)?.title}</span>
        <span className="caption">
          {q.self ? 'Selbstkontrolle' : q.choices ? 'Multiple Choice' : 'Deine Eingabe'}
        </span>
      </div>
      <h2 ref={headingRef} tabIndex={-1} id={questionId}>
        {q.prompt}
      </h2>
      {q.self ? (
        <>
          <label>
            Deine Erklärung
            <textarea
              ref={(field) => {
                fieldRef.current = field;
              }}
              rows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={result !== null}
              placeholder="Erkläre es in deinen eigenen Worten …"
            />
          </label>
          <p className="caption">
            Keine automatische Bewertung: Vergleiche selbst mit der Musterlösung.
          </p>
        </>
      ) : q.choices ? (
        <div className="choices" role="radiogroup" aria-labelledby={questionId}>
          {choices.map((choice, i) => (
            <button
              key={choice}
              ref={(button) => {
                choiceRefs.current[i] = button;
              }}
              type="button"
              role="radio"
              aria-label={choice}
              aria-checked={input === choice}
              tabIndex={input === choice || (!input && i === 0) ? 0 : -1}
              disabled={result !== null}
              onClick={() => setInput(choice)}
              onKeyDown={(event) => {
                if (result !== null) return;
                if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) {
                  event.preventDefault();
                  const offset = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
                  const next = (i + offset + choices.length) % choices.length;
                  setInput(choices[next]);
                  choiceRefs.current[next]?.focus();
                } else if (event.key === 'Enter' && input === choice) {
                  event.preventDefault();
                  submit();
                }
              }}
              className={`${input === choice ? 'selected' : ''} ${result !== null && choice === q.answer ? 'correct-choice' : ''} ${result === false && input === choice && choice !== q.answer ? 'wrong-choice' : ''}`}
            >
              <span className="choice-letter">{String.fromCharCode(65 + i)}</span>
              {choice}
              {result !== null && choice === q.answer && <Check size={18} />}
            </button>
          ))}
        </div>
      ) : (
        <form
          className="question-submit-form"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label>
            Deine Antwort
            <input
              ref={(field) => {
                fieldRef.current = field;
              }}
              autoComplete="off"
              value={input}
              disabled={result !== null}
              onChange={(e) => {
                setInput(e.target.value);
                setValidation(null);
              }}
              aria-invalid={!!validation}
              aria-describedby={
                [formatHint ? helpId : '', validation ? errorId : ''].filter(Boolean).join(' ') ||
                undefined
              }
              inputMode={/^\d+$/.test(q.answer) ? 'numeric' : 'text'}
              placeholder="Antwort eingeben …"
            />
          </label>
        </form>
      )}
      {result === null && q.choices && (
        <p className="caption quiz-help">Mit Pfeiltasten auswählen. Enter prüft die Auswahl.</p>
      )}
      {result === null && formatHint && (
        <p className="caption quiz-help" id={helpId}>
          {formatHint} Enter prüft die Antwort.
        </p>
      )}
      {validation && (
        <p className="quiz-validation" id={errorId} role="alert">
          {validation}
        </p>
      )}
      {hint > 0 && (
        <div className="hint-box">
          <Lightbulb size={18} />
          <div>
            <strong>{hint === 1 ? 'Hinweis' : 'Nächster Schritt'}</strong>
            <p>{q.hint}</p>
            {hint > 1 && <p>{nextQuestionHint(q)}</p>}
          </div>
        </div>
      )}
      {revealed && result === null && (
        <div className="explanation" ref={explanationRef} tabIndex={-1}>
          <strong>{q.self ? 'Musterlösung' : 'Lösung zur Selbstkontrolle'}</strong>
          {!q.self && (
            <p>
              <strong>{q.answer}</strong>
            </p>
          )}
          <p>{q.explanation}</p>
          {!q.self && (
            <p className="caption">
              Nach dem Aufdecken zählt diese Frage als Übung mit Lösung, nicht als selbst gelöst.
            </p>
          )}
        </div>
      )}
      {result !== null ? (
        <>
          <div
            ref={feedbackRef}
            className={`feedback ${result ? 'success' : 'incorrect'}`}
            role="status"
          >
            {result ? <CheckCircle2 size={24} /> : <RefreshCw size={24} />}
            <div>
              <h3>
                {q.self
                  ? result
                    ? 'Als verstanden markiert'
                    : 'Für die Wiederholung vorgemerkt'
                  : result
                    ? 'Richtig beantwortet'
                    : revealed
                      ? 'Mit Lösung geübt. Wiederhole es später.'
                      : 'Antwort nicht richtig'}
              </h3>
              {!q.self && !result && (
                <p>
                  <strong>Richtige Antwort: {q.answer}</strong>
                </p>
              )}
              <p>{q.explanation}</p>
              {!result && onStudyTopic && (
                <button className="text-button" onClick={() => onStudyTopic(q.topic)}>
                  Lektion nachlesen
                </button>
              )}
            </div>
          </div>
          <button ref={nextRef} className="button primary" onClick={onNext}>
            {last ? 'Auswertung ansehen' : 'Nächste Frage'}
            <ArrowRight size={17} />
          </button>
        </>
      ) : (
        <div className="question-actions">
          <div>
            {hint < 2 && (
              <button className="button ghost" onClick={() => setHint(hint + 1)}>
                <Lightbulb size={16} />
                {hint === 0 ? 'Hinweis anzeigen' : 'Nächster Schritt'}
              </button>
            )}
            {hint >= 2 && !revealed && !q.self && (
              <button className="button ghost" onClick={revealSolution}>
                Lösung aufdecken
              </button>
            )}
          </div>
          {q.self ? (
            <>
              {!revealed ? (
                <button
                  className="button primary"
                  disabled={!input.trim()}
                  onClick={revealSolution}
                >
                  Mit Musterlösung vergleichen
                </button>
              ) : (
                <div className="self-actions">
                  <button className="button secondary" onClick={() => submit(false)}>
                    <X size={16} />
                    Noch üben
                  </button>
                  <button className="button primary" onClick={() => submit(true)}>
                    <Check size={16} />
                    Verstanden
                  </button>
                </div>
              )}
            </>
          ) : (
            <button
              className="button primary"
              disabled={!revealed && !input.trim()}
              onClick={() => submit()}
            >
              {revealed ? 'Als geübt speichern' : 'Antwort prüfen'}
              <ArrowRight size={17} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
export default function Quiz({
  onAnswer,
  mistakes,
  initialMode = 'practice',
  initialTopic = 'all',
  onSessionChange,
  onStudyTopic,
}: {
  onAnswer: (a: Attempt) => void;
  mistakes: string[];
  initialMode?: 'practice' | 'exam' | 'mistakes';
  initialTopic?: string;
  onSessionChange?: (active: boolean) => void;
  onStudyTopic?: (topic: string) => void;
}) {
  const [filter, setFilter] = useState(
    topics.some((topic) => topic.id === initialTopic) ? initialTopic : 'all',
  );
  const [session, setSession] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Attempt[]>([]);
  const [generator, setGenerator] = useState(false);
  const [finished, setFinished] = useState(false);
  const [exitRequested, setExitRequested] = useState(false);
  const exitDialogRef = useRef<HTMLDialogElement>(null);
  const overviewRef = useRef<HTMLButtonElement>(null);
  const summaryRef = useRef<HTMLHeadingElement>(null);
  const active = !!session && !finished && answers.length < session.length;
  const repeatQuestions = mistakes
    .map(findQuestion)
    .filter((question): question is Question => !!question);

  useLayoutEffect(() => {
    onSessionChange?.(active);
    return () => onSessionChange?.(false);
  }, [active, onSessionChange]);
  useEffect(() => {
    if (!active) return;
    function beforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [active]);
  useEffect(() => {
    if (exitRequested) exitDialogRef.current?.showModal();
    else exitDialogRef.current?.close();
  }, [exitRequested]);
  useEffect(() => {
    if (finished) summaryRef.current?.focus({ preventScroll: true });
  }, [finished]);

  function leaveSession() {
    setExitRequested(false);
    setSession(null);
    setFinished(false);
  }
  function start(mode: 'practice' | 'exam' | 'mistakes' | 'generator') {
    let selected: Question[] = [];
    if (mode === 'generator') selected = Array.from({ length: 10 }, generatedQuestion);
    else if (mode === 'mistakes') selected = shuffled(repeatQuestions);
    else if (mode === 'exam')
      selected = shuffled(
        topics.map((t) => shuffled(questions.filter((q) => q.topic === t.id && !q.self))[0]),
      );
    else
      selected = shuffled(questions.filter((q) => filter === 'all' || q.topic === filter)).slice(
        0,
        filter === 'all' ? 10 : 5,
      );
    if (!selected.length) return;
    setGenerator(mode === 'generator');
    setSession(selected);
    setIndex(0);
    setAnswers([]);
    setFinished(false);
  }
  const total = session?.length ?? 0;
  const auto = answers.filter((a) => !a.self);
  const correct = auto.filter((a) => a.correct).length;
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">LERNEN & ÜBEN</p>
          <h1>
            {initialMode === 'mistakes'
              ? 'Fehler wiederholen'
              : initialMode === 'exam'
                ? 'Prüfungstraining'
                : 'Übungsfragen'}
          </h1>
          <p>
            {initialMode === 'mistakes'
              ? 'Hier warten Fragen, die du noch einmal üben möchtest.'
              : 'Teste dein Wissen. Zu jeder Antwort erhältst du eine Erklärung.'}
          </p>
        </div>
        {session && (
          <button
            ref={overviewRef}
            className="button secondary"
            onClick={() => {
              if (active) setExitRequested(true);
              else leaveSession();
            }}
          >
            <ArrowLeft size={16} />
            Übersicht
          </button>
        )}
      </div>
      {!session ? (
        <>
          <div className="quiz-setup">
            <section className="card">
              <div className="icon-tile sage">
                <Target size={26} />
              </div>
              <h2>
                {initialMode === 'mistakes'
                  ? 'Deine Wiederholung'
                  : initialMode === 'exam'
                    ? '14 Themen, 14 Fragen'
                    : 'Eine Lernrunde zusammenstellen'}
              </h2>
              <p>
                {initialMode === 'mistakes'
                  ? `${repeatQuestions.length} offene Fragen. Sobald du eine richtig beantwortest, verschwindet sie aus dieser Liste.`
                  : initialMode === 'exam'
                    ? '14 zufällig gewählte Fragen: eine pro Thema. Ohne Zeitdruck, mit Auswertung nach Themen. Ein Übungstest, keine offizielle Prüfung.'
                    : 'Wähle ein Thema oder mische zehn Fragen. Hinweise helfen dir schrittweise weiter.'}
              </p>
              {initialMode === 'practice' && (
                <label>
                  Thema auswählen
                  <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">Alle Themen · 10 Fragen</option>
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} · 5 Fragen
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <button
                className="button primary"
                disabled={initialMode === 'mistakes' && !repeatQuestions.length}
                onClick={() => start(initialMode)}
              >
                {initialMode === 'mistakes' && !repeatQuestions.length
                  ? 'Keine offenen Fehler'
                  : initialMode === 'exam'
                    ? 'Prüfungstraining starten'
                    : 'Lernrunde starten'}
                <ArrowRight size={17} />
              </button>
            </section>
            <section className="card generator-card">
              <div className="icon-tile peach">
                <Shuffle size={26} />
              </div>
              <p className="eyebrow">ZUFÄLLIGE ADRESSEN</p>
              <h2>Neue Subnetting-Aufgaben</h2>
              <p>
                Zehn neu generierte Aufgaben zu Netzadressen und Broadcasts. Von /24 bis /30, mit
                /20 als zusätzlicher Herausforderung.
              </p>
              <button className="button secondary" onClick={() => start('generator')}>
                Aufgaben generieren
                <Shuffle size={16} />
              </button>
              <span className="caption">
                Falsche Aufgaben landen ebenfalls in deiner Fehlerliste.
              </span>
            </section>
          </div>
          <div className="notice">
            {initialMode === 'mistakes' && !repeatQuestions.length
              ? 'Noch keine offenen Fehler. Starte eine Lernrunde; falsche Antworten erscheinen danach hier.'
              : 'Dein Fortschritt bleibt in diesem Browser und lässt sich unter «Fortschritt» exportieren.'}
          </div>
        </>
      ) : finished ? (
        <section className="card results-summary">
          <div className="icon-tile sage">
            <CheckCircle2 size={32} />
          </div>
          <p className="eyebrow">RUNDE ABGESCHLOSSEN</p>
          <h2 ref={summaryRef} tabIndex={-1}>
            {auto.length
              ? `${correct} von ${auto.length} automatisch geprüften Antworten richtig.`
              : 'Deine Selbsteinschätzung ist abgeschlossen.'}
          </h2>
          {answers.some((a) => a.self) && (
            <p>
              {answers.filter((a) => a.self).length} weitere Erklärfragen wurden von dir selbst
              eingeschätzt.
            </p>
          )}
          <p>
            {auto.length && correct === auto.length
              ? 'Alle automatisch geprüften Antworten sind richtig. Du kannst ein anderes Thema üben.'
              : 'Fragen zum erneuten Üben findest du unter «Fehler wiederholen».'}
          </p>
          <div className="topic-results">
            {topics
              .filter((t) => answers.some((a) => findQuestion(a.id)?.topic === t.id))
              .map((t) => {
                const a = answers.filter((a) => findQuestion(a.id)?.topic === t.id);
                const checked = a.filter((x) => !x.self);
                return (
                  <div key={t.id}>
                    <span>{t.title}</span>
                    <strong>
                      {checked.length
                        ? `${checked.filter((x) => x.correct).length}/${checked.length}`
                        : ''}
                      {a.some((x) => x.self) ? `${checked.length ? ' + ' : ''}Selbstkontrolle` : ''}
                    </strong>
                  </div>
                );
              })}
          </div>
          <button
            className="button primary"
            onClick={() => start(generator ? 'generator' : initialMode)}
          >
            Neue Runde
            <RefreshCw size={16} />
          </button>
        </section>
      ) : (
        <>
          <div className="quiz-progress">
            <span>
              Frage {index + 1} von {total}
            </span>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Beantwortete Fragen"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={answers.length}
            >
              <div style={{ width: `${(answers.length / total) * 100}%` }} />
            </div>
            <span>{answers.filter((a) => a.correct && !a.self).length} automatisch richtig</span>
          </div>
          <QuestionCard
            key={`${session[index].id}-${index}`}
            question={session[index]}
            last={index === total - 1}
            onStudyTopic={onStudyTopic}
            onAnswer={(a) => {
              onAnswer(a);
              setAnswers((prev) => [...prev, a]);
            }}
            onNext={() => (index === total - 1 ? setFinished(true) : setIndex(index + 1))}
          />
        </>
      )}
      <dialog
        ref={exitDialogRef}
        className="card quiz-exit-dialog"
        aria-labelledby="quiz-exit-title"
        aria-describedby="quiz-exit-description"
        onCancel={() => setExitRequested(false)}
        onClose={() => {
          setExitRequested(false);
          overviewRef.current?.focus({ preventScroll: true });
        }}
      >
        <h2 id="quiz-exit-title">Lernrunde beenden?</h2>
        <p id="quiz-exit-description">
          Deine bisherigen Antworten bleiben gespeichert. Die aktuelle Runde und eine noch nicht
          geprüfte Eingabe gehen verloren.
        </p>
        <div className="question-actions">
          <button className="button primary" onClick={() => setExitRequested(false)}>
            Weiter üben
          </button>
          <button className="button secondary" onClick={leaveSession}>
            Runde beenden
          </button>
        </div>
      </dialog>
    </>
  );
}
