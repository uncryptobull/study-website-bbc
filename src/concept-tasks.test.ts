import { describe, expect, it } from 'vitest';
import { topics } from './content';
import { conceptTasks, findConceptTask } from './concept-tasks';
import { formatIP, parseIP, splitNetwork, subnet } from './network';

describe('interactive concept content', () => {
  it('provides two exercises per topic, unique progress IDs and four interaction types', () => {
    expect(conceptTasks).toHaveLength(28);
    expect(new Set(conceptTasks.map((task) => task.id)).size).toBe(conceptTasks.length);
    expect(new Set(conceptTasks.map((task) => task.topic))).toEqual(
      new Set(topics.map((topic) => topic.id)),
    );
    expect(new Set(conceptTasks.map((task) => task.kind))).toEqual(
      new Set(['bits', 'match', 'order', 'choice']),
    );
    for (const topic of topics) {
      const exercises = conceptTasks.filter((task) => task.topic === topic.id);
      expect(exercises, topic.title).toHaveLength(2);
      for (const task of exercises) {
        expect(task.id.startsWith(`${topic.id}-concept-`), task.id).toBe(true);
        expect(task.title.trim().length, task.id).toBeGreaterThan(10);
        expect(task.prompt.trim().length, task.id).toBeGreaterThan(30);
        expect(task.hint.trim().length, task.id).toBeGreaterThan(30);
        expect(task.explanation.trim().length, task.id).toBeGreaterThan(100);
      }
    }
  });

  it('has unambiguous, complete answer references and bounded manipulatives', () => {
    for (const task of conceptTasks) {
      if (task.kind === 'choice') {
        expect(task.options.length, task.id).toBeGreaterThanOrEqual(3);
        expect(task.options.length, task.id).toBeLessThanOrEqual(4);
        expect(new Set(task.options.map((option) => option.id)).size, task.id).toBe(
          task.options.length,
        );
        expect(new Set(task.options.map((option) => option.label)).size, task.id).toBe(
          task.options.length,
        );
        expect(
          task.options.filter((option) => option.id === task.correct),
          task.id,
        ).toHaveLength(1);
      } else if (task.kind === 'order') {
        const ids = task.items.map((item) => item.id);
        expect(task.items.length, task.id).toBeGreaterThanOrEqual(3);
        expect(task.items.length, task.id).toBeLessThanOrEqual(4);
        expect(new Set(ids).size, task.id).toBe(ids.length);
        expect(new Set(task.items.map((item) => item.label)).size, task.id).toBe(ids.length);
        expect(new Set(task.correctOrder).size, task.id).toBe(ids.length);
        expect([...task.correctOrder].sort(), task.id).toEqual([...ids].sort());
        expect(ids, task.id).not.toEqual(task.correctOrder);
      } else if (task.kind === 'match') {
        expect(task.pairs.length, task.id).toBeGreaterThanOrEqual(3);
        expect(task.pairs.length, task.id).toBeLessThanOrEqual(4);
        for (const field of ['id', 'left', 'right'] as const) {
          const values = task.pairs.map((pair) => pair[field]);
          expect(
            values.every((value) => value.trim().length > 0),
            `${task.id}: ${field}`,
          ).toBe(true);
          expect(new Set(values).size, `${task.id}: ${field}`).toBe(values.length);
        }
      } else {
        expect(Number.isInteger(task.target), task.id).toBe(true);
        expect(task.target, task.id).toBeGreaterThanOrEqual(0);
        expect(task.target, task.id).toBeLessThanOrEqual(255);
        expect(Number.isInteger(task.initial ?? 0), task.id).toBe(true);
        expect(task.initial ?? 0, task.id).toBeGreaterThanOrEqual(0);
        expect(task.initial ?? 0, task.id).toBeLessThanOrEqual(255);
        expect(task.initial ?? 0, task.id).not.toBe(task.target);
      }
    }
  });

  it('finds exercises for review and safely ignores unrelated question IDs', () => {
    for (const task of conceptTasks) expect(findConceptTask(task.id)).toBe(task);
    expect(findConceptTask('binary-1')).toBeUndefined();
    expect(findConceptTask('')).toBeUndefined();
    expect(findConceptTask('missing-concept-example')).toBeUndefined();
  });

  it('uses independently checked /26 subnet boundaries and host requirements', () => {
    const membership = findConceptTask('ipv4-concept-local-or-gateway');
    expect(membership?.kind).toBe('choice');
    if (membership?.kind !== 'choice') throw new Error('Expected membership choice task');
    const source = subnet('192.168.1.77', 26);
    const eligible = membership.options.filter((option) => {
      const target = subnet(option.id, 26);
      return target.network === source.network && target.validHost;
    });
    expect(eligible.map((option) => option.id)).toEqual([membership.correct]);

    const blocks = findConceptTask('subnetting-concept-quarter-network');
    expect(blocks?.kind).toBe('match');
    if (blocks?.kind !== 'match') throw new Error('Expected FLSM matching task');
    const reference = splitNetwork('192.168.1.0', '24', '26');
    expect(reference.count).toBe(4);
    expect(blocks.pairs.map((pair) => pair.left)).toEqual(
      reference.rows.map((row) => `${formatIP(row.network)}/26`),
    );
    expect(blocks.pairs.map((pair) => pair.right)).toEqual(
      reference.rows.map((row) => `${formatIP(row.firstHost)} bis ${formatIP(row.lastHost)}`),
    );

    const room = findConceptTask('subnetting-concept-room-for-50');
    if (room?.kind !== 'choice') throw new Error('Expected host-capacity choice task');
    const suitable = room.options
      .map((option) => Number(option.id))
      .filter((prefix) => subnet('192.168.1.0', prefix).usable >= 50);
    expect(Number(room.correct)).toBe(Math.max(...suitable));

    const label = findConceptTask('plans-concept-find-label-error');
    if (label?.kind !== 'choice') throw new Error('Expected network-label choice task');
    expect(label.correct).toBe(`${formatIP(subnet('192.168.1.70', 26).network)}/26`);
  });

  it('chooses the most specific matching route instead of the first table entry', () => {
    const route = findConceptTask('routing-concept-longest-prefix');
    if (route?.kind !== 'choice') throw new Error('Expected routing choice task');
    const target = parseIP('10.7.34.80');
    const matches = route.options
      .map((option) => {
        const [address, prefix] = option.id.split('/');
        const network = subnet(address, prefix);
        return { id: option.id, ...network };
      })
      .filter((row) => target >= row.network && target <= row.last)
      .sort((a, b) => b.prefix - a.prefix);
    expect(matches).toHaveLength(3);
    expect(matches[0].id).toBe(route.correct);
    expect(route.options[0].id).not.toBe(route.correct);
  });

  it('keeps the TCP and DHCP message sequences technically correct', () => {
    const tcp = findConceptTask('protocols-concept-tcp-handshake');
    const dhcp = findConceptTask('dhcp-concept-dora');
    if (tcp?.kind !== 'order' || dhcp?.kind !== 'order')
      throw new Error('Expected protocol sequence tasks');
    expect(tcp.correctOrder).toEqual(['syn', 'syn-ack', 'ack']);
    expect(dhcp.correctOrder).toEqual(['discover', 'offer', 'request', 'ack']);
  });

  it('illustrates PAT port disambiguation when two clients reuse a source port', () => {
    const pat = findConceptTask('nat-concept-return-packets');
    if (pat?.kind !== 'match') throw new Error('Expected PAT matching task');
    expect(new Set(pat.pairs.map((pair) => pair.left.split(':')[0]))).toEqual(
      new Set(['203.0.113.5']),
    );
    const first = pat.pairs.find((pair) => pair.id === 'pc-a')!;
    const second = pat.pairs.find((pair) => pair.id === 'pc-b')!;
    expect(first.right.split(':')[1]).toBe(second.right.split(':')[1]);
    expect(first.right.split(':')[0]).not.toBe(second.right.split(':')[0]);
    expect(first.left.split(':')[1]).not.toBe(second.left.split(':')[1]);
  });
});
