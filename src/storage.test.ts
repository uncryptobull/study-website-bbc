import { expect, it } from 'vitest';
import { validateProgress } from './storage';

it('removes unrelated personal fields from imported progress and attempts', () => {
  const progress = validateProgress({
    completed: [],
    mistakes: [],
    owner: 'Private learner',
    attempts: [
      {
        id: 'binary-1',
        correct: true,
        date: '2026-10-16T12:00:00Z',
        email: 'learner@example.invalid',
        answer: 'Personal notes that should not be retained',
      },
      { id: 'dns-1', correct: false, date: '2026-10-16T12:01:00Z', self: true },
    ],
    lastLesson: { topic: 'devices', step: 0, notes: 'Private notes' },
  });
  expect(progress).toEqual({
    completed: [],
    mistakes: [],
    attempts: [
      { id: 'binary-1', correct: true, date: '2026-10-16T12:00:00Z' },
      { id: 'dns-1', correct: false, date: '2026-10-16T12:01:00Z', self: true },
    ],
    lastLesson: { topic: 'devices', step: 0 },
  });
});
