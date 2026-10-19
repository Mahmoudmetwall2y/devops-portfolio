import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function openTerminal(page: Page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const trigger = page.getByRole('button', { name: 'Open Terminal', exact: true });
  await expect.poll(() => trigger.evaluate((element) => Number(getComputedStyle(element.closest('.hero-intro')!).opacity))).toBe(1);
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Portfolio terminal', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'Terminal command' })).toBeFocused();
  return dialog;
}

async function command(page: Page, value: string) {
  const input = page.getByRole('textbox', { name: 'Terminal command' });
  await input.fill(value);
  await input.press('Enter');
}

test('terminal closes by button and Escape, restores focus, and traps keyboard focus', async ({ page }) => {
  const dialog = await openTerminal(page);
  await expect(dialog.getByText('Local portfolio simulation. No commands run on a server.')).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  for (let index = 0; index < 8; index++) {
    await page.keyboard.press('Tab');
    // Native dialogs allow a browser-chrome focus stop (activeElement = body),
    // then wrap into the dialog. Background portfolio controls remain inert.
    expect(await dialog.evaluate((element) => element.matches(':modal') && (element.contains(document.activeElement) || document.activeElement === document.body))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  const trigger = page.getByRole('button', { name: 'Open Terminal', exact: true });
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole('button', { name: 'Close terminal', exact: true }).click();
  await expect(trigger).toBeFocused();
});

test('help, identity, files, biography, experience, and toolkit use portfolio content', async ({ page }) => {
  const dialog = await openTerminal(page);
  await command(page, 'help');
  await expect(dialog.locator('.portfolio-terminal-help dt')).toHaveCount(18);
  await expect(dialog.getByRole('button', { name: 'cat toolkit.conf', exact: true })).toBeVisible();
  await command(page, 'whoami');
  await expect(dialog.locator('.portfolio-terminal-reply').last()).toContainText('Mahmoud Metwally Ali');
  await expect(dialog.locator('.portfolio-terminal-reply').last()).toContainText('DevOps Engineer · Easytravel');
  const checks = [
    ['pwd', '/home/mahmoud/portfolio'], ['ls', 'about.md'],
    ['cat about.md', 'Communication and Electronics Engineering in 2026'],
    ['ls experience', 'Water Company'], ['cat experience.md', 'Supported more than 100 users'],
    ['ls skills', 'Cloud & infrastructure'], ['skills', 'Kubernetes / k3s'],
    ['cat toolkit.conf', 'Cloud resources defined as code'],
  ];
  for (const [input, expected] of checks) {
    await command(page, input);
    await expect(dialog.locator('.portfolio-terminal-reply').last()).toContainText(expected);
  }
});

test('both project-list commands show all three real projects and allow case-study navigation', async ({ page }) => {
  const dialog = await openTerminal(page);
  for (const input of ['projects', 'ls projects']) {
    await command(page, input);
    const reply = dialog.locator('.portfolio-terminal-reply').last();
    await expect(reply.getByRole('button')).toHaveText(['01 / 3-Tier User Platform', '02 / Space Cargo', '03 / Ultimate DevOps']);
    await expect(reply).toContainText('security scanning, container builds');
  }
  await dialog.locator('.portfolio-terminal-reply').last().getByRole('button', { name: 'Open Space Cargo case study' }).click();
  await expect(page.getByRole('dialog', { name: 'Space Cargo case study' })).toBeVisible();
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open Terminal', exact: true })).toBeFocused();
});

for (const [index, title] of ['3-Tier User Platform', 'Space Cargo', 'Ultimate DevOps'].entries()) {
  test(`open project ${index + 1} uses the accessible ${title} case study`, async ({ page }) => {
    await openTerminal(page);
    await command(page, `open project ${index + 1}`);
    const project = page.getByRole('dialog', { name: `${title} case study` });
    await expect(project.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(project.getByRole('button', { name: 'Close case study' })).toBeFocused();
    await expect(page.locator('dialog[open]')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Open Terminal', exact: true })).toBeFocused();
    await page.getByRole('button', { name: 'Open Terminal', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Terminal command' })).toBeFocused();
    await expect(page.locator('.portfolio-terminal-entry').last()).toContainText(`Opened the ${title} case study.`);
  });
}

test('empty, invalid, long, and HTML-like input remains inert text without command requests', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const dialog = await openTerminal(page);
  const requests: string[] = [];
  page.on('request', (request) => { if (['fetch', 'xhr'].includes(request.resourceType())) requests.push(request.url()); });
  await command(page, '   ');
  await expect(dialog.locator('.portfolio-terminal-entry')).toHaveCount(0);
  for (const input of ['hel', 'open project 4', 'sudo rm -rf /', '<img src=x onerror="window.terminalInjected=true">', 'x'.repeat(1024)]) {
    await command(page, input);
    const entry = dialog.locator('.portfolio-terminal-entry').last();
    await expect(entry).toContainText(`Command not found: ${input}`);
    expect(await entry.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
  }
  await expect(dialog.locator('.portfolio-terminal-entry').first()).toContainText('Try “help”');
  await expect(dialog.locator('.portfolio-terminal-entry').nth(1)).toContainText('open project 1, open project 2, or open project 3');
  await expect(dialog.locator('img, script, iframe')).toHaveCount(0);
  expect(await page.evaluate(() => 'terminalInjected' in window)).toBe(false);
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});

test('command history preserves draft input, repeated commands, and the session on reopen', async ({ page }) => {
  await openTerminal(page);
  await command(page, 'whoami'); await command(page, 'pwd'); await command(page, 'pwd');
  const input = page.getByRole('textbox', { name: 'Terminal command' });
  await input.fill('draft');
  await input.press('ArrowUp'); await expect(input).toHaveValue('pwd');
  await input.press('ArrowUp'); await expect(input).toHaveValue('pwd');
  await input.press('ArrowUp'); await expect(input).toHaveValue('whoami');
  await input.press('ArrowUp'); await expect(input).toHaveValue('whoami');
  for (let count = 0; count < 3; count++) await input.press('ArrowDown');
  await expect(input).toHaveValue('draft');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Open Terminal', exact: true }).click();
  await expect(input).toHaveValue('draft');
  await expect(page.locator('.portfolio-terminal-entry')).toHaveCount(3);
});

test('Tab completes known commands, cycles matches, and preserves ordinary focus navigation', async ({ page }) => {
  await openTerminal(page);
  const input = page.getByRole('textbox', { name: 'Terminal command' });
  await input.fill('who'); await input.press('Tab'); await expect(input).toHaveValue('whoami');
  await expect(input).toBeFocused();
  await input.press('Tab'); await expect(page.getByRole('button', { name: 'Run command' })).toBeFocused();
  await input.focus(); await input.fill('ls');
  await input.press('Tab'); await expect(input).toHaveValue('ls');
  await input.press('Tab'); await expect(input).toHaveValue('ls projects');
  await input.press('Shift+Tab'); await expect(input).not.toBeFocused();
  await input.focus(); await input.fill('unknown'); await input.press('Tab');
  await expect(page.getByRole('button', { name: 'Run command' })).toBeFocused();
  await input.focus(); await input.fill(''); await input.press('Tab');
  await expect(page.getByRole('button', { name: 'Run command' })).toBeFocused();
});

test('clear removes output while retaining history; exit restores trigger focus', async ({ page }) => {
  const dialog = await openTerminal(page);
  await command(page, 'whoami'); await command(page, 'clear');
  await expect(dialog.locator('.portfolio-terminal-entry')).toHaveCount(0);
  await expect(dialog.getByRole('status')).toHaveText('Terminal output cleared. Command history retained.');
  const input = dialog.getByRole('textbox', { name: 'Terminal command' });
  await input.press('ArrowUp'); await expect(input).toHaveValue('clear');
  await input.press('ArrowUp'); await expect(input).toHaveValue('whoami');
  await command(page, 'exit');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Open Terminal', exact: true })).toBeFocused();
});

test('contact reuses existing destinations and regular section navigation remains available', async ({ page }) => {
  const dialog = await openTerminal(page);
  await command(page, 'contact');
  const contact = dialog.locator('.portfolio-terminal-contact');
  await expect(contact.getByRole('link', { name: 'mahmoudmetwall2y@gmail.com' })).toHaveAttribute('href', 'mailto:mahmoudmetwall2y@gmail.com');
  await expect(contact.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute('href', 'https://github.com/Mahmoudmetwall2y');
  await expect(contact.getByRole('link', { name: 'LinkedIn', exact: true })).toHaveAttribute('href', 'https://www.linkedin.com/in/mahmoudmetwall2y');
  await expect(contact.getByRole('link', { name: 'Download CV' })).toHaveAttribute('href', /assets\/mahmoud-metwally-cv.pdf$/);
  await contact.getByRole('link', { name: 'Go to contact' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/#contact$/);
  await page.getByRole('navigation').getByRole('link', { name: /Work/ }).click();
  await expect(page).toHaveURL(/#work$/);
});

test('Control+K switches to the existing search without stacking dialogs', async ({ page }) => {
  await openTerminal(page);
  await command(page, 'whoami');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog', { name: 'Portfolio terminal' })).toHaveCount(0);
  const search = page.getByRole('dialog', { name: 'Search this portfolio' });
  await expect(search.getByRole('textbox')).toBeFocused();
  await expect(page.locator('dialog[open]')).toHaveCount(1);
  await search.getByRole('textbox').fill('Space Cargo');
  await search.getByRole('button', { name: /Space Cargo/ }).click();
  await expect(page.getByRole('dialog', { name: 'Space Cargo case study' })).toBeVisible();
});

for (const preference of ['reduce', 'no-preference'] as const) {
  test(`terminal cursor and live announcements respect ${preference}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: preference });
    const dialog = await openTerminal(page);
    const cursor = dialog.locator('.portfolio-terminal-cursor');
    await expect(cursor).toHaveCSS('animation-name', preference === 'reduce' ? 'none' : 'shell-cursor');
    await command(page, 'projects'); await command(page, 'whoami');
    await expect(dialog.getByRole('status')).toHaveText('Mahmoud Metwally Ali. DevOps Engineer at Easytravel.');
    await expect(dialog.getByRole('region', { name: 'Terminal output' })).not.toHaveAttribute('aria-live');
    await expect(dialog.getByRole('status')).not.toContainText('3-Tier User Platform');
    await page.emulateMedia({ reducedMotion: preference === 'reduce' ? 'no-preference' : 'reduce' });
    await expect(cursor).toHaveCSS('animation-name', preference === 'reduce' ? 'shell-cursor' : 'none');
    await command(page, 'exit');
    await expect(page.getByRole('button', { name: 'Open Terminal', exact: true })).toBeFocused();
  });
}

for (const width of [390, 320]) {
  test(`${width}px mobile terminal is readable, accessible, and scrolls only its output`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 700 : 844 });
    const dialog = await openTerminal(page);
    await command(page, 'projects');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    expect(await dialog.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
    const output = dialog.getByRole('region', { name: 'Terminal output' });
    expect(await output.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
    await output.evaluate((element) => { element.scrollTop = element.scrollHeight; });
    await dialog.getByRole('button', { name: 'Open Ultimate DevOps case study' }).click();
    await expect(page.getByRole('dialog', { name: 'Ultimate DevOps case study' })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Open Terminal', exact: true }).click();
    await command(page, 'help');
    for (const name of ['Close terminal', 'Run command']) {
      const button = dialog.getByRole('button', { name, exact: true });
      const bounds = await button.boundingBox();
      expect(bounds!.width).toBeGreaterThanOrEqual(44); expect(bounds!.height).toBeGreaterThanOrEqual(44);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    }
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(axe.violations.map((violation) => ({ id: violation.id, targets: violation.nodes.map((node) => node.target) }))).toEqual([]);
  });
}

test('320px terminal preserves readable reflow with enlarged text and extra spacing', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const adjustment of ['resize', 'spacing']) {
    const dialog = await openTerminal(page);
    await command(page, 'contact');
    if (adjustment === 'resize') {
      await dialog.evaluate((root) => {
        const elements = [root, ...root.querySelectorAll('*')].filter((element): element is HTMLElement => element instanceof HTMLElement);
        const sizes = elements.map((element) => ({ element, size: parseFloat(getComputedStyle(element).fontSize) }));
        sizes.forEach(({ element, size }) => element.style.setProperty('font-size', `${size * 2}px`, 'important'));
      });
    } else {
      await page.addStyleTag({ content: '.portfolio-terminal-modal * { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } .portfolio-terminal-modal p { margin-bottom: 2em !important; }' });
    }
    expect(await dialog.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
    const clipped = await dialog.evaluate((root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const failures: string[] = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent?.trim() || node.parentElement?.closest('[aria-hidden="true"], .portfolio-terminal-announcement')) continue;
        const range = document.createRange(); range.selectNode(node);
        for (const rect of range.getClientRects()) if (rect.width && (rect.left < 0 || rect.right > innerWidth)) failures.push(node.textContent!);
      }
      return failures;
    });
    expect(clipped).toEqual([]);
    for (const name of ['Close terminal', 'Run command']) {
      const button = dialog.getByRole('button', { name, exact: true });
      await expect(button).toBeVisible();
      const bounds = await button.boundingBox();
      expect(bounds!.y).toBeGreaterThanOrEqual(0);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(700);
    }
    await command(page, 'exit');
    await expect(page.getByRole('button', { name: 'Open Terminal', exact: true })).toBeFocused();
  }
});
