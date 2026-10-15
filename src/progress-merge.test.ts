import { expect, it } from 'vitest';
import { mergeProgress } from './progress-merge';
import type { Progress } from './storage';
const empty: Progress = { completed: [], mistakes: [], attempts: [] };
it('does not resurrect a resolved error from an older backup', () => {
  const current = {
    ...empty,
    attempts: [{ id: 'binary-1', correct: true, date: '2026-10-15T14:00:00Z' }],
  };
  const old = {
    ...empty,
    mistakes: ['binary-1'],
    attempts: [{ id: 'binary-1', correct: false, date: '2026-10-15T12:00:00Z' }],
  };
  expect(mergeProgress(current, old).mistakes).toEqual([]);
});
it('uses the latest imported result, including a newer mistake', () => {
  const current = {
    ...empty,
    attempts: [{ id: 'binary-1', correct: true, date: '2026-10-15T12:00:00Z' }],
  };
  const backup = {
    ...empty,
    attempts: [{ id: 'binary-1', correct: false, date: '2026-10-15T14:00:00Z' }],
  };
  expect(mergeProgress(current, backup).mistakes).toEqual(['binary-1']);
});
it('deduplicates overlapping attempts, sorts dates and is repeatable', () => {
  const a = { id: 'dns-1', correct: false, date: '2026-10-15T12:00:00Z' };
  const b = { id: 'dns-1', correct: true, date: '2026-10-15T14:00:00Z' };
  const current = { ...empty, attempts: [b, a] };
  const backup = { ...empty, attempts: [a, b] };
  const merged = mergeProgress(current, backup);
  expect(merged.attempts).toEqual([a, b]);
  expect(mergeProgress(merged, backup)).toEqual(merged);
});
it('preserves guided work, current reading position and legacy flags', () => {
  const current = {
    ...empty,
    completed: ['devices'],
    lessonSteps: { devices: ['devices-switch'] },
    lastLesson: { topic: 'devices', step: 1 },
  };
  const backup = {
    ...empty,
    completed: ['devices', 'binary'],
    lessonSteps: { devices: ['devices-connection'] },
    lastLesson: { topic: 'binary', step: 3 },
    mistakes: ['unknown-old-question'],
  };
  const merged = mergeProgress(current, backup);
  expect(merged.completed).toEqual(['devices', 'binary']);
  expect(merged.lessonSteps?.devices).toEqual(['devices-switch', 'devices-connection']);
  expect(merged.lastLesson).toEqual(current.lastLesson);
  expect(merged.mistakes).toContain('unknown-old-question');
});
it('handles equivalent timestamps in different timezones', () => {
  const current = {
    ...empty,
    attempts: [{ id: 'dns-1', correct: true, date: '2026-10-15T14:30:00+02:00' }],
  };
  const backup = {
    ...empty,
    mistakes: ['dns-1'],
    attempts: [{ id: 'dns-1', correct: false, date: '2026-10-15T12:00:00Z' }],
  };
  expect(mergeProgress(current, backup).mistakes).toEqual([]);
});
