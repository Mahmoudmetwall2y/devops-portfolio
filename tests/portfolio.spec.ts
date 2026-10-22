import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const titles = ['3-Tier User Platform', 'Space Cargo', 'Ultimate DevOps'];
const github = 'https://github.com/Mahmoudmetwall2y';
const linkedin = 'https://www.linkedin.com/in/mahmoudmetwall2y';

async function ready(page: Page) {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect.poll(() => page.locator('.hero-letter').evaluateAll((elements) => elements.every((element) => Math.abs(new DOMMatrix(getComputedStyle(element).transform).m42) < .1))).toBe(true);
  await expect.poll(() => page.locator('.hero-intro').evaluateAll((elements) => elements.every((element) => Number(getComputedStyle(element).opacity) > .999))).toBe(true);
}

async function accessible(page: Page) {
  const dialog = page.locator('dialog[open]');
  if (await dialog.count()) await expect(dialog).toHaveCSS('opacity', '1');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  await test.info().attach('axe-results', { body: JSON.stringify(results, null, 2), contentType: 'application/json' });
  const violations = results.violations.map((violation) => ({
    id: violation.id,
    nodes: violation.nodes.map((node) => ({ selector: node.target.join(' '), problem: node.failureSummary })),
  }));
  expect(violations).toEqual([]);
}

