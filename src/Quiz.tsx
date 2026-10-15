import { useState } from 'react';
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
import type { Attempt } from './storage';
export function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export function answerMatches(input: string, expected: string): boolean {
  return input.trim().toLowerCase() === expected.trim().toLowerCase();
}
export function QuestionCard({
  question: q,
  onAnswer,
  onNext,
  last = false,
}: {
  question: Question;
  onAnswer: (attempt: Attempt) => void;
  onNext: () => void;
  last?: boolean;
}) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const [hint, setHint] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [choices] = useState(() => (q.choices ? shuffled(q.choices) : []));
  function submit(correct?: boolean) {
    if (result !== null) return;
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
      <h2>{q.prompt}</h2>
      {q.self ? (
        <>
          <label>
            Deine Erklärung
            <textarea
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
        <div className="choices">
          {choices.map((choice, i) => (
            <button
              key={choice}
              disabled={result !== null}
              onClick={() => setInput(choice)}
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
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) submit();
          }}
        >
          <label>
            Deine Antwort
            <input
              autoComplete="off"
              value={input}
              disabled={result !== null}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Antwort eingeben …"
            />
          </label>
        </form>
      )}
      {hint > 0 && (
        <div className="hint-box">
          <Lightbulb size={18} />
          <div>
            <strong>{hint === 1 ? 'Ein kleiner Hinweis' : 'Der nächste Schritt'}</strong>
            <p>{q.hint}</p>
            {hint > 1 && (
              <p>
                {q.topic === 'subnetting'
                  ? 'Notiere zuerst die Anzahl Hostbits. Leite daraus die Blockgrösse ab und suche die Blockgrenze unterhalb deiner Adresse.'
                  : q.topic === 'binary'
                    ? 'Schreibe die Stellenwerte von 128 bis 1 auf. Gehe von links nach rechts und notiere, welche Werte noch in den Rest passen.'
                    : 'Ordne die Aufgabe zuerst einem Gerät oder Dienst zu. Erkläre seine Funktion, bevor du die Antwort auswählst.'}
              </p>
            )}
          </div>
        </div>
      )}
      {revealed && result === null && (
        <div className="explanation">
          <strong>{q.self ? 'Musterlösung' : 'Lösung zur Selbstkontrolle'}</strong>
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
          <div className={`feedback ${result ? 'success' : 'incorrect'}`} role="status">
            {result ? <CheckCircle2 size={24} /> : <RefreshCw size={24} />}
            <div>
              <h3>
                {q.self
                  ? result
                    ? 'Als verstanden markiert'
                    : 'Für die Wiederholung vorgemerkt'
                  : result
                    ? 'Richtig. Gut verstanden!'
                    : revealed
                      ? 'Mit Lösung geübt. Wiederhole es später.'
                      : 'Noch nicht ganz. Genau hier lernst du.'}
              </h3>
              {!q.self && !result && (
                <p>
                  <strong>Richtige Antwort: {q.answer}</strong>
                </p>
              )}
              <p>{q.explanation}</p>
            </div>
          </div>
          <button className="button primary" onClick={onNext}>
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
                {hint === 0 ? 'Einen Hinweis' : 'Nächster Schritt'}
              </button>
            )}
            {hint >= 2 && !revealed && (
              <button className="button ghost" onClick={() => setRevealed(true)}>
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
                  onClick={() => setRevealed(true)}
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
            <button className="button primary" disabled={!input.trim()} onClick={() => submit()}>
              Antwort prüfen
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
}: {
  onAnswer: (a: Attempt) => void;
  mistakes: string[];
  initialMode?: 'practice' | 'exam' | 'mistakes';
  initialTopic?: string;
}) {
  const [filter, setFilter] = useState(initialTopic);
  const [session, setSession] = useState<Question[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Attempt[]>([]);
  const [generator, setGenerator] = useState(false);
  const [finished, setFinished] = useState(false);
  function start(mode: 'practice' | 'exam' | 'mistakes' | 'generator') {
    let selected: Question[] = [];
    if (mode === 'generator') selected = Array.from({ length: 10 }, generatedQuestion);
    else if (mode === 'mistakes')
      selected = shuffled(mistakes.map(findQuestion).filter((q): q is Question => !!q));
    else if (mode === 'exam')
      selected = shuffled(
        topics.map((t) => shuffled(questions.filter((q) => q.topic === t.id && !q.self))[0]),
      );
    else
      selected = shuffled(questions.filter((q) => filter === 'all' || q.topic === filter)).slice(
        0,
        filter === 'all' ? 10 : 5,
      );
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
          <p className="eyebrow">WISSEN AKTIV ABRUFEN</p>
          <h1>
            {initialMode === 'mistakes'
              ? 'Aus Fehlern wird Wissen'
              : initialMode === 'exam'
                ? 'Dein Prüfungsmodus'
                : 'Übung macht Verständnis'}
            <span>.</span>
          </h1>
          <p>
            {initialMode === 'mistakes'
              ? 'Hier warten Fragen, die du noch einmal üben möchtest.'
              : 'Erst nachdenken. Dann antworten. Aus jeder Antwort etwas mitnehmen.'}
          </p>
        </div>
        {session && (
          <button
            className="button secondary"
            onClick={() => {
              setSession(null);
              setFinished(false);
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
                    ? 'Einmal quer durch den Stoff'
                    : 'Dein nächster Aha-Moment'}
              </h2>
              <p>
                {initialMode === 'mistakes'
                  ? `${mistakes.length} offene Fragen. Sobald du eine richtig beantwortest, verschwindet sie aus dieser Liste.`
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
                disabled={initialMode === 'mistakes' && !mistakes.length}
                onClick={() => start(initialMode)}
              >
                {initialMode === 'mistakes' && !mistakes.length
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
              <p className="eyebrow">IMMER NEUE AUFGABEN</p>
              <h2>Subnetting, frisch gemischt.</h2>
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
            {initialMode === 'mistakes' && !mistakes.length
              ? 'Noch keine offenen Fehler. Starte eine Lernrunde; falsche Antworten erscheinen danach hier.'
              : 'Du lernst für dich. Dein Fortschritt bleibt in diesem Browser und lässt sich unter «Fortschritt» exportieren.'}
          </div>
        </>
      ) : finished ? (
        <section className="card results-summary">
          <div className="icon-tile sage">
            <CheckCircle2 size={32} />
          </div>
          <p className="eyebrow">RUNDE ABGESCHLOSSEN</p>
          <h2>
            {correct} von {auto.length} automatisch geprüften Antworten richtig.
          </h2>
          {answers.some((a) => a.self) && (
            <p>
              {answers.filter((a) => a.self).length} weitere Erklärfragen wurden von dir selbst
              eingeschätzt.
            </p>
          )}
          <p>
            {correct === auto.length
              ? 'Stark! Versuche als Nächstes ein anderes Thema.'
              : 'Jeder Fehler zeigt dir den nächsten sinnvollen Lernschritt.'}
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
                      {checked.filter((x) => x.correct).length}/{checked.length}
                      {a.some((x) => x.self) ? ' + Selbstkontrolle' : ''}
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
            <div className="progress-track">
              <div style={{ width: `${(index / total) * 100}%` }} />
            </div>
            <span>{answers.filter((a) => a.correct && !a.self).length} richtig</span>
          </div>
          <QuestionCard
            key={`${session[index].id}-${index}`}
            question={session[index]}
            last={index === total - 1}
            onAnswer={(a) => {
              onAnswer(a);
              setAnswers((prev) => [...prev, a]);
            }}
            onNext={() => (index === total - 1 ? setFinished(true) : setIndex(index + 1))}
          />
        </>
      )}
    </>
  );
}
