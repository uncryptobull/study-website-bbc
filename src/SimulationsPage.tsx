import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Waypoints } from 'lucide-react';
import { simulations } from './simulations';
import { RoutingTableExplorer, PATMappingExplorer } from './SimulationTools';
type SimulationsPageProps = {
  simulationId?: string;
  stepIndex?: number;
  onNavigate?: (id: string, step: number) => void;
};

function clampStep(index: number | undefined, length: number) {
  return Number.isFinite(index) ? Math.max(0, Math.min(length - 1, Math.trunc(index!))) : 0;
}

export default function SimulationsPage({
  simulationId,
  stepIndex,
  onNavigate,
}: SimulationsPageProps = {}) {
  const [localSelection, setLocalSelection] = useState('web');
  const [rememberedSteps, setRememberedSteps] = useState<Record<string, number>>({ web: 0 });
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const sim =
    simulations.find((item) => item.id === (simulationId ?? localSelection)) ?? simulations[0];
  const selected = sim.id;
  const step = clampStep(stepIndex ?? rememberedSteps[selected], sim.steps.length);

  // Browser back/forward navigation also becomes the position restored on the next tab visit.
  useEffect(() => {
    setRememberedSteps((previous) =>
      previous[selected] === step ? previous : { ...previous, [selected]: step },
    );
  }, [selected, step]);

  function navigate(id: string, nextStep: number) {
    const next = simulations.find((item) => item.id === id) ?? simulations[0];
    const nextIndex = clampStep(nextStep, next.steps.length);
    setLocalSelection(next.id);
    setRememberedSteps((previous) => ({ ...previous, [next.id]: nextIndex }));
    onNavigate?.(next.id, nextIndex);
  }

  function selectTab(index: number) {
    const next = simulations[index];
    navigate(next.id, next.id === selected ? step : (rememberedSteps[next.id] ?? 0));
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="section-kicker">DIE ZUSAMMENHÄNGE</p>
          <h1>Was passiert im Netzwerk?</h1>
          <p>Gehe den Ablauf langsam durch. Du kannst jederzeit einen Schritt wiederholen.</p>
        </div>
      </div>
      <div className="tabs" role="tablist" aria-label="Ablauf auswählen">
        {simulations.map((s, index) => (
          <button
            key={s.id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            id={`simulation-tab-${s.id}`}
            role="tab"
            aria-selected={s.id === selected}
            aria-controls={`simulation-panel-${s.id}`}
            tabIndex={s.id === selected ? 0 : -1}
            className={s.id === selected ? 'active' : ''}
            onClick={() => selectTab(index)}
            onKeyDown={(event) => {
              let nextIndex: number;
              switch (event.key) {
                case 'ArrowLeft':
                  nextIndex = (index + simulations.length - 1) % simulations.length;
                  break;
                case 'ArrowRight':
                  nextIndex = (index + 1) % simulations.length;
                  break;
                case 'Home':
                  nextIndex = 0;
                  break;
                case 'End':
                  nextIndex = simulations.length - 1;
                  break;
                default:
                  return;
              }
              event.preventDefault();
              selectTab(nextIndex);
              tabRefs.current[nextIndex]?.focus();
            }}
          >
            {s.id === 'web'
              ? 'Website öffnen'
              : s.id === 'routing'
                ? 'Routing'
                : s.id === 'nat'
                  ? 'NAT / PAT'
                  : s.id.toUpperCase()}
          </button>
        ))}
      </div>
      {simulations.map((item) => (
        <div
          key={item.id}
          id={`simulation-panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`simulation-tab-${item.id}`}
          tabIndex={0}
          hidden={item.id !== selected}
        >
          {item.id === selected && (
            <SimulationSteps sim={item} step={step} onStep={(index) => navigate(item.id, index)} />
          )}
          {item.id === 'routing' && <RoutingTableExplorer />}
          {item.id === 'nat' && <PATMappingExplorer />}
        </div>
      ))}
      <p className="caption simulation-note">
        Das sind vereinfachte Lernmodelle. Im echten Netz beeinflussen unter anderem Caches,
        Protokollvarianten und Konfiguration den Ablauf.
      </p>
    </>
  );
}

function SimulationSteps({
  sim,
  step,
  onStep,
}: {
  sim: (typeof simulations)[number];
  step: number;
  onStep: (index: number) => void;
}) {
  const current = sim.steps[step];
  return (
    <section className="card simulation-card">
      <div className="section-top">
        <div>
          <h2>{sim.title}</h2>
          <p>{sim.subtitle}</p>
        </div>
        <span className="label-pill">
          {step + 1} / {sim.steps.length}
        </span>
      </div>
      <div className="step-timeline" aria-label="Schritte des Ablaufs">
        {sim.steps.map((s, i) => (
          <button
            key={s[0]}
            onClick={() => onStep(i)}
            className={i === step ? 'current' : i < step ? 'past' : ''}
            aria-label={`Schritt ${i + 1}: ${s[0]}`}
            aria-current={i === step ? 'step' : undefined}
          >
            {i < step ? <Check size={17} /> : i + 1}
          </button>
        ))}
      </div>
      <div className="simulation-stage" aria-live="polite">
        <p className="section-kicker">SCHRITT {step + 1}</p>
        <h2>{current[0]}</h2>
        <p>{current[1]}</p>
        <div className="packet-flow">
          <Waypoints size={18} />
          <code>{current[2]}</code>
        </div>
      </div>
      <div className="section-top">
        <button className="button secondary" disabled={step === 0} onClick={() => onStep(step - 1)}>
          <ArrowLeft size={16} />
          Zurück
        </button>
        {step === sim.steps.length - 1 ? (
          <button className="button primary" onClick={() => onStep(0)}>
            Noch einmal
            <RotateCcw size={16} />
          </button>
        ) : (
          <button className="button primary" onClick={() => onStep(step + 1)}>
            Nächster Schritt
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </section>
  );
}
