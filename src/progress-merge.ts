import type { Progress } from './storage';

/** Restore backups without bringing back errors resolved by a newer answer. */
export function mergeProgress(current: Progress, incoming: Progress): Progress {
  const attempts = [
    ...new Map(
      [...incoming.attempts, ...current.attempts].map((attempt) => [
        `${attempt.id}|${attempt.date}`,
        attempt,
      ]),
    ).values(),
  ].sort((a, b) => (Date.parse(a.date) || 0) - (Date.parse(b.date) || 0));
  const latest = new Map(attempts.map((attempt) => [attempt.id, attempt]));
  const mistakes = new Set([...current.mistakes, ...incoming.mistakes]);
  for (const [id, attempt] of latest) {
    if (attempt.correct) mistakes.delete(id);
    else mistakes.add(id);
  }
  const topics = [
    ...new Set([
      ...Object.keys(current.lessonSteps ?? {}),
      ...Object.keys(incoming.lessonSteps ?? {}),
    ]),
  ];
  return {
    completed: [...new Set([...current.completed, ...incoming.completed])],
    attempts,
    mistakes: [...mistakes],
    lessonSteps: Object.fromEntries(
      topics.map((topic) => [
        topic,
        [
          ...new Set([
            ...(current.lessonSteps?.[topic] ?? []),
            ...(incoming.lessonSteps?.[topic] ?? []),
          ]),
        ],
      ]),
    ),
    lastLesson: current.lastLesson ?? incoming.lastLesson,
  };
}
