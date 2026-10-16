import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { conceptTasks, type ConceptTask } from '../src/concept-tasks';

const bitValues = [128, 64, 32, 16, 8, 4, 2, 1];
const kinds = ['choice', 'order', 'match', 'bits'] as const;
const exactText = (value: string) =>
  new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);

test.beforeEach(async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept());
});

async function openTask(page: Page, task: ConceptTask) {
  if (await page.locator('.concept-task').count()) {
    await page.getByRole('button', { name: 'Übersicht', exact: true }).click();
    await page.getByRole('button', { name: 'Runde beenden', exact: true }).click();
    await expect(page.locator('.concept-task')).toHaveCount(0);
  }
  await page.goto(`/#quiz/${task.topic}`);
  await expect(page.getByRole('combobox', { name: 'Thema auswählen' })).toHaveValue(task.topic);
  await page.getByRole('button', { name: 'Interaktive Runde starten', exact: true }).click();
  for (const earlier of conceptTasks.filter((item) => item.topic === task.topic)) {
    await expect(page.locator('.concept-task > h2')).toHaveText(earlier.title);
    if (earlier.id === task.id) return;
    await page.getByRole('button', { name: 'Lösung ansehen', exact: true }).click();
    await page.getByRole('button', { name: 'Nächste Aufgabe', exact: true }).click();
  }
  throw new Error(`Task ${task.id} was not reachable from its topic`);
}

async function setAnswer(page: Page, task: ConceptTask, correct = true) {
  const card = page.locator('.concept-task');
  if (task.kind === 'choice') {
    const option = task.options.find((item) => (item.id === task.correct) === correct)!;
    await card
      .locator('.concept-option')
      .filter({ has: page.locator('strong').filter({ hasText: exactText(option.label) }) })
      .click();
  } else if (task.kind === 'order') {
    const desired = correct ? task.correctOrder : [...task.correctOrder].reverse();
    for (const [destination, id] of desired.entries()) {
      const label = task.items.find((item) => item.id === id)!.label;
      const current = (await card.locator('.concept-order-label').allTextContents()).indexOf(label);
      for (let index = current; index > destination; index--) {
        await card.getByRole('button', { name: `${label}: nach oben`, exact: true }).click();
      }
    }
    await expect(card.locator('.concept-order-label')).toHaveText(
      desired.map((id) => task.items.find((item) => item.id === id)!.label),
    );
  } else if (task.kind === 'match') {
    for (const pair of task.pairs) {
      const undo = card.getByRole('button', {
        name: `Verbindung von ${pair.left} lösen`,
        exact: true,
      });
      if (await undo.count()) await undo.click();
    }
    for (const [index, pair] of task.pairs.entries()) {
      await card
        .getByRole('group', { name: 'Linke Karten', exact: true })
        .getByRole('button', { name: pair.left, exact: true })
        .click();
      const right = correct ? pair : task.pairs[(index + 1) % task.pairs.length];
      await card
        .getByRole('group', { name: 'Rechte Karten', exact: true })
        .getByRole('button', { name: right.right, exact: true })
        .click();
    }
    await expect(card.locator('.concept-formed-pairs li')).toHaveCount(task.pairs.length);
  } else {
    const desired = correct ? task.target : task.target ^ 1;
    for (const value of bitValues) {
      const button = card.getByRole('button', { name: new RegExp(`^Bit mit Wert ${value}:`) });
      const enabled = (await button.getAttribute('aria-pressed')) === 'true';
      if (enabled !== Boolean(desired & value)) await button.click();
    }
    await expect(card.locator('.concept-bit-readout [role=status] strong')).toHaveText(
      String(desired),
    );
  }
}

async function checkCorrect(page: Page, task: ConceptTask) {
  await setAnswer(page, task);
  await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
  await expect(page.locator('.concept-feedback')).toContainText('Richtig gelöst');
  await expect(page.locator('.concept-feedback')).toContainText(task.explanation);
  await expect(page.locator('.concept-feedback')).toBeFocused();
}

