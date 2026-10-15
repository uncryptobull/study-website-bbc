import { learningSteps } from './learning';
import type { Progress } from './storage';
/** Old read markers remain in backups, but only new understanding checks complete guided lessons. */
export function guidedCompleted(progress: Progress): string[] {
  return Object.entries(learningSteps)
    .filter(([id, steps]) =>
      steps.every((step) => !step.check || progress.lessonSteps?.[id]?.includes(step.id)),
    )
    .map(([id]) => id);
}
