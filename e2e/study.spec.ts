import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { findQuestion, questions } from '../src/content';
import { learningSteps } from '../src/learning';

test.beforeEach(async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept());
});

test('all lessons are searchable and guided learning persists its exact position and completion', async ({
  page,
}) => {
  await page.goto('/#learn');
  await expect(page.locator('.lesson-row')).toHaveCount(14);
  await page.getByRole('textbox', { name: 'Themen suchen' }).fill('FLSM');
  await expect(page.locator('.lesson-row')).toHaveCount(1);
  await page.locator('.lesson-row').click();
  for (const [index, step] of learningSteps.subnetting.entries()) {
    await expect(page.locator('.step-heading h1')).toHaveText(step.title);
    await expect(
      page.getByRole('button', {
        name: index === learningSteps.subnetting.length - 1 ? 'Offene Schritte lesen' : 'Weiter',
        exact: true,
      }),
    ).toBeDisabled();
    await page.locator('.check-options button').nth(step.check!.correct).click();
    await page
      .getByRole('button', {
        name: index === learningSteps.subnetting.length - 1 ? 'Lektion abschliessen' : 'Weiter',
        exact: true,
      })
      .click();
    if (index === 1) {
      await page.reload();
      await expect(page).toHaveURL(/#learn\/subnetting\/3$/);
    }
  }
  await expect(page.locator('.lesson-summary')).toBeVisible();
  await page.reload();
  await expect(page.locator('.lesson-summary')).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(localStorage.getItem('telematik-progress-v1')!).completed),
    )
    .toContain('subnetting');
  await page.getByRole('button', { name: 'Mit fünf Fragen festigen' }).click();
  await expect(page.locator('select')).toHaveValue('subnetting');
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
  else await page.locator('.question-card input').fill(q.id === 'binary-2' ? '00000000' : '0');
  await page.getByRole('button', { name: 'Antwort prüfen' }).click();
  await expect(page.getByRole('status')).toContainText('Richtige Antwort');
  await page.reload();
  await page.getByRole('button', { name: /Fehler wiederholen/ }).click();
  await page.getByRole('button', { name: 'Lernrunde starten' }).click();
  if (q.choices) await page.locator('.choices button').filter({ hasText: q.answer }).click();
  else await page.locator('.question-card input').fill(q.answer);
  await page.getByRole('button', { name: 'Antwort prüfen' }).click();
  await expect(page.getByRole('status')).toContainText('Richtig beantwortet');
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
  await page.locator('.question-card input').fill('0.0.0.0');
  await page.getByRole('button', { name: 'Antwort prüfen' }).click();
  const id = await page.evaluate(
    () => JSON.parse(localStorage.getItem('telematik-progress-v1')!).mistakes[0],
  );
  expect(findQuestion(id)?.answer).toMatch(/^\d+\.\d+\.\d+\.\d+$/);
  await page.reload();
  await page.getByRole('button', { name: /Fehler wiederholen/ }).click();
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
        lessonSteps: { binary: learningSteps.binary.map((s) => s.id) },
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
  for (const theme of ['dark', 'light']) {
    if (theme === 'light') await page.getByRole('button', { name: 'Hellmodus aktivieren' }).click();
    for (const route of [
      'dashboard',
      'learn',
      'learn/devices/1',
      'learn/ipv4/1',
      'learn/subnetting/1',
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
  await expect(
    page.getByRole('button', { name: 'Lektionen', exact: true }).first(),
  ).toBeInViewport();
});

test('all simulation steps are reachable', async ({ page }) => {
  await page.goto('/#simulations');
  for (let i = 0; i < 7; i++)
    await page.getByRole('button', { name: 'Nächster Schritt', exact: true }).click();
  await expect(page.locator('.simulation-stage h2')).toHaveText('Die Antwort kommt zurück');
  await page.getByRole('button', { name: 'Noch einmal', exact: true }).click();
  await expect(page.locator('.simulation-stage h2')).toHaveText('WLAN verbinden');
});

test('a wrong guided answer explains the mistake and cannot skip unfinished steps', async ({
  page,
}) => {
  await page.goto('/#learn/ipv4/6');
  const last = learningSteps.ipv4.at(-1)!;
  await page
    .locator('.check-options button')
    .nth((last.check!.correct + 1) % last.check!.options.length)
    .click();
  await expect(page.locator('.check-feedback')).toContainText(last.check!.explanation);
  await expect(page.getByRole('button', { name: 'Offene Schritte lesen' })).toBeDisabled();
  await page.locator('.check-options button').nth(last.check!.correct).click();
  await expect(page.locator('.outline-footer')).toContainText('1 von 6 verstanden');
  await page.getByRole('button', { name: 'Offene Schritte lesen' }).click();
  await expect(page).toHaveURL(/#learn\/ipv4\/1$/);
  await expect(page.locator('.lesson-summary')).toHaveCount(0);
  await expect(page.locator('.sidebar-progress strong')).toHaveText('0/14');
});

test('beginner entry, resume, browser back and lesson outlines navigate correctly', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Grundlagen starten' }).click();
  await expect(page).toHaveURL(/#learn\/devices\/1$/);
  await page.locator('.check-options button').nth(learningSteps.devices[0].check!.correct).click();
  await page.getByRole('button', { name: 'Weiter', exact: true }).click();
  await page.goBack();
  await expect(page.locator('.step-heading h1')).toHaveText(learningSteps.devices[0].title);
  await page.goForward();
  await expect(page.locator('.step-heading h1')).toHaveText(learningSteps.devices[1].title);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.getByRole('button', { name: 'Weiterlernen', exact: true }).click();
  await expect(page).toHaveURL(/#learn\/devices\/2$/);
  await page.reload();
  await expect(page.locator('.step-heading h1')).toHaveText(learningSteps.devices[1].title);
  await page.getByRole('button', { name: 'Alle Lektionen', exact: true }).click();
  await expect(page.locator('.lesson-row')).toHaveCount(14);
});

test('all 59 guided steps can be completed and summaries stay useful', async ({ page }) => {
  test.setTimeout(90000);
  for (const [topic, steps] of Object.entries(learningSteps)) {
    await page.goto(`/#learn/${topic}/1`);
    for (const [i, step] of steps.entries()) {
      await expect(page.locator('.step-heading h1')).toHaveText(step.title);
      await page.locator('.check-options button').nth(step.check!.correct).click();
      await page
        .getByRole('button', {
          name: i === steps.length - 1 ? 'Lektion abschliessen' : 'Weiter',
          exact: true,
        })
        .click();
    }
    await expect(page.locator('.lesson-summary li')).toHaveCount(steps.length);
  }
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.locator('.sidebar-progress strong')).toHaveText('14/14');
  await expect(
    page.getByRole('button', { name: 'Prüfungstraining starten', exact: true }),
  ).toBeVisible();
});

test('unfinished quiz navigation is explicit and cancellation preserves the answer', async ({
  page,
}) => {
  await page.goto('/#quiz/binary');
  await page.getByRole('button', { name: 'Lernrunde starten' }).click();
  const original = await page.locator('.question-card h2').innerText();
  await page.getByRole('button', { name: 'Lektionen', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Weiter üben', exact: true }).click();
  await expect(page.locator('.question-card h2')).toHaveText(original);
  await page.getByRole('button', { name: 'Lektionen', exact: true }).click();
  await page.getByRole('button', { name: 'Runde verlassen', exact: true }).click();
  await expect(page.locator('.lesson-row')).toHaveCount(14);
});

test('interactive routing and PAT change when edited', async ({ page }) => {
  await page.goto('/#simulations');
  await page.getByRole('tab', { name: 'Routing', exact: true }).click();
  await expect(page.locator('.route-table .selected-row')).toHaveCount(1);
  await expect(page.locator('.route-table .selected-row input').first()).toHaveValue(
    '203.0.113.160/27',
  );
  await page.getByRole('textbox', { name: 'Zieladresse des Pakets' }).fill('198.51.100.8');
  await expect(page.locator('.route-table .selected-row input').first()).toHaveValue('0.0.0.0/0');
  await page.getByRole('tab', { name: 'NAT / PAT', exact: true }).click();
  await expect(page.locator('.pat-table tbody tr')).toHaveCount(2);
  await page.getByRole('textbox', { name: 'Interne IPv4-Adresse' }).fill('192.168.1.79');
  await page.getByRole('textbox', { name: 'Lokaler TCP-Port' }).fill('51000');
  await page.getByRole('button', { name: 'Verbindung öffnen' }).click();
  await expect(page.locator('.pat-table tbody tr')).toHaveCount(3);
  await expect(page.locator('#pat-reply-result')).toContainText('192.168.1.79:51000');
  await page.getByRole('button', { name: '49999 · unbekannt' }).click();
  await expect(page.locator('#pat-reply-result')).toContainText('Keine passende Zuordnung');
});

test('glossary lookup and focus timer work', async ({ page }) => {
  await page.goto('/#sources');
  await page.getByRole('textbox', { name: 'Begriff suchen' }).fill('Netzmaske');
  await page.locator('.glossary-grid summary').filter({ hasText: 'Netzmaske' }).click();
  await expect(page.locator('.glossary-grid details[open]')).toContainText('welche Bits');
  await page.goto('/');
  await page.clock.install();
  await page.getByRole('button', { name: '25 Minuten Fokuszeit starten' }).click();
  await page.clock.fastForward(25 * 60 * 1000);
  await expect(page.getByRole('status')).toContainText('25 Minuten sind um');
});