test('all 28 interactive tasks can be solved through their controls and save correct results', async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const topic of new Set(conceptTasks.map((task) => task.topic))) {
    const tasks = conceptTasks.filter((task) => task.topic === topic);
    await page.goto(`/#quiz/${topic}`);
    await expect(page.getByRole('combobox', { name: 'Thema auswählen' })).toHaveValue(topic);
    await page.getByRole('button', { name: 'Interaktive Runde starten', exact: true }).click();
    for (const [index, task] of tasks.entries()) {
      await expect(page.locator('.concept-task > h2')).toHaveText(task.title);
      await expect(page.locator('.concept-task input, .concept-task textarea')).toHaveCount(0);
      await checkCorrect(page, task);
      await page
        .getByRole('button', {
          name: index === tasks.length - 1 ? 'Auswertung ansehen' : 'Nächste Aufgabe',
          exact: true,
        })
        .click();
    }
    await expect(page.locator('.concept-summary')).toContainText(
      '2 von 2 Aufgaben richtig abgeschlossen',
    );
    await expect(page.locator('.concept-summary li strong')).toHaveText([
      'Richtig abgeschlossen',
      'Richtig abgeschlossen',
    ]);
  }
  const progress = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('telematik-progress-v1')!),
  );
  expect(progress.attempts.map((attempt: { id: string }) => attempt.id).sort()).toEqual(
    conceptTasks.map((task) => task.id).sort(),
  );
  expect(progress.attempts.every((attempt: { correct: boolean }) => attempt.correct)).toBe(true);
  expect(progress.mistakes).toEqual([]);
});

test('each interaction explains a wrong attempt, offers a hint and accepts a corrected retry', async ({
  page,
}) => {
  for (const kind of kinds) {
    const task = conceptTasks.find((item) => item.kind === kind)!;
    await openTask(page, task);
    const previousAttempts = await page.evaluate(
      (id) =>
        JSON.parse(localStorage.getItem('telematik-progress-v1')!).attempts.filter(
          (attempt: { id: string }) => attempt.id === id,
        ).length,
      task.id,
    );
    await page.getByRole('button', { name: 'Hinweis', exact: true }).click();
    await expect(page.locator('.concept-hint')).toContainText(task.hint);
    await setAnswer(page, task, false);
    await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
    await expect(page.locator('.concept-feedback')).toContainText('Noch nicht ganz');
    await expect(page.locator('.concept-feedback')).toContainText(task.explanation);
    await expect(page.getByRole('button', { name: 'Prüfen', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Nächste Aufgabe', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Nochmals versuchen', exact: true }).click();
    await expect(page.locator('.concept-task > h2')).toBeFocused();
    await checkCorrect(page, task);
    const saved = await page.evaluate((id) => {
      const progress = JSON.parse(localStorage.getItem('telematik-progress-v1')!);
      return {
        results: progress.attempts
          .filter((attempt: { id: string }) => attempt.id === id)
          .map((attempt: { correct: boolean }) => attempt.correct),
        unresolved: progress.mistakes.includes(id),
      };
    }, task.id);
    expect(saved.results.slice(previousAttempts)).toEqual([false, true]);
    expect(saved.unresolved).toBe(false);
  }
});

test('revealed solutions explain every interaction without counting as self-solved', async ({
  page,
}) => {
  for (const kind of kinds) {
    const task = conceptTasks.find((item) => item.kind === kind)!;
    await openTask(page, task);
    await page.getByRole('button', { name: 'Lösung ansehen', exact: true }).click();
    await expect(page.locator('.concept-feedback')).toContainText('Lösung und Erklärung');
    await expect(page.locator('.concept-feedback')).toContainText(task.explanation);
    await expect(page.locator('.concept-feedback')).toContainText(
      'Angesehene Lösungen zählen nicht als richtig gelöst',
    );
    await expect(page.locator('.concept-solution')).toContainText('Richtige Lösung');
    if (task.kind === 'choice') {
      await expect(page.locator('.concept-solution')).toContainText(
        task.options.find((option) => option.id === task.correct)!.label,
      );
    } else if (task.kind === 'order') {
      await expect(page.locator('.concept-solution li')).toHaveText(
        task.correctOrder.map((id) => task.items.find((item) => item.id === id)!.label),
      );
    } else if (task.kind === 'match') {
      for (const pair of task.pairs)
        await expect(page.locator('.concept-solution')).toContainText(
          `${pair.left}: ${pair.right}`,
        );
    } else {
      await expect(page.locator('.concept-solution code')).toHaveText(
        task.target.toString(2).padStart(8, '0'),
      );
    }
    const tasks = conceptTasks.filter((item) => item.topic === task.topic);
    const at = tasks.findIndex((item) => item.id === task.id);
    for (let index = at; index < tasks.length; index++) {
      if (index !== at)
        await page.getByRole('button', { name: 'Lösung ansehen', exact: true }).click();
      await page
        .getByRole('button', {
          name: index === tasks.length - 1 ? 'Auswertung ansehen' : 'Nächste Aufgabe',
          exact: true,
        })
        .click();
    }
    await expect(page.locator('.concept-summary')).toContainText(
      '0 von 2 Aufgaben richtig abgeschlossen',
    );
    const progress = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('telematik-progress-v1')!),
    );
    expect(
      progress.attempts.some(
        (attempt: { id: string; correct: boolean }) => attempt.id === task.id && attempt.correct,
      ),
    ).toBe(false);
    expect(progress.mistakes).toContain(task.id);
  }
});

