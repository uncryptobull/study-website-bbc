import { describe, it, expect } from 'vitest';
import { subnet, formatIP, parseIP, splitNetwork, compareNetworks } from './network';
describe('IPv4 reference calculations', () => {
  it.each([
    ['192.168.10.42', 24, '192.168.10.0', '192.168.10.255', 254],
    ['192.168.10.130', 25, '192.168.10.128', '192.168.10.255', 126],
    ['192.168.1.77', 26, '192.168.1.64', '192.168.1.127', 62],
    ['192.168.10.182', 27, '192.168.10.160', '192.168.10.191', 30],
    ['10.7.34.80', 20, '10.7.32.0', '10.7.47.255', 4094],
    ['255.255.255.255', 0, '0.0.0.0', '255.255.255.255', 4294967294],
  ])('%s/%s', (ip, prefix, network, broadcast, hosts) => {
    const result = subnet(ip as string, prefix as number);
    expect(formatIP(result.network)).toBe(network);
    expect(formatIP(result.broadcast!)).toBe(broadcast);
    expect(result.usable).toBe(hosts);
  });
  it('handles /31 point-to-point and /32 without a broadcast', () => {
    const p = subnet('10.0.0.1', 31);
    expect(p.usable).toBe(2);
    expect(p.broadcast).toBeNull();
    expect(formatIP(p.firstHost)).toBe('10.0.0.0');
    expect(formatIP(p.lastHost)).toBe('10.0.0.1');
    const h = subnet('10.0.0.1', 32);
    expect(h.usable).toBe(1);
    expect(h.firstHost).toBe(h.lastHost);
    expect(h.broadcast).toBeNull();
  });
  it.each(['256.1.1.1', '1.2.3', '-1.2.3.4', '1.2.3.4.5', 'a.1.2.3', '1..2.3'])(
    'rejects %s',
    (ip) => expect(() => parseIP(ip)).toThrow(),
  );
  it.each(['33', '-1', '2.5', '', '1e1'])('rejects prefix %s', (p) =>
    expect(() => subnet('1.2.3.4', p)).toThrow(),
  );
  it('splits /24 into four /26s and normalises the original address', () => {
    const result = splitNetwork('192.168.20.77', '24', '26');
    expect(result.count).toBe(4);
    expect(result.rows.map((r) => formatIP(r.network))).toEqual([
      '192.168.20.0',
      '192.168.20.64',
      '192.168.20.128',
      '192.168.20.192',
    ]);
  });
  it('detects asymmetric masks, duplicate addresses and reserved endpoints', () => {
    const result = compareNetworks('192.168.1.10', '24', '192.168.1.130', '25');
    expect(result.aLocal).toBe(true);
    expect(result.bLocal).toBe(false);
    expect(result.direct).toBe(false);
    expect(compareNetworks('192.168.1.10', '24', '192.168.1.11', '24').direct).toBe(true);
    expect(compareNetworks('192.168.1.10', '24', '192.168.1.10', '24').direct).toBe(false);
    expect(compareNetworks('192.168.1.0', '24', '192.168.1.10', '24').direct).toBe(false);
  });
});

// Independently generated with Python's standard-library ipaddress module.
import reference from './network-reference.json';
describe('independent reference vectors for every IPv4 prefix', () => {
  it.each(reference)('$ip/$prefix matches Python ipaddress', (v) => {
    const result = subnet(v.ip, v.prefix);
    expect(formatIP(result.network)).toBe(v.network);
    expect(formatIP(result.last)).toBe(v.last);
    expect(formatIP(result.mask)).toBe(v.mask);
    expect(result.usable).toBe(v.usable);
  });
});
