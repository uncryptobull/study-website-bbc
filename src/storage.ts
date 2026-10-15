export type Attempt = { id: string; correct: boolean; date: string; self?: boolean };
export type Progress = { completed: string[]; attempts: Attempt[]; mistakes: string[] };
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
  return {
    completed: [...new Set(v.completed)],
    mistakes: [...new Set(v.mistakes)],
    attempts: v.attempts,
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
