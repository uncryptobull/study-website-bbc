export function parseIP(value: string): number {
  const parts = value.trim().split('.');
  if (parts.length !== 4 || parts.some((p) => !/^\d{1,3}$/.test(p) || Number(p) > 255)) {
    throw new Error('Bitte gib vier Zahlen von 0 bis 255 ein, z. B. 192.168.1.77.');
  }
  return parts.reduce((total, part) => total * 256 + Number(part), 0);
}
export function formatIP(value: number): string {
  return [24, 16, 8, 0].map((shift) => Math.floor(value / 2 ** shift) % 256).join('.');
}
export function prefixNumber(value: string | number): number {
  if (!/^\d{1,2}$/.test(String(value)) || Number(value) > 32)
    throw new Error('Der Präfix muss eine ganze Zahl zwischen 0 und 32 sein.');
  return Number(value);
}
export function subnet(ip: string, prefix: string | number) {
  const address = parseIP(ip);
  const p = prefixNumber(prefix);
  const size = 2 ** (32 - p);
  const network = Math.floor(address / size) * size;
  const last = network + size - 1;
  const usable = p >= 31 ? size : size - 2;
  return {
    address,
    prefix: p,
    size,
    network,
    last,
    mask: 2 ** 32 - size,
    usable,
    firstHost: network + (p >= 31 ? 0 : 1),
    lastHost: last - (p >= 31 ? 0 : 1),
    broadcast: p >= 31 ? null : last,
    validHost: p >= 31 || (address > network && address < last),
  };
}
export function bits(value: number) {
  return value.toString(2).padStart(32, '0');
}
export function compareNetworks(ipA: string, prefixA: string, ipB: string, prefixB: string) {
  const a = subnet(ipA, prefixA);
  const b = subnet(ipB, prefixB);
  const aLocal = b.address >= a.network && b.address <= a.last;
  const bLocal = a.address >= b.network && a.address <= b.last;
  const distinct = a.address !== b.address;
  return {
    a,
    b,
    aLocal,
    bLocal,
    direct: aLocal && bLocal && a.validHost && b.validHost && distinct,
    distinct,
  };
}
export function splitNetwork(ip: string, original: string, target: string) {
  const base = subnet(ip, original);
  const next = prefixNumber(target);
  if (next <= base.prefix)
    throw new Error('Der neue Präfix muss grösser als der Ausgangspräfix sein.');
  const count = 2 ** (next - base.prefix);
  const rows = Array.from({ length: Math.min(count, 64) }, (_, i) =>
    subnet(formatIP(base.network + i * 2 ** (32 - next)), next),
  );
  return { base, count, rows };
}
