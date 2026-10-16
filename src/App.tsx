import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Coffee,
  FileText,
  Download,
  GraduationCap,
  Home,
  Menu,
  Moon,
  Network,
  RotateCcw,
  Search,
  Sun,
  Target,
  TrendingUp,
  Waypoints,
  X,
} from 'lucide-react';
import { topics, questions, type Topic } from './content';
import { learningGroups, learningSteps } from './learning';
import Trainer from './Trainer';
import Quiz from './Quiz';
import PracticePage from './PracticePage';
import GuidedLesson from './GuidedLesson';
import SimulationsPage from './SimulationsPage';
import { ProgressPage, Sources } from './StudyPages';
import { emptyProgress, readProgress, storageKey, type Attempt, type Progress } from './storage';
import { saveOfflineApp } from './offline-download';
import { guidedCompleted } from './learning-progress';
import { pageNames, parseRoute, routeHash, type Page, type Route } from './navigation';

const navigation: { group: string; items: { id: Page; label: string; icon: typeof BookOpen }[] }[] =
  [
    {
      group: 'Lernen',
      items: [
        { id: 'dashboard', label: 'Start', icon: Home },
        { id: 'learn', label: 'Lektionen', icon: BookOpen },
      ],
    },
    {
      group: 'Anwenden',
      items: [
        { id: 'trainer', label: 'IP-Trainer', icon: Network },
        { id: 'quiz', label: 'Übungen', icon: Target },
        { id: 'simulations', label: 'Abläufe', icon: Waypoints },
        { id: 'exam', label: 'Prüfungstraining', icon: GraduationCap },
        { id: 'mistakes', label: 'Fehler wiederholen', icon: RotateCcw },
      ],
    },
  ];
