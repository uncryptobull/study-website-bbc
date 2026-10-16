import { chmod, copyFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const bundled = new URL('../dist/index.html', import.meta.url);
const ready = new URL('../Telematik-verstehen.html', import.meta.url);
const html = await readFile(bundled, 'utf8');
if (/<script\b[^>]*\bsrc\s*=/i.test(html) || /<link\b[^>]*rel=["']stylesheet["']/i.test(html)) {
  throw new Error('Die Offline-App enthält noch externe Skripte oder Styles.');
}
for (const destination of [ready, new URL('../dist/Telematik-verstehen.html', import.meta.url)]) {
  await copyFile(bundled, destination);
  await chmod(destination, 0o644);
}
console.log(`Offline-App aktualisiert: ${fileURLToPath(ready)}`);