test('an interactive mistake survives reloading and clears through the dedicated review round', async ({
  page,
}) => {
  const task = conceptTasks.find(
    (item) =>
      item.kind === 'choice' &&
      conceptTasks.find((candidate) => candidate.topic === item.topic)!.id === item.id,
  )!;
  await openTask(page, task);
  await setAnswer(page, task, false);
  await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
  await page.reload();
  await page
    .getByRole('button', { name: /Fehler wiederholen/, exact: false })
    .first()
    .click();
  await expect(page).toHaveURL(/#mistakes$/);
  await expect(
    page.getByRole('tab', { name: 'Interaktiv verstehen (1)', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('button', { name: 'Interaktive Runde starten', exact: true }).click();
  await expect(page.locator('.concept-task > h2')).toHaveText(task.title);
  await checkCorrect(page, task);
  await page.getByRole('button', { name: 'Auswertung ansehen', exact: true }).click();
  await expect(page.locator('.concept-summary')).toContainText(
    '1 von 1 Aufgaben richtig abgeschlossen',
  );
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Keine offenen interaktiven Aufgaben', exact: true }),
  ).toBeDisabled();
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(localStorage.getItem('telematik-progress-v1')!).mistakes),
    )
    .toEqual([]);
});

test('practice tabs and task controls support keyboards, accessible themes and narrow screens', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto('/#quiz/binary');
  const interactive = page.getByRole('tab', { name: 'Interaktiv verstehen', exact: true });
  const written = page.getByRole('tab', { name: 'Prüfungsfragen', exact: true });
  await interactive.focus();
  await page.keyboard.press('ArrowRight');
  await expect(written).toBeFocused();
  await expect(written).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toHaveAccessibleName('Prüfungsfragen');
  await page.keyboard.press('Home');
  await expect(interactive).toBeFocused();
  await expect(interactive).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toHaveAccessibleName('Interaktiv verstehen');
  await page.getByRole('button', { name: 'Interaktive Runde starten', exact: true }).click();
  await expect(written).toBeDisabled();
  const bit = page.getByRole('button', { name: /^Bit mit Wert 128:/ });
  const previous = await bit.getAttribute('aria-pressed');
  await bit.focus();
  await page.keyboard.press('Space');
  await expect(bit).toHaveAttribute('aria-pressed', previous === 'true' ? 'false' : 'true');

  for (const theme of ['dark', 'light']) {
    if (theme === 'light')
      await page.getByRole('button', { name: 'Hellmodus aktivieren', exact: true }).click();
    for (const kind of kinds) {
      const task = conceptTasks.find((item) => item.kind === kind)!;
      await page.setViewportSize({ width: 1440, height: 1000 });
      await openTask(page, task);
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      const initial = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(initial.violations, `${kind} initial / ${theme}`).toEqual([]);
      await page.setViewportSize({ width: 390, height: 844 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${kind} initial / ${theme}`,
      ).toBe(true);
      await page.setViewportSize({ width: 1440, height: 1000 });
      await checkCorrect(page, task);
      const checked = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(checked.violations, `${kind} feedback / ${theme}`).toEqual([]);
      await page.setViewportSize({ width: 390, height: 844 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${kind} feedback / ${theme}`,
      ).toBe(true);
    }
  }
});
