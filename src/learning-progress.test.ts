import { expect, it } from 'vitest';
import { guidedCompleted } from './learning-progress';
import { learningSteps } from './learning';
it('does not treat legacy read markers or an isolated final check as a completed guided lesson', () => {
  expect(guidedCompleted({ completed: ['devices'], mistakes: [], attempts: [] })).toEqual([]);
  expect(
    guidedCompleted({
      completed: [],
      mistakes: [],
      attempts: [],
      lessonSteps: { devices: [learningSteps.devices.at(-1)!.id] },
    }),
  ).toEqual([]);
});
it('counts a guided lesson only after all its checks', () =>
  expect(
    guidedCompleted({
      completed: [],
      mistakes: [],
      attempts: [],
      lessonSteps: { devices: learningSteps.devices.map((s) => s.id) },
    }),
  ).toEqual(['devices']));
