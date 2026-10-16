import { test, expect } from '@playwright/test';
import { createServer, type Server } from 'node:http';
import { readFile } from 'node:fs/promises';
let server: Server;
let address: string;
let source: string;
let downloadedSource: string;
test.beforeAll(async () => {
  source = await readFile('dist/index.html', 'utf8');
  server = createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
    response.end(request.url?.startsWith('/downloaded') ? downloadedSource : source);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const location = server.address();
  if (!location || typeof location === 'string')
    throw new Error('Testserver konnte nicht gestartet werden.');
  address = `http://127.0.0.1:${location.port}`;
});
test.afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});
test('production privacy policy blocks outgoing data requests and omits referrers', async ({
  page,
}) => {
  await page.goto(address);
  await expect(page.getByRole('heading', { name: 'Telematik', exact: true })).toBeVisible();
  const policy = await page.evaluate(async () => {
    const violations: string[] = [];
    document.addEventListener('securitypolicyviolation', (event) =>
      violations.push(event.effectiveDirective),
    );
    const requestBlocked = await fetch('https://example.invalid/privacy-check').then(
      () => false,
      () => true,
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    return {
      requestBlocked,
      violations,
      referrer: document.querySelector('meta[name="referrer"]')?.getAttribute('content'),
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content'),
    };
  });
  expect(policy.requestBlocked).toBe(true);
  expect(policy.violations).toContain('connect-src');
  expect(policy.referrer).toBe('no-referrer');
  expect(policy.robots).toContain('noindex');
  await page.getByRole('button', { name: 'Fortschritt & Sicherung', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Deine Daten', exact: true })).toBeVisible();
});
test('production app exports a clean self-contained offline copy that starts without assets', async ({
  page,
  context,
}) => {
  expect(await readFile('Telematik-verstehen.html', 'utf8')).toBe(source);
  const requests: string[] = [],
    errors: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(address);
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('button', { name: 'Grundlagen starten' }).click();
  await page.locator('.check-options button').first().click();
  await context.setOffline(true);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Offline-Datei speichern', exact: true }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('Telematik-verstehen.html');
  const path = await download.path();
  expect(path).not.toBeNull();
  downloadedSource = await readFile(path!, 'utf8');
  const documentInfo = await page.evaluate((html) => {
    const copy = new DOMParser().parseFromString(html, 'text/html');
    return {
      rootChildren: copy.getElementById('root')?.childElementCount,
      scriptFiles: copy.querySelectorAll('script[src]').length,
      styleFiles: copy.querySelectorAll('link[rel=stylesheet]').length,
    };
  }, downloadedSource);
  expect(documentInfo).toEqual({ rootChildren: 0, scriptFiles: 0, styleFiles: 0 });
  expect(requests).toEqual([address + '/']);
  expect(errors).toEqual([]);
  await context.setOffline(false);
  await page.goto(address + '/downloaded.html');
  await expect(page.getByRole('heading', { name: 'Telematik', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'IP-Trainer', exact: true }).click();
  await expect(page.locator('.network-result')).toContainText('192.168.1.64');
  expect(requests).toEqual([address + '/', address + '/downloaded.html']);
  expect(errors).toEqual([]);
});

test('source entry gives a useful file-opening guide when scripts cannot run', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173/');
    await expect(
      page.getByRole('heading', { name: 'Telematik verstehen', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Telematik-verstehen.html', exact: true }),
    ).toHaveAttribute('href', './Telematik-verstehen.html');
    await expect(page.locator('body')).toContainText('braucht keine Installation');
  } finally {
    await context.close();
  }
});