export const friendlyTitles: Record<string, string> = {
  devices: 'Wie Geräte miteinander sprechen',
  addressing: 'Wozu ein Gerät eine Adresse braucht',
  binary: 'Mit 0 und 1 rechnen',
  ipv4: 'IP-Adresse und Netzmaske',
  subnetting: 'Ein Netz in kleinere Netze aufteilen',
};
function initialTheme() {
  try {
    return localStorage.getItem('telematik-theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'light';
  }
}
function courseTopics() {
  return learningGroups.flatMap((group) =>
    group.topics.map((id) => topics.find((t) => t.id === id)!),
  );
}
export default function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute(location.hash));
  const routeRef = useRef(route);
  routeRef.current = route;
  const [theme, setTheme] = useState(initialTheme),
    [mobileOpen, setMobileOpen] = useState(false),
    [search, setSearch] = useState('');
  const [initial] = useState(readProgress),
    [progress, setProgress] = useState<Progress>(initial.progress),
    [warning, setWarning] = useState(initial.warning);
  const [downloadNotice, setDownloadNotice] = useState('');
  const [sessionActive, setSessionActive] = useState(false),
    [pendingRoute, setPendingRoute] = useState<Route | null>(null);
  const sessionRef = useRef(false);
  sessionRef.current = sessionActive;
  const dialogRef = useRef<HTMLDialogElement>(null),
    mainRef = useRef<HTMLElement>(null),
    searchRef = useRef<HTMLInputElement>(null);
  const [deadline, setDeadline] = useState<number | null>(null),
    [remaining, setRemaining] = useState(1500),
    [timerDone, setTimerDone] = useState(false);
  const page = route.page,
    topic = route.topic;
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('telematik-theme', theme);
    } catch {}
  }, [theme]);
  useEffect(() => {
    if (initial.warning && progress === initial.progress) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(progress));
    } catch {
      setWarning(
        'Dein Browser erlaubt das Speichern gerade nicht. Sichere deinen Fortschritt unter «Fortschritt» als Datei.',
      );
    }
  }, [progress, initial]);
  useEffect(() => {
    function change() {
      const incoming = parseRoute(location.hash);
      if (sessionRef.current && routeHash(incoming) !== routeHash(routeRef.current)) {
        history.replaceState(null, '', routeHash(routeRef.current));
        setPendingRoute(incoming);
        return;
      }
      setRoute(incoming);
      setMobileOpen(false);
    }
    window.addEventListener('hashchange', change);
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
    document.title = `${topic && page === 'learn' ? topics.find((t) => t.id === topic)?.title : pageNames[page]} · Telematik verstehen`;
  }, [route]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (pendingRoute && !dialog.open) dialog.showModal();
    if (!pendingRoute && dialog.open) dialog.close();
  }, [pendingRoute]);
  useEffect(() => {
    if (deadline === null) return;
    function tick() {
      const left = Math.max(0, Math.ceil((deadline! - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setDeadline(null);
        setTimerDone(true);
      }
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);
  useEffect(() => {
    function keys(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        requestNavigation({ page: 'learn' });
        setTimeout(() => searchRef.current?.focus(), 0);
      }
      if (e.key === 'Escape') setMobileOpen(false);
    }
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  }, []);
  function applyRoute(next: Route) {
    history.pushState(null, '', routeHash(next));
    setRoute(next);
    setMobileOpen(false);
  }
  function requestNavigation(next: Route) {
    if (sessionRef.current && routeHash(next) !== routeHash(routeRef.current)) {
      setPendingRoute(next);
      return;
    }
    applyRoute(next);
  }
  function navigate(id: Page) {
    requestNavigation({ page: id });
  }
  function openTopic(id: string, step?: number) {
    const saved = progress.lastLesson?.topic === id ? progress.lastLesson.step : 0;
    requestNavigation({ page: 'learn', topic: id, step: step ?? saved });
  }
  function studyStep(step: number) {
    if (!topic) return;
    applyRoute({ page: 'learn', topic, step });
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
  function stepUnderstood(id: string, stepId: string) {
    setProgress((p) => ({
      ...p,
      lessonSteps: {
        ...p.lessonSteps,
        [id]: [...new Set([...(p.lessonSteps?.[id] ?? []), stepId])],
      },
      lastLesson: {
        topic: id,
        step: Math.max(
          0,
          learningSteps[id].findIndex((s) => s.id === stepId),
        ),
      },
    }));
  }
  function completeLesson(id: string) {
    setProgress((p) => ({ ...p, completed: [...new Set([...p.completed, id])] }));
  }
  const finishedTopics = guidedCompleted(progress),
    viewProgress = { ...progress, completed: finishedTopics };
  const ordered = courseTopics(),
    completed = finishedTopics.length;
  const next =
    progress.lastLesson && !finishedTopics.includes(progress.lastLesson.topic)
      ? (topics.find((t) => t.id === progress.lastLesson!.topic) ?? ordered[0])
      : (ordered.find((t) => !finishedTopics.includes(t.id)) ?? ordered[0]);
  useEffect(() => {
    if (page === 'learn' && topic) {
      const step = route.step ?? 0;
      setProgress((p) =>
        p.lastLesson?.topic === topic && p.lastLesson.step === step
          ? p
          : { ...p, lastLesson: { topic, step } },
      );
    }
  }, [page, topic, route.step]);
  const nextTopic = topic ? ordered[ordered.findIndex((t) => t.id === topic) + 1] : undefined;
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
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`} id="primary-sidebar">
        <button
          className="brand"
          onClick={() => navigate('dashboard')}
          aria-label="Telematik verstehen – Start"
        >
          <span className="brand-symbol">
            tv<span>.</span>
          </span>
          <span>
            Telematik<span className="brand-sub">verstehen</span>
          </span>
        </button>
        <div className="sidebar-course">Netzwerktechnik · Lernskript</div>
        <nav aria-label="Hauptnavigation">
          {navigation.map((group) => (
            <div className="nav-group" key={group.group}>
              <p className="nav-group-label">{group.group}</p>
              {group.items.map((n) => (
                <button
                  className={`nav-item ${page === n.id ? 'selected' : ''}`}
                  aria-current={page === n.id ? 'page' : undefined}
                  key={n.id}
                  onClick={() => navigate(n.id)}
                >
                  <n.icon size={18} />
                  <span>{n.label}</span>
                  {n.id === 'mistakes' && progress.mistakes.length > 0 && (
                    <span className="nav-badge">{progress.mistakes.length}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-progress">
          <div>
            <span>Lektionen gelesen</span>
            <strong>{completed}/14</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${(completed / 14) * 100}%` }} />
          </div>
          <button className="text-button" onClick={() => navigate('progress')}>
            Fortschritt ansehen
            <ArrowRight size={14} />
          </button>
        </div>
        <div className="sidebar-bottom">
          <button
            className={`nav-item ${page === 'sources' ? 'selected' : ''}`}
            onClick={() => navigate('sources')}
          >
            <FileText size={18} />
            Nachschlagen
          </button>
          <button
            className={`nav-item ${page === 'progress' ? 'selected' : ''}`}
            onClick={() => navigate('progress')}
          >
            <TrendingUp size={18} />
            Fortschritt & Sicherung
          </button>
          <div className="sidebar-footer">
            <span className="status-light" />
            {warning ? 'Speichern prüfen' : 'Fortschritt bleibt in diesem Browser'}
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
              aria-expanded={mobileOpen}
              aria-controls="primary-sidebar"
            >
              <Menu size={21} />
            </button>
            <button onClick={() => navigate('dashboard')}>Telematik</button>
            <ChevronRight size={14} />
            {page === 'learn' && topic ? (
              <>
                <button onClick={() => navigate('learn')}>Lektionen</button>
                <ChevronRight size={14} />
                <span>{topics.find((t) => t.id === topic)?.title}</span>
              </>
            ) : (
              <span>{pageNames[page]}</span>
            )}
          </div>
          <div className="topbar-actions">
            <button
              className="quick-search"
              onClick={() => {
                navigate('learn');
                setTimeout(() => searchRef.current?.focus(), 0);
              }}
            >
              <Search size={16} />
              <span>Thema suchen</span>
              <kbd>Ctrl K</kbd>
            </button>
            <button
              className={`focus-button ${deadline !== null ? 'running' : ''}`}
              onClick={() => {
                setTimerDone(false);
                setDeadline(deadline === null ? Date.now() + 25 * 60 * 1000 : null);
              }}
              aria-label={deadline !== null ? 'Fokuszeit beenden' : '25 Minuten Fokuszeit starten'}
            >
              <Clock3 size={16} />
              {deadline !== null
                ? `${Math.floor(remaining / 60)
                    .toString()
                    .padStart(2, '0')}:${(remaining % 60).toString().padStart(2, '0')}`
                : '25 Min.'}
            </button>
            {import.meta.env.PROD && (
              <button
                className="offline-download"
                onClick={() => {
                  try {
                    saveOfflineApp(document);
                    setDownloadNotice(
                      'Die Offline-Datei ist zum Speichern vorbereitet. Öffne sie danach mit Edge oder Chrome. Deinen Lernstand kannst du unter «Fortschritt & Sicherung» übertragen.',
                    );
                  } catch (error) {
                    setDownloadNotice(
                      error instanceof Error
                        ? error.message
                        : 'Der Download konnte nicht vorbereitet werden.',
                    );
                  }
                }}
                aria-label="Offline-Datei speichern"
              >
                <Download size={16} />
                <span>Offline-Datei</span>
              </button>
            )}
            <button
              className="theme-switch icon-button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label={theme === 'light' ? 'Dunkelmodus aktivieren' : 'Hellmodus aktivieren'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </header>
        <main id="main-content" ref={mainRef} tabIndex={-1}>
          {downloadNotice && (
            <div className="notice" role="status">
              {downloadNotice}
              <button
                className="icon-button"
                aria-label="Download-Hinweis schliessen"
                onClick={() => setDownloadNotice('')}
              >
                <X size={16} />
              </button>
            </div>
          )}
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
              25 Minuten sind um. Mach eine kurze Pause.
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
            <HomePage
              next={next}
              progress={viewProgress}
              openTopic={openTopic}
              navigate={navigate}
            />
          )}
          {page === 'learn' &&
            (topic ? (
              <GuidedLesson
                key={topic}
                topic={topics.find((t) => t.id === topic)!}
                stepIndex={route.step ?? 0}
                passedSteps={progress.lessonSteps?.[topic] ?? []}
                onStepChange={studyStep}
                onUnderstand={(stepId) => stepUnderstood(topic, stepId)}
                onComplete={() => completeLesson(topic)}
                onBack={() => navigate('learn')}
                onQuiz={() => requestNavigation({ page: 'quiz', topic })}
                onTrainer={() => navigate('trainer')}
                onNextTopic={nextTopic ? () => openTopic(nextTopic.id, 0) : undefined}
              />
            ) : (
              <Curriculum
                search={search}
                setSearch={setSearch}
                searchRef={searchRef}
                progress={viewProgress}
                openTopic={openTopic}
              />
            ))}
          {page === 'trainer' && (
            <>
              <Trainer />
              <div className="trainer-learning-link">
                <BookOpen size={19} />
                <div>
                  <strong>Die Rechnung ist noch unklar?</strong>
                  <p>Die Lektion erklärt zuerst, was Netzadresse, Maske und Broadcast bedeuten.</p>
                </div>
                <button className="button secondary" onClick={() => openTopic('subnetting', 0)}>
                  Subnetting lernen
                  <ArrowRight size={16} />
                </button>
              </div>
            </>
          )}
          {(page === 'quiz' || page === 'mistakes') && (
            <PracticePage
              key={`${page}-${topic ?? 'all'}`}
              onAnswer={record}
              mistakes={progress.mistakes}
              initialTopic={topic ?? 'all'}
              mode={page === 'mistakes' ? 'mistakes' : 'practice'}
              onSessionChange={setSessionActive}
              onStudyTopic={(id) => openTopic(id, 0)}
            />
          )}
          {page === 'exam' && (
            <Quiz
              key={`${page}-${topic ?? 'all'}`}
              onAnswer={record}
              mistakes={progress.mistakes}
              initialMode="exam"
              initialTopic={topic ?? 'all'}
              onSessionChange={setSessionActive}
              onStudyTopic={(id) => openTopic(id, 0)}
            />
          )}
          {page === 'simulations' && <SimulationsPage />}
          {page === 'progress' && (
            <ProgressPage progress={progress} setProgress={setProgress} openTopic={openTopic} />
          )}
          {page === 'sources' && <Sources />}
          <footer className="main-footer">
            <span>Telematik verstehen</span>
            <span>Lernskript · 14 Themen · ohne Anmeldung</span>
          </footer>
        </main>
      </div>
      <dialog
        ref={dialogRef}
        className="leave-dialog"
        aria-labelledby="leave-title"
        aria-describedby="leave-description"
        onCancel={(e) => {
          e.preventDefault();
          setPendingRoute(null);
        }}
      >
        <h2 id="leave-title">Lernrunde verlassen?</h2>
        <p id="leave-description">
          Deine bisherigen Antworten bleiben gespeichert. Die laufende Runde endet, wenn du die
          Seite wechselst.
        </p>
        <div className="dialog-actions">
          <button className="button secondary" autoFocus onClick={() => setPendingRoute(null)}>
            Weiter üben
          </button>
          <button
            className="button primary"
            onClick={() => {
              const next = pendingRoute;
              setPendingRoute(null);
              sessionRef.current = false;
              setSessionActive(false);
              if (next) applyRoute(next);
            }}
          >
            Runde verlassen
          </button>
        </div>
      </dialog>
    </div>
  );
}
function HomePage({
  next,
  progress,
  openTopic,
  navigate,
}: {
  next: Topic;
  progress: Progress;
  openTopic: (id: string, step?: number) => void;
  navigate: (page: Page) => void;
}) {
  const completed = progress.completed.length,
    started = !!progress.lastLesson || completed > 0,
    allDone = completed >= 14;
  return (
    <>
      <div className="home-heading">
        <p className="section-kicker">LERNÜBERSICHT</p>
        <h1>Telematik</h1>
        <p>
          14 Themen mit kurzen Erklärungen, Beispielen und Übungen. Beginne bei den Grundlagen oder
          wähle ein bestimmtes Thema.
        </p>
      </div>
      <div className="home-start-grid">
        <section className="start-lesson">
          <div className="start-top">
            <span className="chapter-label">
              {allDone ? 'Zum Abschluss' : started ? 'Hier geht es weiter' : 'Fang hier an'}
            </span>
            <span className="caption">
              {allDone ? '14 Fragen' : `${learningSteps[next.id].length} kurze Schritte`}
            </span>
          </div>
          <h2>{allDone ? 'Gemischter Wissenstest' : (friendlyTitles[next.id] ?? next.title)}</h2>
          <p>
            {allDone
              ? 'Eine gemischte Runde zeigt dir, was du schon kannst und welche Themen noch eine Wiederholung brauchen.'
              : started
                ? next.goal
                : 'Was passiert, wenn dein Notebook eine Website öffnet? Lerne zuerst, welche Geräte dabei helfen und was jedes davon macht.'}
          </p>
          <button
            className="button primary"
            onClick={() => (allDone ? navigate('exam') : openTopic(next.id))}
          >
            {allDone ? 'Prüfungstraining starten' : started ? 'Weiterlernen' : 'Grundlagen starten'}
            <ArrowRight size={17} />
          </button>
          <div className="start-footnote">
            <BookOpen size={14} />
            {allDone
              ? 'Ohne Zeitdruck, mit Erklärungen.'
              : 'Dein Lernstand wird nach jeder Antwort gespeichert.'}
          </div>
        </section>
        <section className="how-to-learn">
          <span className="section-kicker">ABLAUF EINER LEKTION</span>
          <ol>
            <li>
              <span>1</span>
              <div>
                <h3>Verstehen</h3>
                <p>Lies eine kurze Erklärung und schau dir das Beispiel an.</p>
              </div>
            </li>
            <li>
              <span>2</span>
              <div>
                <h3>Ausprobieren</h3>
                <p>
                  Beantworte eine kleine Frage. Bei einem Fehler erklären wir den entscheidenden
                  Punkt.
                </p>
              </div>
            </li>
            <li>
              <span>3</span>
              <div>
                <h3>Weitergehen</h3>
                <p>
                  Erst wenn die Idee klar ist, folgt die nächste. Dein Platz bleibt gespeichert.
                </p>
              </div>
            </li>
          </ol>
        </section>
      </div>
      <section className="home-focus">
        <div className="focus-heading">
          <span className="section-kicker">DEIN SCHWERPUNKT</span>
          <h2>IP-Adressen & Subnetting</h2>
          <p>Adressierung, Netzmasken und Subnetting anhand konkreter Rechnungen.</p>
        </div>
        <div className="focus-example">
          <div className="annotated-ip">
            <span>
              192.168.1.<b>77</b>
            </span>
            <span>/26</span>
          </div>
          <div className="address-annotation">
            <span>Adresse eines Geräts</span>
            <span>Grösse des Netzes</span>
          </div>
          <div className="focus-example-actions">
            <button className="text-button" onClick={() => openTopic('ipv4', 0)}>
              Von vorne erklären
              <ArrowRight size={15} />
            </button>
            <button className="text-button" onClick={() => openTopic('subnetting', 0)}>
              Subnetting Schritt für Schritt
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>
      <div className="section-heading">
        <div>
          <p className="section-kicker">LEKTIONEN</p>
          <h2>Themenbereiche</h2>
        </div>
        <button className="text-button" onClick={() => navigate('learn')}>
          Alle Lektionen
          <ArrowRight size={15} />
        </button>
      </div>
      <div className="course-overview">
        {learningGroups.map((group, index) => (
          <button
            key={group.id}
            className="course-group-preview"
            onClick={() =>
              openTopic(
                group.topics.find((id) => !progress.completed.includes(id)) ?? group.topics[0],
                0,
              )
            }
          >
            <span className="group-index">0{index + 1}</span>
            <div>
              <h3>{group.title}</h3>
              <p>{group.description}</p>
              <span className="caption">
                {group.topics.filter((id) => progress.completed.includes(id)).length}/
                {group.topics.length} Lektionen gelesen
              </span>
            </div>
            <ArrowRight size={17} />
          </button>
        ))}
      </div>
      <div className="home-bottom">
        <span>
          Bereits gelernt?{' '}
          <button
            className="text-button"
            onClick={() => navigate(progress.mistakes.length ? 'mistakes' : 'quiz')}
          >
            {progress.mistakes.length
              ? `${progress.mistakes.length} Fehler wiederholen`
              : 'Mit Übungen anfangen'}
            <ArrowRight size={14} />
          </button>
        </span>
        <button className="text-button" onClick={() => navigate('progress')}>
          Fortschritt sichern
          <ArrowRight size={14} />
        </button>
      </div>
    </>
  );
}
function Curriculum({
  search,
  setSearch,
  searchRef,
  progress,
  openTopic,
}: {
  search: string;
  setSearch: (s: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  progress: Progress;
  openTopic: (id: string, step?: number) => void;
}) {
  function matches(id: string) {
    const t = topics.find((t) => t.id === id)!;
    return `${t.title} ${friendlyTitles[id] ?? ''} ${t.subtitle} ${t.paragraphs.join(' ')}`
      .toLowerCase()
      .includes(search.trim().toLowerCase());
  }
  const results = topics.filter((t) => matches(t.id)).length;
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="section-kicker">DEIN LERNPFAD</p>
          <h1>Lektionen</h1>
          <p>Beginne oben, wenn du neu einsteigst. Oder wähle das Thema, das du gerade brauchst.</p>
        </div>
      </div>
      <div className="curriculum-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            ref={searchRef}
            aria-label="Themen suchen"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="IP, DHCP, WLAN …"
          />
          {search && (
            <button className="icon-button" aria-label="Suche leeren" onClick={() => setSearch('')}>
              <X size={16} />
            </button>
          )}
        </div>
        <span className="caption">
          {search ? `${results} passende Lektionen` : `${progress.completed.length} von 14 gelesen`}
        </span>
      </div>
      <div className="curriculum">
        {learningGroups
          .filter((g) => g.topics.some(matches))
          .map((group, index) => (
            <section className="curriculum-group" key={group.id}>
              <div className="curriculum-group-heading">
                <span className="group-index">0{learningGroups.indexOf(group) + 1}</span>
                <div>
                  <h2>{group.title}</h2>
                  <p>{group.description}</p>
                </div>
              </div>
              <div className="lesson-list">
                {group.topics.filter(matches).map((id) => {
                  const t = topics.find((t) => t.id === id)!,
                    done = progress.completed.includes(id),
                    passed = learningSteps[id].filter((s) =>
                      progress.lessonSteps?.[id]?.includes(s.id),
                    ).length;
                  return (
                    <button
                      className={`lesson-row ${done ? 'is-completed' : ''}`}
                      key={id}
                      onClick={() => openTopic(id)}
                    >
                      <span className="lesson-status">
                        {done ? (
                          <Check size={17} />
                        ) : (
                          String(courseTopics().findIndex((t) => t.id === id) + 1).padStart(2, '0')
                        )}
                      </span>
                      <div className="lesson-row-title">
                        <h3>{friendlyTitles[id] ?? t.title}</h3>
                        <p>
                          {t.title} · {learningSteps[id].length} kurze Schritte
                        </p>
                      </div>
                      <span className="lesson-row-progress">
                        {done
                          ? 'Gelesen'
                          : passed
                            ? `${passed}/${learningSteps[id].length} verstanden`
                            : 'Noch offen'}
                      </span>
                      <ChevronRight size={18} />
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
      </div>
      {!results && (
        <div className="empty-state">
          <Search size={24} />
          <h2>Kein passendes Thema.</h2>
          <p>Versuche einen anderen Begriff, zum Beispiel «IP» oder «DNS».</p>
          <button className="button secondary" onClick={() => setSearch('')}>
            Alle Lektionen zeigen
          </button>
        </div>
      )}
    </>
  );
}
