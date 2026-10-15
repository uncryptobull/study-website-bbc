import { describe, expect, it } from 'vitest';
import {
  addPATMapping,
  exploreRoutes,
  parsePort,
  receivePATReply,
  type RouteEntry,
} from './SimulationTools';

function route(id: string, destination: string, metric = '10'): RouteEntry {
  return { id, destination, metric, gateway: '192.0.2.1', interface: 'wan0' };
}

describe('routing table exploration', () => {
  it('selects the longest prefix before comparing metrics', () => {
    const result = exploreRoutes('203.0.113.174', [
      route('default', '0.0.0.0/0', '0'),
      route('broad', '203.0.113.0/24', '1'),
      route('specific', '203.0.113.160/27', '50'),
    ]);
    expect(result.selected.map((entry) => entry.id)).toEqual(['specific']);
    expect(result.routes.every((entry) => entry.matches)).toBe(true);
  });
  it('uses the lowest metric for equally specific routes and preserves equal-cost choices', () => {
    const result = exploreRoutes('203.0.113.5', [
      route('slow', '203.0.113.0/24', '20'),
      route('fast-a', '203.0.113.0/24', '5'),
      route('fast-b', '203.0.113.0/24', '5'),
    ]);
    expect(result.selected.map((entry) => entry.id)).toEqual(['fast-a', 'fast-b']);
  });
  it('normalises host bits in route entries and handles /31 and /32', () => {
    expect(
      exploreRoutes('203.0.113.174', [route('normalised', '203.0.113.170/27')]).selected[0].network
        .network,
    ).toBe(3405803936);
    const entries = [route('link', '203.0.113.174/31'), route('host', '203.0.113.175/32')];
    expect(exploreRoutes('203.0.113.174', entries).selected[0].id).toBe('link');
    expect(exploreRoutes('203.0.113.175', entries).selected[0].id).toBe('host');
  });
  it('falls back to the default route and reports no route when absent', () => {
    const specific = route('specific', '203.0.113.0/24');
    expect(
      exploreRoutes('198.51.100.8', [specific, route('default', '0.0.0.0/0')]).selected[0].id,
    ).toBe('default');
    expect(exploreRoutes('198.51.100.8', [specific]).selected).toEqual([]);
    expect(exploreRoutes('198.51.100.8', []).selected).toEqual([]);
  });
  it.each(['203.0.113.0', '203.0.113.0/33', '256.0.0.0/24', '203.0.113.0/24/1'])(
    'rejects the invalid route %s instead of showing a partial result',
    (destination) => {
      expect(() =>
        exploreRoutes('203.0.113.8', [route('default', '0.0.0.0/0'), route('bad', destination)]),
      ).toThrow('Route 2:');
    },
  );
  it('validates destination, gateway, interface, and metric', () => {
    expect(() => exploreRoutes('not an IP', [])).toThrow();
    expect(() =>
      exploreRoutes('203.0.113.8', [{ ...route('bad', '0.0.0.0/0'), gateway: '256.0.0.1' }]),
    ).toThrow();
    expect(() =>
      exploreRoutes('203.0.113.8', [{ ...route('bad', '0.0.0.0/0'), interface: '' }]),
    ).toThrow();
    expect(() => exploreRoutes('203.0.113.8', [route('bad', '0.0.0.0/0', '-1')])).toThrow();
    expect(() => exploreRoutes('203.0.113.8', [route('bad', '0.0.0.0/0', '65536')])).toThrow();
    expect(
      exploreRoutes('203.0.113.8', [{ ...route('direct', '203.0.113.0/24', '0'), gateway: '' }])
        .selected[0].gateway,
    ).toBe('');
  });
});

describe('TCP PAT mappings', () => {
  it('distinguishes the same local port on different devices and reverses a reply', () => {
    const first = addPATMapping([], '192.168.1.10', '51514', 'first');
    const second = addPATMapping([first], '192.168.1.11', '51514', 'second');
    expect(first.publicPort).toBe(40001);
    expect(second.publicPort).toBe(40002);
    expect(receivePATReply([first, second], '40002')).toEqual(second);
    expect(receivePATReply([first, second], '49999')).toBeNull();
  });
  it('allows two local ports on the same device and reuses a released example port', () => {
    const first = addPATMapping([], '192.168.1.10', '51514', 'first');
    const second = addPATMapping([first], '192.168.1.10', '51515', 'second');
    expect(addPATMapping([second], '192.168.1.12', '51514', 'third').publicPort).toBe(40001);
  });
  it('does not accept a different server endpoint as a matching reply', () => {
    const mapping = addPATMapping([], '192.168.1.10', '51514', 'first');
    expect(receivePATReply([mapping], mapping.publicPort, '203.0.113.81', 443)).toBeNull();
    expect(receivePATReply([mapping], mapping.publicPort, '203.0.113.80', 80)).toBeNull();
  });
  it('rejects duplicate connections after canonicalising IPv4', () => {
    const mapping = addPATMapping([], '192.168.001.010', '51514', 'first');
    expect(mapping.internalIP).toBe('192.168.1.10');
    expect(() => addPATMapping([mapping], '192.168.1.10', '51514', 'second')).toThrow('bereits');
  });
  it.each(['192.168.1.0', '192.168.1.255', '192.168.2.10', '203.0.113.10', 'invalid'])(
    'rejects %s outside usable hosts in the example LAN',
    (ip) => {
      expect(() => addPATMapping([], ip, '51514', 'first')).toThrow();
    },
  );
  it.each(['0', '-1', '65536', '', '1.5', '1e3'])('rejects TCP port %s', (port) => {
    expect(() => parsePort(port)).toThrow();
  });
  it('accepts the minimum and maximum TCP ports', () => {
    expect(parsePort('1')).toBe(1);
    expect(parsePort('65535')).toBe(65535);
  });
});
