import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'small mobile', width: 320, height: 700 },
];

async function ready(page: Page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect.poll(() => page.locator('.hero-intro').evaluateAll((elements) => elements.every((element) => Number(getComputedStyle(element).opacity) > .999))).toBe(true);
}

async function assertReadable(page: Page, scope = '.portfolio-root') {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  // Check actual text rectangles, not just a document with overflow hidden.
  const clippedText = await page.locator(scope).evaluate((root) => {
    const failures: string[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const element = node.parentElement!;
      // Architecture images and the decorative marquee repeat semantic content elsewhere.
      if (!node.textContent?.trim() || element.closest('svg, [aria-hidden="true"], .tech-marquee') || !element.getClientRects().length || getComputedStyle(element).visibility === 'hidden') continue;
      const range = document.createRange();
      range.selectNode(node);
      for (const rect of range.getClientRects()) {
        if (rect.width && (rect.left < -1 || rect.right > innerWidth + 1)) failures.push(node.textContent.trim());
        let ancestor: HTMLElement | null = element;
        while (ancestor) {
          const style = getComputedStyle(ancestor);
          if (['hidden', 'clip'].includes(style.overflowX)) {
            const bounds = ancestor.getBoundingClientRect();
            if (rect.left < bounds.left - 1 || rect.right > bounds.right + 1) failures.push(node.textContent.trim());
          }
          ancestor = ancestor.parentElement;
        }
      }
    }
    return [...new Set(failures)];
  });
  expect(clippedText).toEqual([]);
  // The animated per-letter headline has a separate accessible name.
  const lettersFit = await page.locator('.hero-letter').evaluateAll((letters) => letters.every((letter) => {
    const rect = letter.getBoundingClientRect();
    const line = letter.closest('.hero-name-line')!.getBoundingClientRect();
    return rect.left >= line.left - 1 && rect.right <= line.right + 1;
  }));
  expect(lettersFit).toBe(true);
}

async function doubleText(page: Page, scope = 'body') {
  await page.locator(scope).evaluate((root) => {
    // Text-only enlargement, including px-sized text; do not silently rely on rem units.
    const elements = [root, ...root.querySelectorAll('*')].filter((element): element is HTMLElement => element instanceof HTMLElement);
    const sizes = elements.map((element) => ({ element, size: parseFloat(getComputedStyle(element).fontSize) }));
    sizes.forEach(({ element, size }) => element.style.setProperty('font-size', `${size * 2}px`, 'important'));
  });
}

async function assertSeparatePipelineNodes(page: Page) {
  const bounds = await page.locator('.pipeline-node').evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
  }));
  expect(bounds[0].right).toBeLessThan(bounds[1].left);
  expect(bounds[0].bottom).toBeLessThan(bounds[2].top);
  expect(bounds[1].bottom).toBeLessThan(bounds[3].top);
}

