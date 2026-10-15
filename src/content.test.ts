import { describe, expect, it } from 'vitest';
import { findQuestion, questions, topics } from './content';
import { validateProgress } from './storage';

describe('study content integrity', () => {
  it('contains 14 distinct topics and five questions each', () => {
    expect(topics).toHaveLength(14);
    expect(new Set(topics.map((t) => t.id)).size).toBe(14);
    expect(questions).toHaveLength(70);
    expect(new Set(questions.map((q) => q.id)).size).toBe(70);
    for (const t of topics)
      expect(
        questions.filter((q) => q.topic === t.id),
        t.title,
      ).toHaveLength(5);
  });
  it('choice questions have one valid answer and no duplicate options', () => {
    for (const q of questions.filter((q) => q.choices)) {
      expect(q.choices).toContain(q.answer);
      expect(new Set(q.choices).size).toBe(q.choices!.length);
    }
  });
  it('restores generated questions from their IDs with reference answers', () => {
    expect(findQuestion('generated:192.168.1.77:26:network')?.answer).toBe('192.168.1.64');
    expect(findQuestion('generated:10.7.34.80:20:broadcast')?.answer).toBe('10.7.47.255');
    expect(findQuestion('generated:999.1.1.1:26:network')).toBeUndefined();
    expect(findQuestion('missing')).toBeUndefined();
  });
});
describe('progress import validation', () => {
  it('accepts a valid backup and removes duplicate completion markers', () => {
    expect(
      validateProgress({ completed: ['binary', 'binary'], mistakes: [], attempts: [] }).completed,
    ).toEqual(['binary']);
  });
  it.each([
    null,
    {},
    { completed: 'all', mistakes: [], attempts: [] },
    { completed: [], mistakes: [], attempts: [{ id: 'binary-1', correct: 'yes', date: 'today' }] },
  ])('rejects malformed backups', (data) => expect(() => validateProgress(data)).toThrow());
});