test('release lab completes every stage and can run again without browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await ready(page);
  const run = page.getByRole('button', { name: 'Run pipeline', exact: true });
  await run.click();
  await expect(page.getByRole('button', { name: 'Running', exact: true })).toBeDisabled();
  await expect(page.locator('.pipeline-node.is-active')).toContainText('Commit');
  for (const next of ['Build', 'Deploy', 'Observe']) {
    await expect(page.locator('.pipeline-node.is-active')).toContainText(next);
  }
  await expect(page.locator('.pipeline-node.is-complete')).toHaveCount(4);
  await expect(page.getByText('RELEASE COMPLETE', { exact: true })).toBeVisible();
  await expect(page.locator('.terminal-lines')).toContainText('Metrics connected. Ready for the next change.');
  await page.getByRole('button', { name: 'Run again', exact: true }).click();
  await expect(page.locator('.pipeline-node.is-complete')).toHaveCount(0);
  await expect(page.locator('.pipeline-node.is-active')).toContainText('Commit');
  await expect(page.getByText('RELEASE COMPLETE', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

for (const title of titles) {
  test(`${title} case study opens, traps focus, and returns focus on Escape`, async ({ page }) => {
    await ready(page);
    const trigger = page.getByRole('button', { name: `Read ${title} case study`, exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: `${title} case study`, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(dialog.getByText('THE CHALLENGE', { exact: true })).toBeVisible();
    await expect(dialog.getByText('THE APPROACH', { exact: true })).toBeVisible();
    const close = dialog.getByRole('button', { name: 'Close case study', exact: true });
    await expect(close).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    // A scrollable native dialog can itself be a browser-provided focus stop.
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.getByRole('button', { name: 'Close case study', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
  });
}

test('project filters show the relevant projects and retain an accurate selected state', async ({ page }) => {
  await ready(page);
  await page.locator('#work').scrollIntoViewIfNeeded();
  const cards = page.locator('#work article');
  await expect(cards).toHaveCount(3);
  const filters = page.getByRole('group', { name: 'Filter projects' });
  const cloud = filters.getByRole('button', { name: /^Cloud/ });
  await cloud.click();
  await expect(cloud).toHaveAttribute('aria-pressed', 'true');
  await expect(cards).toHaveCount(2);
  await expect(cards.getByRole('heading', { level: 3 })).toHaveText(['3-Tier User Platform', 'Space Cargo']);
  const delivery = filters.getByRole('button', { name: /^Delivery/ });
  await delivery.click();
  await expect(cloud).toHaveAttribute('aria-pressed', 'false');
  await expect(delivery).toHaveAttribute('aria-pressed', 'true');
  await expect(cards.getByRole('heading', { level: 3 })).toHaveText(['3-Tier User Platform', 'Ultimate DevOps']);
  await filters.getByRole('button', { name: /^All work/ }).click();
  await expect(cards).toHaveCount(3);
});

test('Control+K search handles empty results, section navigation, and project opening', async ({ page }) => {
  await ready(page);
  await page.keyboard.press('Control+k');
  const search = page.getByRole('dialog', { name: 'Search this portfolio', exact: true });
  const input = search.getByRole('textbox', { name: 'Search sections, projects, or tools' });
  await expect(input).toBeFocused();
  await input.fill('xyz-no-result-789');
  await expect(search.getByText(/No matches for/)).toBeVisible();
  await expect(search.getByRole('button', { name: /Space Cargo/ })).toHaveCount(0);
  await input.fill('contact');
  await search.getByRole('link', { name: 'Get in touch', exact: true }).click();
  await expect(search).not.toBeVisible();
  await expect(page).toHaveURL(/#contact$/);
  await page.keyboard.press('Control+k');
  await input.fill('kubernetes');
  await expect(search.getByRole('button', { name: /Space Cargo/ })).toBeVisible();
  await expect(search.getByRole('button', { name: /3-Tier User Platform/ })).toBeVisible();
  await search.getByRole('button', { name: /Space Cargo/ }).click();
  await expect(search).not.toBeVisible();
  await expect(page.getByRole('dialog', { name: 'Space Cargo case study' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('toolkit layers expand, replace the previous layer, and collapse', async ({ page }) => {
  await ready(page);
  const cloud = page.getByRole('button', { name: /Cloud & infrastructure/ });
  const containers = page.getByRole('button', { name: /Containers & orchestration/ });
  await expect(cloud).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#tool-01')).toBeHidden();
  await cloud.click();
  await expect(cloud).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#tool-01')).toBeVisible();
  await containers.click();
  await expect(cloud).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#tool-01')).toBeHidden();
  await expect(page.locator('#tool-02')).toBeVisible();
  await containers.click();
  await expect(containers).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#tool-02')).toBeHidden();
});

test('profile, repository, and contact links point to the intended destinations', async ({ page }) => {
  await ready(page);
  await expect(page.getByRole('link', { name: 'GitHub', exact: true })).toHaveCount(2);
  for (const link of await page.getByRole('link', { name: 'GitHub', exact: true }).all()) {
    await expect(link).toHaveAttribute('href', github);
    await expect(link).toHaveAttribute('target', '_blank');
  }
  await expect(page.getByRole('link', { name: 'LinkedIn', exact: true })).toHaveAttribute('href', linkedin);
  await page.locator('#about').scrollIntoViewIfNeeded();
  await expect(page.getByRole('link', { name: /The professional side of me/ })).toHaveAttribute('href', linkedin);
  await expect(page.locator('.contact-email')).toHaveAttribute('href', 'mailto:mahmoudmetwall2y@gmail.com');
  const repos = [
    `${github}/3-Tier-Application`,
    `${github}/DEPI-Graduation-Project-`,
    `${github}/ultimate-devops-project-demo`,
  ];
  for (let index = 0; index < titles.length; index += 1) {
    await expect(page.getByRole('link', { name: `${titles[index]} on GitHub`, exact: true })).toHaveAttribute('href', repos[index]);
    await page.getByRole('button', { name: `Read ${titles[index]} case study`, exact: true }).click();
    const dialog = page.getByRole('dialog', { name: `${titles[index]} case study` });
    await expect(dialog.getByRole('link', { name: 'View full repository' })).toHaveAttribute('href', repos[index]);
    const evidence = await dialog.locator('.evidence-list a').evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));
    expect(evidence.length).toBeGreaterThanOrEqual(3);
    expect(evidence.every((url) => {
      const path = url.slice(repos[index].length);
      return path.startsWith('/blob/main/') || path.startsWith('/commit/') || path.startsWith('/actions/runs/');
    })).toBe(true);
    await page.keyboard.press('Escape');
  }
});

test('copy email gives visitors a usable address and confirmation', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await ready(page);
  await page.getByRole('button', { name: 'Copy email', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Email copied', exact: true })).toBeVisible();
  await expect(page.getByText('Ready to paste wherever you like.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('mahmoudmetwall2y@gmail.com');
});

for (const preference of ['reduce', 'no-preference'] as const) {
for (const width of [320, 390, 768, 1440]) {
  test(`layout and case study stay within a ${width}px viewport with ${preference}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: preference });
    await page.setViewportSize({ width, height: 900 });
    await ready(page);
    const pageWidth = await page.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth));
    expect(pageWidth).toBeLessThanOrEqual(width + 1);
    for (const section of ['#work', '#about', '#experience', '#toolkit', '#contact']) {
      await page.locator(section).scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    }
    await page.getByRole('button', { name: 'Read Space Cargo case study', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Space Cargo case study' });
    await expect(dialog).toBeVisible();
    const bounds = await dialog.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 1);
    const innerOverflow = await dialog.evaluate((element) => element.scrollWidth - element.clientWidth);
    expect(innerOverflow).toBeLessThanOrEqual(1);
  });
}
}

test('mobile navigation opens, closes on selection, and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  const open = page.getByRole('button', { name: 'Open navigation', exact: true });
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(nav).toBeHidden();
  await open.click();
  const close = page.getByRole('button', { name: 'Close navigation', exact: true });
  await expect(close).toHaveAttribute('aria-expanded', 'true');
  const controlledId = await close.getAttribute('aria-controls');
  await expect(nav).toHaveAttribute('id', controlledId!);
  await nav.getByRole('link', { name: /Toolkit/ }).click();
  await expect(page).toHaveURL(/#toolkit$/);
  await expect(nav).toBeHidden();
  await open.click();
  await page.keyboard.press('Escape');
  await expect(nav).toBeHidden();
  await expect(open).toHaveAttribute('aria-expanded', 'false');
});

test('page meets WCAG AA automated accessibility checks', async ({ page }) => {
  await ready(page);
  await accessible(page);
  await page.locator('#about').scrollIntoViewIfNeeded();
  await expect(page.locator('.site-header')).toHaveClass(/header-light/);
  await expect.poll(() => page.locator('.about-copy').evaluate((element) => Number(getComputedStyle(element).opacity))).toBe(1);
  await accessible(page);
});

test('CV experience is presented and the original PDF can be downloaded', async ({ page }) => {
  await ready(page);
  const experience = page.locator('#experience');
  await experience.scrollIntoViewIfNeeded();
  await expect(experience.getByRole('heading', { name: 'Easytravel', exact: true })).toBeVisible();
  await expect(experience).toContainText('Apr 2026 — Present');
  await expect(experience).toContainText('Seven Ubuntu servers');
  await expect(experience).toContainText('approximately ten C# microservices');
  await expect(experience).toContainText('BNS University');
  await expect(experience).toContainText('eight-member team');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download CV', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('Mahmoud-Metwally-CV.pdf');
  expect(await download.failure()).toBeNull();
  const response = await page.request.get('/assets/mahmoud-metwally-cv.pdf');
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toContain('application/pdf');
  const bytes = await response.body();
  expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
  expect(bytes.length).toBeGreaterThan(50_000);
});

test('case-study dialog meets WCAG AA automated accessibility checks', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: 'Read Space Cargo case study', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Space Cargo case study' })).toBeVisible();
  await accessible(page);
});

test('search dialog meets WCAG AA automated accessibility checks', async ({ page }) => {
  await ready(page);
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog', { name: 'Search this portfolio' })).toBeVisible();
  await accessible(page);
});


async function scrollTriggers(page: Page) {
  return page.evaluate(async () => {
    // Import the same Vite module used by the app, without adding a production test API.
    const url = performance.getEntriesByType('resource').map((entry) => entry.name)
      .find((name) => /\/gsap_ScrollTrigger\.js(?:\?|$)/.test(name));
    if (!url) throw new Error('The app ScrollTrigger module was not loaded');
    const { ScrollTrigger } = await import(url);
    const triggers: { vars: { id?: string }; trigger?: Element }[] = ScrollTrigger.getAll();
    return triggers.map((trigger) => ({ id: trigger.vars.id ?? '', connected: Boolean(trigger.trigger?.isConnected) }))
      .sort((a, b) => a.id.localeCompare(b.id));
  });
}

async function settledIntro(page: Page) {
  await expect.poll(() => page.locator('.hero-letter').evaluateAll((elements) => elements.every((element) => Math.abs(new DOMMatrix(getComputedStyle(element).transform).m42) < .1))).toBe(true);
  await expect.poll(() => page.locator('.hero-intro').evaluateAll((elements) => elements.every((element) => Number(getComputedStyle(element).opacity) > .999))).toBe(true);
}

test('normal motion keeps entrances, decorative motion, scroll parallax, and Replay Intro', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => sessionStorage.setItem('portfolio-motion', 'off'));
  await page.goto('/');
  const letters = page.locator('.hero-letter');
  await expect(letters).toHaveCount(16);
  await expect.poll(() => letters.evaluateAll((elements) => elements.some((element) => Math.abs(new DOMMatrix(getComputedStyle(element).transform).m42) > 1))).toBe(true);
  await expect(page.getByRole('button', { name: /^(Pause|Play) animations$/ })).toHaveCount(0);
  const marquee = page.locator('.marquee-track');
  const start = await marquee.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41);
  await expect.poll(() => marquee.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41)).toBeLessThan(start - 5);
  const orbit = page.locator('.signal-ring-orbit').first();
  const initialOrbit = await orbit.evaluate((element) => getComputedStyle(element).transform);
  await expect.poll(() => orbit.evaluate((element) => getComputedStyle(element).transform)).not.toBe(initialOrbit);
  expect(await page.locator('.architecture-art').evaluateAll((elements) => elements.every((element) => !(element as SVGSVGElement).animationsPaused()))).toBe(true);
  await settledIntro(page);
  const persistent = (await scrollTriggers(page)).filter((trigger) => !trigger.id.startsWith('portfolio-reveal-'));
  for (let replay = 0; replay < 2; replay += 1) {
    await page.getByRole('button', { name: 'Replay intro', exact: true }).click();
    await expect.poll(() => letters.evaluateAll((elements) => elements.some((element) => Math.abs(new DOMMatrix(getComputedStyle(element).transform).m42) > 1))).toBe(true);
    expect((await scrollTriggers(page)).filter((trigger) => !trigger.id.startsWith('portfolio-reveal-'))).toEqual(persistent);
    await settledIntro(page);
  }
  await page.evaluate(() => window.scrollTo({ top: 250, behavior: 'instant' }));
  await expect.poll(() => page.locator('.hero-portrait-parallax').evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m42)).toBeLessThan(-1);
});

test('reduced motion keeps content static, visible, and usable including newly mounted diagrams', async ({ page }) => {
  await ready(page);
  await expect(page.locator('.portfolio-root')).toHaveClass(/motion-reduced/);
  expect(await scrollTriggers(page)).toEqual([]);
  expect(await page.locator('[data-reveal], .hero-intro, .hero-letter').evaluateAll((elements) => elements.every((element) => {
    const style = getComputedStyle(element);
    return style.visibility === 'visible' && Number(style.opacity) === 1 && Math.abs(new DOMMatrix(style.transform).m42) < .1;
  }))).toBe(true);
  const decorative = page.locator('.marquee-track, .signal-ring-orbit, .hero-orbit-label, .portrait-halo, .hero-atmosphere i, .orbit-type, .identity-command i');
  const snapshot = () => decorative.evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    return { transform: style.transform, translate: style.translate, opacity: style.opacity, animation: style.animationName };
  }));
  const initial = await snapshot();
  expect(initial.every((style) => style.animation === 'none')).toBe(true);
  // An interval comparison catches loops accidentally left active by CSS or SVG.
  await page.waitForTimeout(350);
  expect(await snapshot()).toEqual(initial);
  const explore = page.getByRole('link', { name: 'Explore my work', exact: true });
  await explore.hover();
  await expect(page.locator('.motion-cursor')).toBeHidden();
  expect(await explore.evaluate((element) => element.style.getPropertyValue('--magnet-x'))).toBe('');
  await expect(page.getByRole('button', { name: 'Replay intro', exact: true })).toBeDisabled();
  await page.evaluate(() => {
    window.scrollTo({ top: 250, behavior: 'instant' });
    (document.querySelector('.replay-intro') as HTMLButtonElement).click();
  });
  expect(await page.evaluate(() => window.scrollY)).toBe(250);
  await expect(page.locator('.hero-portrait-parallax')).toHaveCSS('transform', 'none');
  const filters = page.getByRole('group', { name: 'Filter projects' });
  await filters.getByRole('button', { name: /^Cloud/ }).click();
  await filters.getByRole('button', { name: /^Delivery/ }).click();
  await page.getByRole('button', { name: 'Read Ultimate DevOps case study', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toHaveCSS('animation-name', 'none');
  expect(await page.locator('.architecture-art').evaluateAll((elements) => elements.every((element) => (element as SVGSVGElement).animationsPaused()))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  expect(await scrollTriggers(page)).toEqual([]);
});

test('live preference changes and filtering clean up ScrollTriggers without duplicates or stale cards', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await ready(page);
  const baseline = (await scrollTriggers(page)).filter((trigger) => !trigger.id.startsWith('portfolio-reveal-'));
  expect(baseline).toHaveLength(8);
  for (let cycle = 0; cycle < 2; cycle += 1) {
    // Normal-motion reveals become accessible after their section enters view.
    await page.locator('#work').scrollIntoViewIfNeeded();
    const filters = page.getByRole('group', { name: 'Filter projects' });
    for (const name of [/^Cloud/, /^Delivery/, /^All work/]) {
      await filters.getByRole('button', { name }).click();
      const triggers = await scrollTriggers(page);
      expect(triggers.every((trigger) => trigger.connected)).toBe(true);
      expect(new Set(triggers.map((trigger) => trigger.id)).size).toBe(triggers.length);
      const expectedCards = name.source.includes('All') ? 3 : 2;
      expect(triggers.filter((trigger) => trigger.id.startsWith('portfolio-art-'))).toHaveLength(expectedCards);
      expect(triggers.filter((trigger) => trigger.id.startsWith('portfolio-card-'))).toHaveLength(expectedCards - 1);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.portfolio-root')).toHaveClass(/motion-reduced/);
    await expect.poll(() => scrollTriggers(page)).toEqual([]);
    await expect(page.locator('.marquee-track')).toHaveCSS('animation-name', 'none');
    await expect(page.getByRole('button', { name: 'Replay intro', exact: true })).toBeDisabled();
    expect(await page.locator('.architecture-art').evaluateAll((elements) => elements.every((element) => (element as SVGSVGElement).animationsPaused()))).toBe(true);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('.portfolio-root')).toHaveClass(/motion-enabled/);
    await settledIntro(page);
    expect((await scrollTriggers(page)).filter((trigger) => !trigger.id.startsWith('portfolio-reveal-'))).toEqual(baseline);
    await expect(page.locator('.marquee-track')).toHaveCSS('animation-name', 'marquee');
    await expect(page.getByRole('button', { name: 'Replay intro', exact: true })).toBeEnabled();
    expect(await page.locator('.architecture-art').evaluateAll((elements) => elements.every((element) => !(element as SVGSVGElement).animationsPaused()))).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(async () => (await scrollTriggers(page)).filter((trigger) => trigger.id.startsWith('portfolio-card-')).length).toBe(0);
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect.poll(async () => (await scrollTriggers(page)).filter((trigger) => trigger.id.startsWith('portfolio-card-')).length).toBe(2);
  expect(errors).toEqual([]);
});

test('cursor settles without idle style updates and stops on reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await ready(page);
  await page.evaluate(() => {
    const element = document.querySelector('.motion-cursor')!;
    element.setAttribute('data-style-writes', '0');
    new MutationObserver((records) => {
      element.setAttribute('data-style-writes', String(Number(element.getAttribute('data-style-writes')) + records.length));
    }).observe(element, { attributes: true, attributeFilter: ['style'] });
  });
  await page.mouse.move(20, 300);
  await expect(page.locator('.motion-cursor')).toHaveClass(/cursor-visible/);
  await page.mouse.move(400, 300);
  await expect.poll(() => page.locator('.motion-cursor').evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).m41)).toBe(400);
  const writes = await page.locator('.motion-cursor').getAttribute('data-style-writes');
  await page.waitForTimeout(200);
  expect(await page.locator('.motion-cursor').getAttribute('data-style-writes')).toBe(writes);
  const explore = page.getByRole('link', { name: 'Explore my work', exact: true });
  await explore.hover({ position: { x: 20, y: 20 } });
  await expect.poll(() => explore.evaluate((element) => element.style.getPropertyValue('--magnet-x'))).not.toBe('');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.motion-cursor')).toBeHidden();
  await expect.poll(() => explore.evaluate((element) => element.style.getPropertyValue('--magnet-x'))).toBe('');
  const reducedWrites = await page.locator('.motion-cursor').getAttribute('data-style-writes');
  await page.mouse.move(600, 400);
  await page.waitForTimeout(200);
  expect(await page.locator('.motion-cursor').getAttribute('data-style-writes')).toBe(reducedWrites);
});

test('normal motion preserves navigation, search, dialogs, toolkit, and the release demo', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  await ready(page);
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await page.getByRole('navigation').getByRole('link', { name: /Toolkit/ }).click();
  await expect(page.getByRole('navigation')).toBeHidden();
  await expect(page).toHaveURL(/#toolkit$/);
  await page.getByRole('button', { name: /Cloud & infrastructure/ }).click();
  await expect(page.locator('#tool-01')).toBeVisible();
  await page.keyboard.press('Control+k');
  const search = page.getByRole('dialog', { name: 'Search this portfolio' });
  await search.getByRole('textbox').fill('ultimate');
  await search.getByRole('button', { name: /Ultimate DevOps/ }).click();
  await expect(page.getByRole('dialog', { name: 'Ultimate DevOps case study' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Run pipeline', exact: true }).click();
  await expect(page.getByText('RELEASE COMPLETE', { exact: true })).toBeVisible();
  await expect(page.locator('.pipeline-node.is-complete')).toHaveCount(4);
});
