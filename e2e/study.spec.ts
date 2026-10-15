import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { findQuestion, questions } from '../src/content';

test('all lessons are searchable, readable and persist completion', async ({ page }) => {
  await page.goto('/#learn');
  await expect(page.locator('.learning-grid .topic-card')).toHaveCount(14);
  await page.getByRole('textbox', { name: 'Themen suchen' }).fill('FLSM');
  await expect(page.locator('.learning-grid .topic-card')).toHaveCount(1);
  await page.getByRole('button', { name: /Subnetting & FLSM/ }).click();
  await expect(page.getByRole('heading', { name: 'Hier stolpern viele' })).toBeVisible();
  await page.getByRole('button', { name: 'Lektion abschliessen', exact: true }).click();
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(localStorage.getItem('telematik-progress-v1')!).completed),
    )
    .toContain('subnetting');
});

test('IPv4 trainer handles example, /20, /31, /32 and invalid input', async ({ page }) => {
  await page.goto('/#trainer');
  await expect(page.locator('.network-result')).toContainText('192.168.1.64');
  await expect(page.locator('.result-card')).toContainText('192.168.1.126');
  await page.getByRole('button', { name: '/20', exact: true }).click();
  await expect(page.locator('.result-card')).toContainText('10.7.47.255');
  await page.getByRole('button', { name: '/31', exact: true }).click();
  await expect(page.locator('.result-card')).toContainText('Kein Broadcast');
  await expect(page.locator('.result-card')).toContainText('10.0.0.1');
  await page.getByRole('button', { name: '/32', exact: true }).click();
  await expect(page.locator('.result-card')).toContainText('Kein Broadcast');
  await page.getByRole('textbox', { name: 'IPv4-Adresse', exact: true }).fill('300.1.1.1');
  await expect(page.getByRole('alert')).toContainText('0 bis 255');
  await expect(page.locator('.network-result')).toHaveCount(0);
});

test('binary, network comparison and FLSM are functional', async ({ page }) => {
  await page.goto('/#trainer');
  await page.getByRole('tab', { name: 'Binärtrainer', exact: true }).click();
  await expect(page.locator('.binary-total strong').first()).toHaveText('77');
  await page.getByRole('button', { name: 'Bit mit Stellenwert 128', exact: true }).click();
  await expect(page.locator('.binary-total strong').first()).toHaveText('205');
  await page.getByRole('tab', { name: 'Netzvergleich', exact: true }).click();
  await expect(
    page.getByRole('heading', {
      name: 'Die Konfiguration ist für direkte Kommunikation ungeeignet.',
    }),
  ).toBeVisible();
  await page.getByRole('textbox', { name: 'IP Gerät B', exact: true }).fill('192.168.1.11');
  await page.getByRole('textbox', { name: 'Präfix Gerät B', exact: true }).fill('24');
  await expect(
    page.getByRole('heading', {
      name: 'Die IP-Konfiguration erlaubt direkte lokale Kommunikation.',
    }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'FLSM aufteilen', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(4);
  await expect(page.locator('tbody tr').last()).toContainText('192.168.20.192/26');
});

test('wrong answers persist, can be replayed and clear after a correct answer', async ({
  page,
}) => {
  await page.goto('/#quiz');
  await page.locator('select').selectOption('binary');
  await page.getByRole('button', { name: 'Lernrunde starten' }).click();
  const prompt = await page.locator('.question-card h2').innerText();
  const q = questions.find((q) => q.prompt === prompt)!;
  if (q.choices)
    await page
      .locator('.choices button')
      .filter({ hasText: q.choices.find((c) => c !== q.answer)! })
      .click();
  else await page.locator('.question-card input').fill('falsch');
  await page.getByRole('button', { name: 'Antwort prüfen' }).click();
  await expect(page.getByRole('status')).toContainText('Richtige Antwort');
  await page.reload();
  await page.getByRole('button', { name: /Meine Fehler/ }).click();
  await page.getByRole('button', { name: 'Lernrunde starten' }).click();
  if (q.choices) await page.locator('.choices button').filter({ hasText: q.answer }).click();
  else await page.locator('.question-card input').fill(q.answer);
  await page.getByRole('button', { name: 'Antwort prüfen' }).click();
  await expect(page.getByRole('status')).toContainText('Richtig. Gut verstanden!');
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(localStorage.getItem('telematik-progress-v1')!).mistakes),
    )
    .toEqual([]);
});

