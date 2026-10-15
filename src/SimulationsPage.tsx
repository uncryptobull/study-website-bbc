import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, RotateCcw, Waypoints } from 'lucide-react';
import { simulations } from './simulations';
import { RoutingTableExplorer, PATMappingExplorer } from './SimulationTools';
export default function SimulationsPage() {
  const [selected, setSelected] = useState('web'),
    [step, setStep] = useState(0);
  const sim = simulations.find((s) => s.id === selected)!,
    current = sim.steps[step];
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
        {simulations.map((s) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={s.id === selected}
            className={s.id === selected ? 'active' : ''}
            onClick={() => {
              setSelected(s.id);
              setStep(0);
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
              onClick={() => setStep(i)}
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
          <button
            className="button secondary"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            <ArrowLeft size={16} />
            Zurück
          </button>
          {step === sim.steps.length - 1 ? (
            <button className="button primary" onClick={() => setStep(0)}>
              Noch einmal
              <RotateCcw size={16} />
            </button>
          ) : (
            <button className="button primary" onClick={() => setStep(step + 1)}>
              Nächster Schritt
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </section>
      {selected === 'routing' && <RoutingTableExplorer />}
      {selected === 'nat' && <PATMappingExplorer />}
      <p className="caption simulation-note">
        Das sind vereinfachte Lernmodelle. Im echten Netz beeinflussen unter anderem Caches,
        Protokollvarianten und Konfiguration den Ablauf.
      </p>
    </>
  );
}
