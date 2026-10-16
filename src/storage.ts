export type Attempt = { id: string; correct: boolean; date: string; self?: boolean };
export type Progress = {
  completed: string[];
  attempts: Attempt[];
  mistakes: string[];
  lessonSteps?: Record<string, string[]>;
  lastLesson?: { topic: string; step: number };
};
export const emptyProgress: Progress = { completed: [], attempts: [], mistakes: [] };
export const storageKey = 'telematik-progress-v1';
export function validateProgress(value: unknown): Progress {
  if (!value || typeof value !== 'object') throw new Error('Ungültiges Fortschrittsformat.');
  const v = value as Record<string, unknown>;
  if (
    !Array.isArray(v.completed) ||
    !v.completed.every((i) => typeof i === 'string') ||
    !Array.isArray(v.mistakes) ||
    !v.mistakes.every((i) => typeof i === 'string') ||
    !Array.isArray(v.attempts) ||
    !v.attempts.every(
      (a) =>
        a &&
        typeof a.id === 'string' &&
        typeof a.correct === 'boolean' &&
        typeof a.date === 'string' &&
        (a.self === undefined || typeof a.self === 'boolean'),
    )
  )
    throw new Error('Diese Datei enthält keinen gültigen Lernfortschritt.');
  if (
    v.lessonSteps !== undefined &&
    (!v.lessonSteps ||
      typeof v.lessonSteps !== 'object' ||
      Array.isArray(v.lessonSteps) ||
      !Object.values(v.lessonSteps).every(
        (items) => Array.isArray(items) && items.every((id) => typeof id === 'string'),
      ))
  )
    throw new Error('Die gespeicherten Lektionsschritte sind ungültig.');
  const last = v.lastLesson as { topic?: unknown; step?: unknown } | undefined;
  if (
    last !== undefined &&
    (!last ||
      typeof last.topic !== 'string' ||
      typeof last.step !== 'number' ||
      !Number.isInteger(last.step) ||
      last.step < 0 ||
      last.step > 99)
  )
    throw new Error('Die gespeicherte Lektionsposition ist ungültig.');
  return {
    ...(v.lessonSteps
      ? {
          lessonSteps: Object.fromEntries(
            Object.entries(v.lessonSteps as Record<string, string[]>).map(([topic, steps]) => [
              topic,
              [...new Set(steps)],
            ]),
          ),
        }
      : {}),
    ...(last ? { lastLesson: { topic: last.topic as string, step: last.step as number } } : {}),
    completed: [...new Set(v.completed)],
    mistakes: [...new Set(v.mistakes)],
    attempts: v.attempts.map((attempt: Attempt) => ({
      id: attempt.id,
      correct: attempt.correct,
      date: attempt.date,
      ...(attempt.self === undefined ? {} : { self: attempt.self }),
    })),
  };
}
export function readProgress(): { progress: Progress; warning: string } {
  try {
    const raw = localStorage.getItem(storageKey);
    return { progress: raw ? validateProgress(JSON.parse(raw)) : emptyProgress, warning: '' };
  } catch {
    return {
      progress: emptyProgress,
      warning:
        'Der gespeicherte Fortschritt konnte nicht gelesen werden. Exportiere neue Fortschritte regelmässig als Sicherung.',
    };
  }
}