test('mixed exam finishes with a topic breakdown', async ({ page }) => {
  await page.goto('/#exam');
  await page.getByRole('button', { name: 'Prüfungstraining starten', exact: true }).click();
  for (let i = 0; i < 14; i++) {
    const prompt = await page.locator('.question-card h2').innerText();
    const q = questions.find((q) => q.prompt === prompt)!;
    if (q.choices) await page.locator('.choices button').filter({ hasText: q.answer }).click();
    else await page.locator('.question-card input').fill(q.answer);
    await page.getByRole('button', { name: 'Antwort prüfen' }).click();
    await page
      .getByRole('button', { name: i === 13 ? 'Auswertung ansehen' : 'Nächste Frage' })
      .click();
  }
  await expect(page.locator('.results-summary h2')).toHaveText(
    '14 von 14 automatisch geprüften Antworten richtig.',
  );
  await expect(page.locator('.topic-results>div')).toHaveCount(14);
});

test('generated subnet questions can be replayed from stored IDs', async ({ page }) => {
  await page.goto('/#quiz');
  await page.getByRole('button', { name: 'Aufgaben generieren' }).click();
  await page.locator('.question-card input').fill('falsch');
  await page.getByRole('button', { name: 'Antwort prüfen' }).click();
  const id = await page.evaluate(
    () => JSON.parse(localStorage.getItem('telematik-progress-v1')!).mistakes[0],
  );
  expect(findQuestion(id)?.answer).toMatch(/^\d+\.\d+\.\d+\.\d+$/);
  await page.reload();
  await page.getByRole('button', { name: /Meine Fehler/ }).click();
  await page.getByRole('button', { name: 'Lernrunde starten' }).click();
  await expect(page.locator('.question-card h2')).toHaveText(findQuestion(id)!.prompt);
});

test('progress exports, imports and resets only after confirmation', async ({ page }) => {
  await page.goto('/#progress');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Fortschritt sichern' }).click();
  expect((await download).suggestedFilename()).toMatch(/telematik-fortschritt/);
  await page.locator('input[type=file]').setInputFiles({
    name: 'backup.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify({
        completed: ['binary'],
        attempts: [{ id: 'binary-1', correct: true, date: '2026-10-15T12:00:00Z' }],
        mistakes: [],
      }),
    ),
  });
  await expect(page.getByRole('status')).toContainText('importiert');
  await expect(page.locator('.three-stats .stat-value').first()).toHaveText('1/14');
  await page.getByRole('button', { name: 'Fortschritt zurücksetzen' }).click();
  await page.getByRole('button', { name: 'Abbrechen', exact: true }).click();
  await expect(page.locator('.three-stats .stat-value').first()).toHaveText('1/14');
  await page.getByRole('button', { name: 'Fortschritt zurücksetzen' }).click();
  await page.getByRole('button', { name: 'Jetzt löschen', exact: true }).click();
  await expect(page.locator('.three-stats .stat-value').first()).toHaveText('0/14');
});

test('theme persists and desktop layouts pass automated accessibility checks', async ({ page }) => {
  await page.goto('/');
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark')
      await page.getByRole('button', { name: 'Dunkelmodus aktivieren' }).click();
    for (const route of [
      'dashboard',
      'learn',
      'trainer',
      'quiz',
      'simulations',
      'progress',
      'sources',
    ]) {
      await page.goto('/#' + route);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(results.violations, `${route} / ${theme}`).toEqual([]);
    }
  }
});

test('narrow layouts contain trainer overflow and show navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    'dashboard',
    'learn',
    'trainer',
    'quiz',
    'simulations',
    'progress',
    'sources',
  ]) {
    await page.goto('/#' + route);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      route,
    ).toBe(true);
  }
  await page.getByRole('button', { name: 'Menü öffnen', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Dein Lernpfad', exact: true })).toBeInViewport();
});

test('all simulation steps are reachable', async ({ page }) => {
  await page.goto('/#simulations');
  for (let i = 0; i < 7; i++)
    await page.getByRole('button', { name: 'Nächster Schritt', exact: true }).click();
  await expect(page.locator('.simulation-stage h2')).toHaveText('Die Antwort kommt zurück');
  await page.getByRole('button', { name: 'Noch einmal', exact: true }).click();
  await expect(page.locator('.simulation-stage h2')).toHaveText('WLAN verbinden');
});
