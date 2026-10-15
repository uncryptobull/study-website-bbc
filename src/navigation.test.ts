import { expect, it } from 'vitest';
import { parseRoute, routeHash } from './navigation';
it('restores a lesson and its exact step', () =>
  expect(parseRoute('#learn/subnetting/4')).toEqual({
    page: 'learn',
    topic: 'subnetting',
    step: 3,
  }));
it('roundtrips lesson and quiz routes', () => {
  for (const route of [
    { page: 'learn' as const, topic: 'binary', step: 2 },
    { page: 'quiz' as const, topic: 'dns' },
    { page: 'trainer' as const },
  ])
    expect(parseRoute(routeHash(route))).toEqual(route);
});
it('ignores unknown topics and malformed steps', () => {
  expect(parseRoute('#learn/unknown/1')).toEqual({ page: 'learn' });
  expect(parseRoute('#learn/ipv4/nope')).toEqual({ page: 'learn', topic: 'ipv4' });
  expect(parseRoute('#learn/ipv4/0').step).toBe(0);
  expect(parseRoute('#constructor')).toEqual({ page: 'dashboard' });
});
