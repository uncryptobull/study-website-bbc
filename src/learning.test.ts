import { describe, expect, it } from 'vitest';
import { topics } from './content';
import { learningGroups, learningSteps } from './learning';

describe('guided learning content', () => {
  it('provides a guided lesson for every topic and groups each topic exactly once', () => {
    const topicIds = topics.map((topic) => topic.id).sort();
    expect(Object.keys(learningSteps).sort()).toEqual(topicIds);
    const groupedIds = learningGroups.flatMap((group) => [...group.topics]);
    expect(groupedIds.sort()).toEqual(topicIds);
    expect(new Set(groupedIds).size).toBe(14);
  });

  it('introduces devices and addresses before binary and IP calculations', () => {
    const order = learningGroups.flatMap((group) => [...group.topics]);
    expect(order.indexOf('devices')).toBeLessThan(order.indexOf('addressing'));
    expect(order.indexOf('addressing')).toBeLessThan(order.indexOf('binary'));
    expect(order.indexOf('binary')).toBeLessThan(order.indexOf('ipv4'));
    expect(order.indexOf('ipv4')).toBeLessThan(order.indexOf('subnetting'));
  });

  it('each step contains an example and an unambiguous check with explanatory feedback', () => {
    const allIds: string[] = [];
    for (const [topicId, steps] of Object.entries(learningSteps)) {
      expect(steps.length, topicId).toBeGreaterThanOrEqual(3);
      for (const step of steps) {
        allIds.push(step.id);
        expect(step.id.startsWith(`${topicId}-`), step.id).toBe(true);
        expect(step.explanation.length, step.id).toBeGreaterThanOrEqual(2);
        expect(step.example?.lines.length, step.id).toBeGreaterThan(0);
        expect(step.check, step.id).toBeDefined();
        const check = step.check!;
        expect(check.options.length, step.id).toBeGreaterThanOrEqual(2);
        expect(new Set(check.options).size, step.id).toBe(check.options.length);
        expect(Number.isInteger(check.correct), step.id).toBe(true);
        expect(check.correct, step.id).toBeGreaterThanOrEqual(0);
        expect(check.correct, step.id).toBeLessThan(check.options.length);
        expect(check.explanation.length, step.id).toBeGreaterThan(30);
        expect(step.takeaway?.length, step.id).toBeGreaterThan(10);
      }
    }
    expect(new Set(allIds).size).toBe(allIds.length);
  });

  it('teaches subnet boundaries and the special-case rules explicitly', () => {
    const subnetText = JSON.stringify(learningSteps.subnetting);
    expect(subnetText).toContain('192.168.1.64');
    expect(subnetText).toContain('192.168.1.127');
    expect(subnetText).toContain('62 nutzbare');
    expect(subnetText).toContain('10.7.32.0');
    expect(subnetText).toContain('10.7.47.255');
    expect(subnetText).toContain('/31');
    expect(subnetText).toContain('/32');
    expect(subnetText).toContain('nicht blind');
  });
});
