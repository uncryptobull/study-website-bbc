import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Coffee,
  Download,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Moon,
  Network,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Upload,
  Waypoints,
  X,
} from 'lucide-react';
import { topics, questions, videos, type Topic } from './content';
import Trainer from './Trainer';
import Quiz from './Quiz';
import { simulations } from './simulations';
import {
  emptyProgress,
  readProgress,
  storageKey,
  validateProgress,
  type Attempt,
  type Progress,
} from './storage';

type Page =
  | 'dashboard'
  | 'learn'
  | 'trainer'
  | 'quiz'
  | 'simulations'
  | 'mistakes'
  | 'progress'
  | 'sources'
  | 'exam';
const navigation: { id: Page; label: string; icon: typeof BookOpen }[] = [
  { id: 'dashboard', label: 'Übersicht', icon: LayoutDashboard },
  { id: 'learn', label: 'Dein Lernpfad', icon: BookOpen },
  { id: 'trainer', label: 'Netzwerk-Labor', icon: FlaskConical },
  { id: 'quiz', label: 'Üben & festigen', icon: Target },
  { id: 'simulations', label: 'Abläufe verstehen', icon: Waypoints },
  { id: 'mistakes', label: 'Meine Fehler', icon: RotateCcw },
];
const validPages: Page[] = [...navigation.map((n) => n.id), 'progress', 'sources', 'exam'];
function initialPage(): Page {
  const id = location.hash.slice(1) as Page;
  return validPages.includes(id) ? id : 'dashboard';
}
function initialTheme() {
  try {
    return localStorage.getItem('telematik-theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}
export default function App() {
  const [page, setPage] = useState<Page>(initialPage);
  const [theme, setTheme] = useState(initialTheme);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [topic, setTopic] = useState<string | null>(null);
  const [quizTopic, setQuizTopic] = useState('all');
  const [search, setSearch] = useState('');
  const [initial] = useState(readProgress);
  const [progress, setProgress] = useState<Progress>(initial.progress);
  const [warning, setWarning] = useState(initial.warning);
  const [timer, setTimer] = useState<number | null>(null);
  const [timerDone, setTimerDone] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const firstRoute = useRef(true);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('telematik-theme', theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      setWarning(
        'Speichern im Browser ist blockiert oder der Speicher ist voll. Exportiere deinen Fortschritt unter «Fortschritt».',
      );
    }
  }, [progress]);
  useEffect(() => {
    function change() {
      setPage(initialPage());
      setMobileOpen(false);
    }
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [page]);
  useEffect(() => {
    if (timer === null) return;
    const id = window.setInterval(
      () =>
        setTimer((previous) => {
          if (previous === null) return null;
          if (previous <= 1) {
            setTimerDone(true);
            return null;
          }
          return previous - 1;
        }),
      1000,
    );
    return () => clearInterval(id);
  }, [timer !== null]);
  function navigate(id: Page) {
    location.hash = id;
    setPage(id);
    setMobileOpen(false);
  }
  function openTopic(id: string) {
    setTopic(id);
    navigate('learn');
  }
  function record(a: Attempt) {
    setProgress((p) => ({
      ...p,
      attempts: [...p.attempts, a],
      mistakes: a.correct
        ? p.mistakes.filter((id) => id !== a.id)
        : [...new Set([...p.mistakes, a.id])],
    }));
  }
  function toggleCompleted(id: string) {
    setProgress((p) => ({
      ...p,
      completed: p.completed.includes(id)
        ? p.completed.filter((i) => i !== id)
        : [...p.completed, id],
    }));
  }
  const completed = topics.filter((t) => progress.completed.includes(t.id)).length;
  const percent = Math.round((completed / 14) * 100);
  const automatic = progress.attempts.filter((a) => !a.self);
  const correct = automatic.filter((a) => a.correct).length;
  const next = topics.find((t) => !progress.completed.includes(t.id)) ?? topics[0];
  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus({ preventScroll: true });
        }}
      >
        Zum Inhalt springen
      </a>
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <button
          className="brand"
          onClick={() => navigate('dashboard')}
          aria-label="Telematik verstehen – Übersicht"
        >
          <span className="brand-symbol">
            <Network size={26} />
          </span>
          <span>
            telematik<span className="brand-sub">verstehen.</span>
          </span>
        </button>
        <div className="sidebar-caption">DEIN DIGITALER LERNRAUM</div>
        <nav aria-label="Hauptnavigation">
          {navigation.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                if (n.id === 'learn') setTopic(null);
                navigate(n.id);
              }}
              className={`nav-item ${page === n.id ? 'selected' : ''}`}
              aria-current={page === n.id ? 'page' : undefined}
            >
              <n.icon size={19} />
              <span>{n.label}</span>
              {n.id === 'mistakes' && progress.mistakes.length > 0 ? (
                <span className="nav-badge">{progress.mistakes.length}</span>
              ) : page === n.id ? (
                <span className="nav-dot" />
              ) : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-exam">
          <div className="exam-icon">
            <GraduationCap size={21} />
          </div>
          <h3>Bereit für den Check?</h3>
          <p>Teste dein Wissen quer durch alle 14 Themen.</p>
          <button onClick={() => navigate('exam')}>
            Prüfungstraining
            <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="sidebar-bottom">
          <button
            className={`nav-item ${page === 'progress' ? 'selected' : ''}`}
            onClick={() => navigate('progress')}
          >
            <TrendingUp size={18} />
            Dein Fortschritt
          </button>
          <button
            className={`nav-item ${page === 'sources' ? 'selected' : ''}`}
            onClick={() => navigate('sources')}
          >
            <CircleHelp size={18} />
            Material & Quellen
          </button>
          <div className="sidebar-footer">
            <span className="status-light" />
            Ohne Anmeldung. Für dich.
          </div>
        </div>
      </aside>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Menü schliessen"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menü öffnen"
            >
              <Menu size={21} />
            </button>
            <span>Dein Lernraum</span>
            <ChevronRight size={14} />
            <strong>
              {page === 'exam'
                ? 'Prüfungstraining'
                : (navigation.find((n) => n.id === page)?.label ??
                  (page === 'progress' ? 'Fortschritt' : 'Material & Quellen'))}
            </strong>
          </div>
          <div className="topbar-actions">
            <span className="saved-indicator">
              <ShieldCheck size={15} />
              {warning ? 'Speichern prüfen' : 'Lokal gespeichert'}
            </span>
            <button
              className={`focus-button ${timer !== null ? 'running' : ''}`}
              onClick={() => {
                setTimerDone(false);
                setTimer(timer === null ? 25 * 60 : null);
              }}
              aria-label={timer !== null ? 'Fokuszeit beenden' : '25 Minuten Fokuszeit starten'}
            >
              <Clock3 size={16} />
              {timer !== null
                ? `${Math.floor(timer / 60)
                    .toString()
                    .padStart(2, '0')}:${(timer % 60).toString().padStart(2, '0')}`
                : 'Fokuszeit'}
              {timer !== null && <X size={13} />}
            </button>
            <button
              className="icon-button theme-switch"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label={theme === 'light' ? 'Dunkelmodus aktivieren' : 'Hellmodus aktivieren'}
            >
              {theme === 'light' ? <Moon size={19} /> : <Sun size={19} />}
            </button>
            <div className="avatar" title="Dein lokales Lernprofil">
              DU
            </div>
          </div>
        </header>
        <main id="main-content" ref={mainRef} tabIndex={-1}>
          {warning && (
            <div className="notice warning" role="alert">
              {warning}
              <button
                className="icon-button"
                aria-label="Hinweis schliessen"
                onClick={() => setWarning('')}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {timerDone && (
            <div className="notice" role="status">
              <Coffee size={20} />
              25 Minuten geschafft. Zeit für eine kurze Pause!
              <button
                className="icon-button"
                aria-label="Hinweis schliessen"
                onClick={() => setTimerDone(false)}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {page === 'dashboard' && (
            <>
              <div className="page-heading">
                <div>
                  <p className="eyebrow">KLEINE SCHRITTE. GROSSE AHA-MOMENTE.</p>
                  <h1>
                    Verstehen statt auswendig lernen<span>.</span>
                  </h1>
                  <p>Dein Weg durch die Telematik. Ein Thema nach dem anderen.</p>
                </div>
                <span className="label-pill desktop-label">
                  <span className="status-light" />
                  14 Themen · dein Tempo
                </span>
              </div>
              <section className="hero">
                <div className="hero-copy">
                  <span className="hero-label">
                    <Sparkles size={14} />
                    DEIN NÄCHSTER LERNSCHRITT
                  </span>
                  <h2>
                    {completed === 14 ? (
                      'Alles durch? Jetzt anwenden.'
                    ) : next.id === 'binary' ? (
                      <>
                        Jedes Netzwerk beginnt
                        <br />
                        mit einem kleinen Bit.
                      </>
                    ) : (
                      next.title
                    )}
                  </h2>
                  <p>
                    {completed === 14
                      ? 'Wiederhole deine Fehler oder stelle dich dem gemischten Prüfungstraining.'
                      : next.id === 'binary'
                        ? 'Von 0 und 1 zu IP-Adressen: Baue dir ein Fundament, auf dem der Rest plötzlich Sinn ergibt.'
                        : next.subtitle +
                          '. Verstehe die Grundlagen, probiere sie aus und teste dein Wissen.'}
                  </p>
                  <div className="hero-actions">
                    <button
                      className="button lime"
                      onClick={() => (completed === 14 ? navigate('exam') : openTopic(next.id))}
                    >
                      {completed === 14 ? 'Prüfungstraining starten' : 'Weiterlernen'}
                      <ArrowRight size={17} />
                    </button>
                    <span>
                      <Clock3 size={15} />
                      {next.duration} Min. Lese- & Übungszeit
                    </span>
                  </div>
                </div>
                <NetworkArtwork />
              </section>
              <div className="stats-grid">
                <Stat
                  icon={<BookOpen size={21} />}
                  label="Dein Lernpfad"
                  value={
                    <>
                      {completed}
                      <small> / 14</small>
                    </>
                  }
                  note="Lektionen abgeschlossen"
                />
                <Stat
                  icon={<Target size={21} />}
                  label="Aktiv geübt"
                  value={automatic.length.toString()}
                  note="automatisch geprüfte Antworten"
                />
                <Stat
                  icon={<TrendingUp size={21} />}
                  label="Deine Trefferquote"
                  value={
                    automatic.length ? `${Math.round((correct / automatic.length) * 100)}%` : '–'
                  }
                  note={
                    automatic.length
                      ? `${correct} von ${automatic.length} Antworten richtig`
                      : 'Starte deine erste Lernrunde'
                  }
                />
                <div className="card stat-card progress-stat">
                  <div
                    className="progress-ring"
                    style={{ '--progress': `${percent * 3.6}deg` } as React.CSSProperties}
                  >
                    <span>
                      {percent}
                      <small>%</small>
                    </span>
                  </div>
                  <div>
                    <h3>Schritt für Schritt.</h3>
                    <p>
                      {completed === 0
                        ? 'Dein erster Aha-Moment wartet.'
                        : completed === 14
                          ? 'Alle Lektionen abgeschlossen!'
                          : 'Jede Lektion bringt dich weiter.'}
                    </p>
                    <button className="text-button" onClick={() => navigate('progress')}>
                      Fortschritt ansehen
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="dashboard-lower">
                <section>
                  <div className="section-heading">
                    <div>
                      <p className="eyebrow">DEIN WISSEN WÄCHST</p>
                      <h2>Entdecke deinen Lernpfad</h2>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => {
                        setTopic(null);
                        navigate('learn');
                      }}
                    >
                      Alle 14 Themen
                      <ArrowRight size={15} />
                    </button>
                  </div>
                  <div className="topic-grid dashboard-topics">
                    {topics.slice(0, 6).map((t, i) => (
                      <TopicCard
                        key={t.id}
                        topic={t}
                        index={i}
                        completed={progress.completed.includes(t.id)}
                        onClick={() => openTopic(t.id)}
                      />
                    ))}
                  </div>
                </section>
                <aside className="dashboard-right">
                  <section className="lab-promo">
                    <div className="lab-icon">
                      <FlaskConical size={25} />
                    </div>
                    <span className="eyebrow">WENIGER GRÜBELN. MEHR MACHEN.</span>
                    <h2>
                      Subnetting?
                      <br />
                      Klickt gleich.
                    </h2>
                    <p>Bits umschalten, Netzgrenzen sehen und den Rechenweg verstehen.</p>
                    <div className="mini-bits">
                      <span>1</span>
                      <span>1</span>
                      <span>0</span>
                      <span>0</span>
                      <i>/26</i>
                    </div>
                    <button className="button primary" onClick={() => navigate('trainer')}>
                      Ab ins Netzwerk-Labor
                      <ArrowUpRight size={17} />
                    </button>
                  </section>
                  <div className="study-tip">
                    <LightbulbIcon />
                    <div>
                      <h3>Ein kleiner Lerntipp</h3>
                      <p>
                        Erkläre nach jeder Lektion einen Begriff laut, ohne nachzulesen. Das ist
                        aktives Erinnern.
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
          {page === 'learn' &&
            (topic ? (
              <Lesson
                topic={topics.find((t) => t.id === topic) ?? topics[0]}
                completed={progress.completed.includes(topic)}
                onBack={() => setTopic(null)}
                onComplete={() => toggleCompleted(topic)}
                onQuiz={() => {
                  setQuizTopic(topic);
                  navigate('quiz');
                }}
                onTrainer={() => navigate('trainer')}
                onNext={() => {
                  const i = topics.findIndex((t) => t.id === topic);
                  setTopic(topics[(i + 1) % 14].id);
                  window.scrollTo(0, 0);
                }}
              />
            ) : (
              <>
                <div className="page-heading">
                  <div>
                    <p className="eyebrow">VOM FUNDAMENT ZUM ZUSAMMENHANG</p>
                    <h1>
                      Dein Lernpfad<span>.</span>
                    </h1>
                    <p>14 Themen. Eine verständliche Reihenfolge. Dein eigenes Tempo.</p>
                  </div>
                  <span className="label-pill">{completed} von 14 abgeschlossen</span>
                </div>
                <div className="search-box">
                  <Search size={19} />
                  <input
                    aria-label="Themen suchen"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Thema oder Begriff suchen …"
                  />
                  {search && (
                    <button
                      className="icon-button"
                      aria-label="Suche leeren"
                      onClick={() => setSearch('')}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <div className="topic-grid learning-grid">
                  {topics
                    .map((t, i) => ({ t, i }))
                    .filter(({ t }) =>
                      `${t.title} ${t.subtitle} ${t.paragraphs.join(' ')}`
                        .toLowerCase()
                        .includes(search.toLowerCase()),
                    )
                    .map(({ t, i }) => (
                      <TopicCard
                        key={t.id}
                        topic={t}
                        index={i}
                        completed={progress.completed.includes(t.id)}
                        onClick={() => setTopic(t.id)}
                      />
                    ))}
                </div>
                {!topics.some((t) =>
                  `${t.title} ${t.subtitle} ${t.paragraphs.join(' ')}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                ) && (
                  <div className="empty-state">
                    Kein Thema gefunden. Versuche einen allgemeineren Begriff.
                  </div>
                )}
              </>
            ))}
          {page === 'trainer' && <Trainer />}
          {(page === 'quiz' || page === 'exam' || page === 'mistakes') && (
            <Quiz
              key={`${page}-${quizTopic}`}
              onAnswer={record}
              mistakes={progress.mistakes}
              initialMode={page === 'exam' ? 'exam' : page === 'mistakes' ? 'mistakes' : 'practice'}
              initialTopic={quizTopic}
            />
          )}
          {page === 'simulations' && <Simulations />}
          {page === 'progress' && (
            <ProgressPage progress={progress} setProgress={setProgress} openTopic={openTopic} />
          )}
          {page === 'sources' && <Sources />}
          <footer className="main-footer">
            <span>Mit Neugier lernt es sich leichter.</span>
            <span>Telematik verstehen · Für deinen nächsten Aha-Moment.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
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
function LightbulbIcon() {
  return <span className="tip-symbol">✳</span>;
}
function NetworkArtwork() {
  return (
    <div className="network-art" aria-hidden="true">
      <div className="art-grid" />
      <svg className="art-lines" viewBox="0 0 420 270">
        <path d="M68 81 H190 V135 H322 M190 135 V222 H278 M190 135 V44 H294" />
        <circle cx="190" cy="135" r="5" />
        <circle cx="190" cy="81" r="4" />
        <circle cx="190" cy="222" r="4" />
      </svg>
      <div className="art-node node-laptop">
        <div className="laptop-screen">
          <div />
          <span>01001101</span>
          <i />
        </div>
        <div className="laptop-base" />
        <span className="art-caption">DEIN NOTEBOOK</span>
      </div>
      <div className="art-node node-router">
        <div className="router-box">
          <Network size={28} />
          <div>
            <i />
            <i />
            <i />
          </div>
        </div>
        <span className="art-caption">GATEWAY</span>
      </div>
      <div className="art-node node-cloud">
        <div className="cloud-icon">☁</div>
        <span className="art-caption">INTERNET</span>
      </div>
      <div className="art-chip chip-ip">
        <span className="status-light" />
        192.168.1.77<span>/26</span>
      </div>
      <div className="art-chip chip-bits">0 1 0 0 1 1 0 1</div>
      <div className="art-orbit orbit-one" />
      <div className="art-orbit orbit-two" />
    </div>
  );
}
function TopicCard({
  topic: t,
  index,
  completed,
  onClick,
}: {
  topic: Topic;
  index: number;
  completed: boolean;
  onClick: () => void;
}) {
  return (
    <button className={`topic-card ${completed ? 'is-completed' : ''}`} onClick={onClick}>
      <div className="topic-top">
        <span className={`topic-number ${t.tag === 'Fokus' ? 'focus-number' : ''}`}>
          {completed ? <Check size={20} /> : String(index + 1).padStart(2, '0')}
        </span>
        <span className={`topic-tag ${t.tag === 'Fokus' ? 'focus-tag' : ''}`}>
          {completed ? 'Abgeschlossen' : t.tag}
        </span>
        <ArrowUpRight size={17} className="topic-arrow" />
      </div>
      <h3>{t.title}</h3>
      <p>{t.subtitle}</p>
      <div className="topic-meta">
        <Clock3 size={13} />
        {t.duration} Min.
        <span className="topic-meta-dot" />
        {questions.filter((q) => q.topic === t.id).length} Übungen
      </div>
    </button>
  );
}
function Lesson({
  topic: t,
  completed,
  onBack,
  onComplete,
  onQuiz,
  onTrainer,
  onNext,
}: {
  topic: Topic;
  completed: boolean;
  onBack: () => void;
  onComplete: () => void;
  onQuiz: () => void;
  onTrainer: () => void;
  onNext: () => void;
}) {
  const [example, setExample] = useState(true);
  return (
    <>
      <button className="text-button back-button" onClick={onBack}>
        <ArrowLeft size={16} />
        Zum Lernpfad
      </button>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            LEKTION {String(topics.indexOf(t) + 1).padStart(2, '0')} / 14 · {t.tag.toUpperCase()}
          </p>
          <h1>
            {t.title}
            <span>.</span>
          </h1>
          <p>{t.subtitle}</p>
        </div>
        <span className="label-pill">
          <Clock3 size={15} />
          {t.duration} Minuten
        </span>
      </div>
      <div className="lesson-layout">
        <article className="card lesson-content">
          <div className="learning-goal">
            <span className="icon-tile sage">
              <Target size={23} />
            </span>
            <div>
              <p className="eyebrow">DAS KANNST DU DANACH</p>
              <p>{t.goal}</p>
            </div>
          </div>
          <h2>Schritt für Schritt verstehen</h2>
          {t.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="worked-example">
            <button onClick={() => setExample(!example)} aria-expanded={example}>
              <span>
                <FlaskConical size={19} />
                Ein konkretes Beispiel
              </span>
              <span>{example ? '−' : '+'}</span>
            </button>
            {example && <p>{t.example}</p>}
          </div>
          <h2>Hier stolpern viele</h2>
          <ul className="mistake-list">
            {t.mistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <div className="takeaway">
            <Sparkles size={21} />
            <div>
              <h3>Das nimmst du mit</h3>
              <p>{t.takeaway}</p>
            </div>
          </div>
          <div className="lesson-source">
            Quelle: Telematik-Lernskript, Seite {t.page}. Fachliche Präzisierungen auf Seite 20.
            Originalhandouts liegen diesem Projekt nicht vor.
          </div>
          <div className="lesson-actions">
            <button
              className={`button ${completed ? 'secondary' : 'primary'}`}
              onClick={onComplete}
            >
              <CheckCircle2 size={17} />
              {completed ? 'Als offen markieren' : 'Lektion abschliessen'}
            </button>
            <button className="button secondary" onClick={onNext}>
              Nächstes Thema
              <ArrowRight size={16} />
            </button>
          </div>
        </article>
        <aside>
          <section className="card lesson-practice">
            <div className="icon-tile peach">
              <Target size={24} />
            </div>
            <h2>Jetzt bist du dran.</h2>
            <p>
              Teste dein Verständnis mit fünf Fragen zu diesem Thema. Lösungen bleiben zuerst
              verborgen.
            </p>
            <button className="button primary" onClick={onQuiz}>
              Wissen testen
              <ArrowRight size={16} />
            </button>
            {['binary', 'ipv4', 'subnetting', 'addressing'].includes(t.id) && (
              <button className="button secondary" onClick={onTrainer}>
                <FlaskConical size={16} />
                Im Labor ausprobieren
              </button>
            )}
          </section>
          <div className="study-tip">
            <LightbulbIcon />
            <div>
              <h3>Wirklich verstanden?</h3>
              <p>
                Schliesse die Lektion erst ab, wenn du die Kernaussage ohne Vorlage erklären kannst.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
function Simulations() {
  const [selected, setSelected] = useState('web');
  const [step, setStep] = useState(0);
  const sim = simulations.find((s) => s.id === selected)!;
  const s = sim.steps[step];
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">DAS GROSSE GANZE</p>
          <h1>
            So hängt alles zusammen<span>.</span>
          </h1>
          <p>Gehe einen Netzwerkablauf Schritt für Schritt durch. Ohne echte Netzwerkanfragen.</p>
        </div>
      </div>
      <div className="tabs" role="tablist" aria-label="Ablauf auswählen">
        {simulations.map((s) => (
          <button
            role="tab"
            aria-selected={s.id === selected}
            className={s.id === selected ? 'active' : ''}
            key={s.id}
            onClick={() => {
              setSelected(s.id);
              setStep(0);
            }}
          >
            {s.id === 'web' ? 'Website öffnen' : s.id.toUpperCase()}
          </button>
        ))}
      </div>
      <section className="card simulation-card">
        <div className="section-top">
          <div>
            <p className="eyebrow">INTERAKTIVER ABLAUF</p>
            <h2>{sim.title}</h2>
            <p>{sim.subtitle}</p>
          </div>
          <span className="label-pill">
            Schritt {step + 1} von {sim.steps.length}
          </span>
        </div>
        <div className="step-timeline">
          {sim.steps.map((s, i) => (
            <button
              key={s[0]}
              onClick={() => setStep(i)}
              className={i === step ? 'current' : i < step ? 'past' : ''}
              aria-label={`Schritt ${i + 1}: ${s[0]}`}
              aria-current={i === step ? 'step' : undefined}
            >
              {i < step ? <Check size={18} /> : i + 1}
            </button>
          ))}
        </div>
        <div className="simulation-stage">
          <Waypoints size={42} />
          <h2>{s[0]}</h2>
          <p>{s[1]}</p>
          <div className="packet-flow">
            <span className="status-light" />
            <code>{s[2]}</code>
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
      <div className="notice">
        Vereinfachte Lernmodelle: Caches, Protokollvarianten und lokale Konfiguration können den
        tatsächlichen Ablauf verändern.
      </div>
    </>
  );
}
function ProgressPage({
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
  const auto = progress.attempts.filter((a) => !a.self);
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">DEIN WISSEN SICHTBAR MACHEN</p>
          <h1>
            Jeder Schritt zählt<span>.</span>
          </h1>
          <p>Ein ehrlicher Blick auf deinen Lernstand. Alles bleibt in deinem Browser.</p>
        </div>
        <button className="button secondary" onClick={exportProgress}>
          <Download size={17} />
          Fortschritt sichern
        </button>
      </div>
      <div className="stats-grid three-stats">
        <Stat
          label="Lektionen"
          icon={<BookOpen size={21} />}
          value={`${topics.filter((t) => progress.completed.includes(t.id)).length}/14`}
          note="von dir als abgeschlossen markiert"
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
                <span
                  className={`completion-dot ${progress.completed.includes(t.id) ? 'done' : ''}`}
                >
                  {progress.completed.includes(t.id) ? <Check size={13} /> : null}
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
        <h2>Dein Fortschritt gehört dir.</h2>
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
function Sources() {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">GUTE QUELLEN. KLARE GRENZEN.</p>
          <h1>
            Zum Nachlesen & Weiterdenken<span>.</span>
          </h1>
          <p>Die Grundlagen hinter deinem Lernraum.</p>
        </div>
      </div>
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
          <p className="eyebrow">ANSCHAUEN. DANN SELBST ERKLÄREN.</p>
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
