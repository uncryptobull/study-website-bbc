import { describe, expect, it } from 'vitest';
import { findQuestion, questions } from './content';
import { answerFormatError, answerMatches, nextQuestionHint } from './quiz-utils';

describe('written answer validation', () => {
  it('keeps the eight-bit representation distinct from an integer', () => {
    expect(answerMatches('01001101', '01001101')).toBe(true);
    expect(answerMatches('0100 1101', '01001101')).toBe(true);
    expect(answerMatches('1001101', '01001101')).toBe(false);
    expect(answerMatches('01001101', '192')).toBe(false);
  });
  it.each(['192.0', '1.92e2', '+192', '0192', '0xC0', '192 hosts', '192foo', 'NaN'])(
    'rejects malformed integer %s',
    (input) => {
      expect(answerFormatError(input, '192')).not.toBeNull();
      expect(answerMatches(input, '192')).toBe(false);
    },
  );
  it('accepts trimmed integers but keeps a valid wrong answer distinct from malformed input', () => {
    expect(answerMatches(' 192 ', '192')).toBe(true);
    expect(answerFormatError('191', '192')).toBeNull();
    expect(answerMatches('191', '192')).toBe(false);
  });
  it.each([
    '192.168.001.64',
    '192.168.1.256',
    '192.168.1.64/26',
    '192.168.1.64.',
    '192.168.1',
    '192.168.1.64foo',
    '192 .168.1.64',
  ])('rejects malformed address %s', (input) =>
    expect(answerFormatError(input, '192.168.1.64')).not.toBeNull(),
  );
  it('requires a valid prefix for route answers', () => {
    expect(answerMatches(' 0.0.0.0/0 ', '0.0.0.0/0')).toBe(true);
    expect(answerFormatError('0.0.0.0/33', '0.0.0.0/0')).not.toBeNull();
    expect(answerFormatError('0.0.0.0/00', '0.0.0.0/0')).not.toBeNull();
    expect(answerFormatError('0.0.0.0', '0.0.0.0/0')).not.toBeNull();
  });
  it('compares course naming answers without case sensitivity', () => {
    expect(answerMatches(' SW01 ', 'sw01')).toBe(true);
    expect(answerMatches('sw1', 'sw01')).toBe(false);
    expect(answerMatches('', '')).toBe(false);
  });
});

describe('question-specific learning hints', () => {
  it('provides a distinct second step for every fixed question', () => {
    for (const question of questions) {
      expect(nextQuestionHint(question), question.id).not.toBe(question.hint);
      expect(nextQuestionHint(question).length).toBeGreaterThan(25);
    }
  });
  it('guides /20 tasks through the third octet and /26 tasks through the fourth', () => {
    const wide = findQuestion('generated:10.7.34.80:20:network')!;
    expect(nextQuestionHint(wide)).toContain('3. Oktett');
    expect(nextQuestionHint(wide)).toContain('16 auseinander');
    expect(nextQuestionHint(wide)).toContain('folgenden Oktette auf 0');
    const narrow = findQuestion('generated:192.168.1.77:26:broadcast')!;
    expect(nextQuestionHint(narrow)).toContain('4. Oktett');
    expect(nextQuestionHint(narrow)).toContain('64 auseinander');
    expect(nextQuestionHint(narrow)).toContain('letzte Adresse');
  });
});
