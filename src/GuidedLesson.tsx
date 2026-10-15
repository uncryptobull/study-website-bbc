import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  Network,
  RotateCcw,
} from 'lucide-react';
import { learningSteps } from './learning';
import { videos, type Topic } from './content';
import { glossary } from './glossary';
import LessonVisual from './LessonVisual';

export default function GuidedLesson({
  topic,
  stepIndex,
  passedSteps,
  onStepChange,
  onUnderstand,
  onComplete,
  onBack,
  onQuiz,
  onTrainer,
  onNextTopic,
}: {
  topic: Topic;
  stepIndex: number;
  passedSteps: string[];
  onStepChange: (n: number) => void;
  onUnderstand: (stepId: string) => void;
  onComplete: () => void;
  onBack: () => void;
  onQuiz: () => void;
  onTrainer: () => void;
  onNextTopic?: () => void;
}) {
  const steps = learningSteps[topic.id],
    allChecksPassed = steps.every((s) => !s.check || passedSteps.includes(s.id)),
    isSummary = stepIndex >= steps.length && allChecksPassed,
    index = Math.max(0, Math.min(steps.length - 1, stepIndex)),
    step = steps[index];
  const [answers, setAnswers] = useState<Record<string, { choice: number; correct: boolean }>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const result = answers[step.id],
    understood = result ? result.correct : passedSteps.includes(step.id);
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [stepIndex]);
  const videoIndex: Record<string, number> = {
    binary: 1,
    ipv4: 0,
    subnetting: 2,
    dhcp: 3,
    dns: 4,
    protocols: 5,
    nat: 6,
    security: 7,
    tools: 8,
  };
  const video = videoIndex[topic.id] !== undefined ? videos[videoIndex[topic.id]] : undefined;
  const vocabulary = glossary
    .filter(([word]) =>
      `${step.title} ${step.explanation.join(' ')} ${step.example?.lines.join(' ')}`
        .toLowerCase()
        .includes(word.toLowerCase()),
    )
    .slice(0, 6);
  function answer(choice: number) {
    const correct = choice === step.check?.correct;
    setAnswers((a) => ({ ...a, [step.id]: { choice, correct } }));
    if (correct) onUnderstand(step.id);
  }
  function advance() {
    if (index === steps.length - 1) {
      const firstMissing = steps.findIndex((s) => s.check && !passedSteps.includes(s.id));
      if (firstMissing !== -1) {
        onStepChange(firstMissing);
        return;
      }
      onComplete();
      onStepChange(steps.length);
    } else onStepChange(index + 1);
  }
  return (
    <>
      <div className="lesson-page-top">
        <button className="text-button" onClick={onBack}>
          <ArrowLeft size={15} />
          Alle Lektionen
        </button>
        <span className="caption">
          {topic.title} · Lernskript S. {topic.page}
        </span>
      </div>
      <div className="guided-layout">
        <aside className="lesson-outline">
          <p className="section-kicker">DIESE LEKTION</p>
          <h2>{topic.title}</h2>
          <p>{topic.goal}</p>
          <nav aria-label="Schritte dieser Lektion">
            {steps.map((s, i) => (
              <button
                key={s.id}
                className={`outline-step ${!isSummary && index === i ? 'current' : ''} ${passedSteps.includes(s.id) ? 'done' : ''}`}
                aria-current={!isSummary && index === i ? 'step' : undefined}
                onClick={() => onStepChange(i)}
              >
                <span>{passedSteps.includes(s.id) ? <Check size={13} /> : i + 1}</span>
                {s.title}
              </button>
            ))}
            <button
              className={`outline-step ${isSummary ? 'current' : ''}`}
              disabled={!allChecksPassed}
              onClick={() => {
                onComplete();
                onStepChange(steps.length);
              }}
            >
              <span>
                <BookOpen size={13} />
              </span>
              Zusammenfassung
            </button>
          </nav>
          <div className="outline-footer">
            <span>
              {steps.filter((s) => passedSteps.includes(s.id)).length} von {steps.length} verstanden
            </span>
            <div className="progress-track">
              <span
                style={{
                  width: `${(steps.filter((s) => passedSteps.includes(s.id)).length / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </aside>
        <div className="guided-main">
          {isSummary ? (
            <section className="lesson-summary">
              <span className="completion-stamp">
                <Check size={22} />
              </span>
              <p className="section-kicker">LEKTION ABGESCHLOSSEN</p>
              <h1 ref={headingRef} tabIndex={-1}>
                Zusammenfassung
              </h1>
              <p className="summary-goal">{topic.goal}</p>
              <ul>
                {steps.map((s) => (
                  <li key={s.id}>
                    <Check size={16} />
                    <span>{s.takeaway ?? s.title}</span>
                  </li>
                ))}
              </ul>
              <div className="summary-actions">
                <button className="button primary" onClick={onQuiz}>
                  Mit fünf Fragen festigen
                  <ArrowRight size={17} />
                </button>
                {onNextTopic && (
                  <button className="button secondary" onClick={onNextTopic}>
                    Nächste Lektion
                    <ArrowRight size={17} />
                  </button>
                )}
              </div>
              <button className="text-button" onClick={() => onStepChange(0)}>
                <RotateCcw size={14} />
                Noch einmal von vorne
              </button>
              <div className="lesson-source">
                Quelle: Telematik-Lernskript, Seite {topic.page}. Die ergänzenden Verständnisfragen
                sind keine offiziellen Prüfungsfragen.
              </div>
            </section>
          ) : (
            <>
              <div className="step-heading">
                <p className="section-kicker">
                  SCHRITT {index + 1} VON {steps.length}
                </p>
                <h1 ref={headingRef} tabIndex={-1}>
                  {step.title}
                </h1>
              </div>
              <section className="lesson-sheet">
                <div className="step-explanation">
                  {step.explanation.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                {step.visual && <LessonVisual kind={step.visual} />}{' '}
                {step.example && (
                  <div className="step-example">
                    <span className="example-label">BEISPIEL</span>
                    <h2>{step.example.title}</h2>
                    <ol>
                      {step.example.lines.map((line, i) => (
                        <li key={i}>
                          <span>{i + 1}</span>
                          <p>{line}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                {step.check && (
                  <section className="understanding-check" aria-label="Kurze Verständnisfrage">
                    <div className="check-header">
                      <span className="check-pencil">?</span>
                      <span>KURZ SELBST PRÜFEN</span>
                      {understood && (
                        <span className="understood-label">
                          <Check size={13} />
                          Verstanden
                        </span>
                      )}
                    </div>
                    <h2>{step.check.prompt}</h2>
                    <div className="check-options">
                      {step.check.options.map((option, i) => (
                        <button
                          key={option}
                          onClick={() => answer(i)}
                          className={`${result?.choice === i ? 'picked' : ''} ${result?.choice === i && result.correct ? 'right' : ''} ${result?.choice === i && !result.correct ? 'retry' : ''}`}
                          aria-pressed={result?.choice === i}
                        >
                          <span>{String.fromCharCode(65 + i)}</span>
                          {option}
                          {result?.choice === i && result.correct && <Check size={17} />}
                        </button>
                      ))}
                    </div>
                    {result && (
                      <div
                        className={`check-feedback ${result.correct ? 'right' : 'retry'}`}
                        role="status"
                      >
                        <strong>
                          {result.correct
                            ? 'Genau.'
                            : 'Schauen wir den entscheidenden Punkt noch einmal an.'}
                        </strong>
                        <p>{step.check.explanation}</p>
                        {!result.correct && (
                          <p className="retry-invitation">
                            Versuche es mit dieser Erklärung noch einmal. Ein Fehler zählt hier
                            nicht gegen dich.
                          </p>
                        )}
                      </div>
                    )}
                  </section>
                )}
                {step.takeaway && (
                  <div className="step-takeaway">
                    <Lightbulb size={18} />
                    <p>{step.takeaway}</p>
                  </div>
                )}
                <div className="step-navigation">
                  <button
                    className="button secondary"
                    disabled={index === 0}
                    onClick={() => onStepChange(index - 1)}
                  >
                    <ArrowLeft size={16} />
                    Zurück
                  </button>
                  <span className="caption">
                    {!step.check || understood
                      ? 'Bereit für den nächsten Gedanken.'
                      : 'Beantworte zuerst die kurze Frage.'}
                  </span>
                  <button
                    className="button primary"
                    disabled={!!step.check && !understood}
                    onClick={advance}
                  >
                    {index === steps.length - 1
                      ? allChecksPassed
                        ? 'Lektion abschliessen'
                        : 'Offene Schritte lesen'
                      : 'Weiter'}
                    <ArrowRight size={17} />
                  </button>
                </div>
              </section>
            </>
          )}
          <div className="lesson-support">
            <details className="lesson-glossary">
              <summary>
                <BookOpen size={16} />
                Begriffe einfach erklärt
                <ChevronRight size={16} />
              </summary>
              <div>
                {(vocabulary.length ? vocabulary : glossary.slice(0, 4)).map(
                  ([term, definition]) => (
                    <dl key={term}>
                      <dt>{term}</dt>
                      <dd>{definition}</dd>
                    </dl>
                  ),
                )}
              </div>
            </details>
            {video && (
              <a
                className="lesson-video"
                href={`https://www.youtube.com/watch?v=${video[2]}`}
                target="_blank"
                rel="noreferrer"
              >
                <span>Noch einmal als Video</span>
                <strong>{video[0]}</strong>
                <small>{video[1]} · Link aus dem Lernskript</small>
                <ExternalLink size={15} />
              </a>
            )}
            {['binary', 'ipv4', 'subnetting'].includes(topic.id) && (
              <button className="lesson-trainer-shortcut" onClick={onTrainer}>
                <Network size={18} />
                <span>Eigene Zahlen ausprobieren</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