for (const viewport of viewports) {
  test(`${viewport.name}: interface labels, headline, and portrait remain readable`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await ready(page);
    await assertReadable(page);
    const minimumLabelSize = viewport.width <= 700 ? 13 : 12;
    for (const selector of ['.terminal-chrome', '.identity-command', '.hero-proof > span', '.project-meta', '.tags > span', '.architecture-top', '.toolkit-title small', '.lab-caption', '.pipeline-node small', '.terminal-lines', '.footer-note']) {
      const sizes = await page.locator(selector).evaluateAll((elements) => elements.map((element) => parseFloat(getComputedStyle(element).fontSize)));
      expect(sizes.length).toBeGreaterThan(0);
      expect(Math.min(...sizes), selector).toBeGreaterThanOrEqual(minimumLabelSize);
    }
    await assertSeparatePipelineNodes(page);
    if (viewport.width <= 700) {
      const photo = await page.locator('.hero-portrait-frame').boundingBox();
      for (const label of await page.locator('.hero-orbit-label').all()) {
        const bounds = await label.boundingBox();
        expect(bounds!.y).toBeGreaterThan(photo!.y + photo!.height);
      }
    }
    if (viewport.width <= 1000) {
      await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
      const navigation = page.getByRole('navigation');
      await expect(navigation).toBeVisible();
      await navigation.getByRole('link', { name: /Work/ }).click();
      await expect(navigation).toBeHidden();
    }
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(axe.violations.map((violation) => ({ id: violation.id, targets: violation.nodes.map((node) => node.target) }))).toEqual([]);
  });

  test(`${viewport.name}: 200% text and WCAG spacing preserve reflow and interactions`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const adjustment of ['resize', 'spacing']) {
      await ready(page);
      if (adjustment === 'resize') {
        const originalSize = await page.locator('.hero-description').evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
        await doubleText(page);
        expect(await page.locator('.hero-description').evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBe(originalSize * 2);
      } else {
        await page.addStyleTag({ content: '.portfolio-root * { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } .portfolio-root p { margin-bottom: 2em !important; }' });
      }
      await assertReadable(page);
      await assertSeparatePipelineNodes(page);
      await page.getByRole('button', { name: /Cloud & infrastructure/ }).click();
      await expect(page.locator('#tool-01')).toBeVisible();
      await page.getByRole('button', { name: 'Read Space Cargo case study', exact: true }).click();
      const dialog = page.getByRole('dialog', { name: 'Space Cargo case study' });
      if (adjustment === 'resize') await doubleText(page, 'dialog');
      await assertReadable(page, 'dialog');
      expect(await dialog.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
      await dialog.getByRole('link', { name: 'View full repository' }).scrollIntoViewIfNeeded();
      await expect(dialog.getByRole('link', { name: 'View full repository' })).toBeVisible();
      await page.keyboard.press('Escape');
      // Native dialog close events are asynchronous. Wait for the case study
      // to unmount and restore focus before issuing a different dialog shortcut.
      await expect(dialog).not.toBeAttached();
      await expect(page.getByRole('button', { name: 'Read Space Cargo case study', exact: true })).toBeFocused();
      await page.keyboard.press('Control+k');
      const search = page.getByRole('dialog', { name: 'Search this portfolio' });
      await expect(search).toBeVisible();
      if (adjustment === 'resize') await doubleText(page, 'dialog');
      await assertReadable(page, 'dialog');
      await search.getByRole('textbox').fill('contact');
      await search.getByRole('link', { name: 'Get in touch', exact: true }).click();
      await expect(page).toHaveURL(/#contact$/);
      await page.getByRole('button', { name: 'Run pipeline', exact: true }).click();
      await expect(page.getByText('RELEASE COMPLETE', { exact: true })).toBeVisible();
      await assertReadable(page, '.release-lab');
      expect(await page.locator('.terminal-lines').evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
    }
  });
}

for (const preference of ['reduce', 'no-preference'] as const) {
  test(`keyboard focus stays visible above sticky navigation with ${preference}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: preference });
    await page.setViewportSize({ width: 320, height: 700 });
    await ready(page);
    for (const selector of ['.project-visual-button', '.project-title-button', '.project-actions .project-documentation-link', '.toolkit-row-button', '.lab-bottomline button', '.contact-links button', '.back-to-top']) {
      const control = page.locator(selector).first();
      await control.focus();
      await page.keyboard.press('Tab');
      await page.keyboard.press('Shift+Tab');
      await expect(control).toBeFocused();
      await expect.poll(() => control.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const header = document.querySelector('.site-header')!.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return rect.top >= header.bottom + 4 && (element === hit || element.contains(hit));
      })).toBe(true);
      expect(await control.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid');
    }
    await page.keyboard.press('Control+k');
    const input = page.getByRole('textbox', { name: 'Search sections, projects, or tools' });
    await expect(input).toBeFocused();
    await expect(input).toHaveCSS('outline-style', 'solid');
  });
}

test('small mobile shows the complete contact address and command-search prompt', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await ready(page);
  const addressLines = await page.locator('.contact-email > span:last-child').evaluate((element) => {
    const range = document.createRange();
    range.selectNode(element.firstChild!);
    return Array.from(range.getClientRects()).filter((rect) => rect.width > 0).length;
  });
  expect(addressLines).toBe(1);
  await page.keyboard.press('Control+k');
  const promptFits = await page.getByRole('textbox', { name: 'Search sections, projects, or tools' }).evaluate((input: HTMLInputElement) => {
    const style = getComputedStyle(input);
    const context = document.createElement('canvas').getContext('2d')!;
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return context.measureText(input.placeholder).width <= input.clientWidth;
  });
  expect(promptFits).toBe(true);
});
