import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { build, preview } from 'vite';

const projects = [
  { id: 'three-tier', title: '3-Tier User Platform', revision: 'bc58f64225a42d68049280efaf2f82c854d837fd', repo: '3-Tier-Application' },
  { id: 'space-cargo', title: 'Space Cargo', revision: 'efa13ecd127257130c6aca4d5410ae750e164d5a', repo: 'DEPI-Graduation-Project-' },
  { id: 'ultimate-devops', title: 'Ultimate DevOps', revision: 'c9f81edab0792575062681e6f4895536bba492d2', repo: 'ultimate-devops-project-demo' },
];
const headings = ['Project overview', 'Architecture', 'Engineering challenge', 'My implementation', 'Engineering decisions', 'Delivery workflow', 'Security and reliability', 'Observability', 'Repository guide', 'Environment and prerequisites', 'Implementation walkthrough', 'Validation commands', 'Troubleshooting', 'Verification and evidence', 'Engineering lessons', 'Next improvements'];

async function noClipping(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
  const clipped = await page.locator('body').evaluate(root => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), failures: string[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode, element = node.parentElement!;
      if (!node.textContent?.trim() || element.closest('svg, [aria-hidden="true"]') || !element.getClientRects().length || getComputedStyle(element).visibility === 'hidden') continue;
      const range = document.createRange(); range.selectNode(node);
      for (const bounds of range.getClientRects()) if (bounds.width && (bounds.left < -1 || bounds.right > innerWidth + 1)) failures.push(node.textContent.trim());
    }
    return [...new Set(failures)];
  });
  expect(clipped).toEqual([]);
}

for (const project of projects) for (const preference of ['reduce', 'no-preference'] as const) for (const width of [1440, 390, 320]) {
  test(`${project.title}: dedicated documentation ${width}px ${preference}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await page.emulateMedia({ reducedMotion: preference });
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/projects/${project.id}`);
    await expect(page.getByRole('heading', { level: 1, name: project.title, exact: true })).toBeVisible();
    await expect(page.locator('.doc-masthead')).toHaveCSS('opacity', '1');
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveTitle(`${project.title} — Engineering documentation | Mahmoud Metwally`);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://mahmoudmetwall2y.tech/projects/${project.id}`);
    await expect(page.getByRole('article')).toHaveAccessibleName(`${project.title} documentation`);
    for (const heading of headings) await expect(page.getByRole('heading', { level: 2, name: heading, exact: true })).toHaveCount(1);
    await expect(page.getByRole('figure')).toHaveAccessibleName(/SIMPLIFIED CONFIGURATION VIEW/);
    expect(await page.locator('.doc-repository a').count()).toBeGreaterThanOrEqual(6);
    const links = await page.locator('.doc-repository a, .doc-source').evaluateAll(elements => elements.map(element => element.getAttribute('href')));
    expect(links.every(link => link?.startsWith(`https://github.com/Mahmoudmetwall2y/${project.repo}/`) && link.includes(project.revision))).toBe(true);
    if (width < 1100) await page.locator('.doc-contents summary').click();
    await expect(page.getByRole('navigation', { name: 'Documentation contents' })).toBeVisible();
    const validation = page.getByRole('navigation', { name: 'Documentation contents' }).getByRole('link', { name: 'Validation commands', exact: true });
    await validation.focus(); await page.keyboard.press('Enter');
    const target = page.getByRole('heading', { name: 'Validation commands', exact: true });
    await expect(target).toBeFocused();
    await expect.poll(() => target.evaluate(element => element.getBoundingClientRect().top >= document.querySelector('.doc-header')!.getBoundingClientRect().bottom - 1)).toBe(true);
    await expect(page).toHaveURL(new RegExp(`#doc-${project.id}-validation$`));
    await expect(page.locator('.doc-command pre')).toHaveCount(3);
    await noClipping(page);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(axe.violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) }))).toEqual([]);
    if (preference === 'reduce') await expect(page.locator('.doc-masthead')).toHaveCSS('animation-name', 'none');
    else await expect(page.locator('.doc-masthead')).toHaveCSS('animation-name', 'documentation-enter');
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Validation commands', exact: true })).toBeInViewport();
    await page.getByRole('navigation', { name: 'Continue reading' }).getByRole('link', { name: 'Back to projects', exact: true }).click();
    await expect(page).toHaveURL('/#work'); await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Mahmoud Metwally');
    expect(errors).toEqual([]);
  });
}

test('every project card opens its dedicated documentation article', async ({ page }) => {
  for (const project of projects) {
    await page.goto('/');
    const card = page.locator('.project-card').filter({ has: page.getByRole('heading', { name: project.title, exact: true }) });
    await expect(card.getByRole('link', { name: 'Read documentation' })).toHaveAttribute('href', `/projects/${project.id}`);
    await expect(card.getByRole('link', { name: `Read ${project.title} documentation`, exact: true })).toHaveAttribute('href', `/projects/${project.id}`);
    await card.getByRole('link', { name: project.title, exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: project.title, exact: true })).toBeVisible();
    await expect(page).toHaveURL(`/projects/${project.id}`);
  }
});

test('article commands copy exact text and do not execute network or infrastructure actions', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/projects/space-cargo');
  const block = page.locator('.doc-command').first();
  const expected = await block.locator('code').innerText();
  const requests: string[] = []; page.on('request', request => { if (['fetch', 'xhr'].includes(request.resourceType())) requests.push(request.url()); });
  await block.getByRole('button').click();
  await expect(block.getByRole('status')).toHaveText('Commands copied to clipboard.');
  // Windows clipboard text uses CRLF; preserve commands while comparing line endings consistently.
  expect((await page.evaluate(() => navigator.clipboard.readText())).replaceAll('\r\n', '\n')).toBe(expected);
  expect(requests).toEqual([]);
});

test('article command copy failure leaves a readable manual-copy fallback', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('Clipboard unavailable')) } }));
  await page.goto('/projects/three-tier');
  const block = page.locator('.doc-command').first();
  await block.getByRole('button').click();
  await expect(block.getByRole('status')).toHaveText('Copy unavailable. Select and copy the commands above.');
  await expect(block.locator('code')).toContainText('git show HEAD:Dockerfile');
});

test('320px articles reflow with 200% text and WCAG text spacing', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const project of projects) for (const adjustment of ['resize', 'spacing']) {
    await page.goto(`/projects/${project.id}`); await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    if (adjustment === 'resize') await page.locator('.project-documentation').evaluate(root => {
      const elements = [root, ...root.querySelectorAll('*')].filter((element): element is HTMLElement => element instanceof HTMLElement);
      const sizes = elements.map(element => ({ element, size: parseFloat(getComputedStyle(element).fontSize) }));
      sizes.forEach(({ element, size }) => element.style.setProperty('font-size', `${size * 2}px`, 'important'));
    });
    else await page.addStyleTag({ content: '.project-documentation * {line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}.project-documentation p{margin-bottom:2em!important}' });
    await noClipping(page);
    await page.locator('.doc-contents summary').click();
    await page.getByRole('navigation', { name: 'Documentation contents' }).getByRole('link', { name: 'Verification and evidence', exact: true }).click();
    const heading = page.getByRole('heading', { name: 'Verification and evidence', exact: true });
    await expect(heading).toBeFocused();
    expect(await heading.evaluate(element => element.getBoundingClientRect().top >= document.querySelector('.doc-header')!.getBoundingClientRect().bottom - 1)).toBe(true);
    await noClipping(page);
  }
});

test('direct article fragments, next-project navigation, browser history, and unknown projects', async ({ page }) => {
  await page.goto('/projects/three-tier#doc-three-tier-evidence');
  await expect(page.getByRole('heading', { name: 'Verification and evidence', exact: true })).toBeInViewport();
  await page.getByRole('navigation', { name: 'Continue reading' }).getByRole('link', { name: /Next project/ }).click();
  await expect(page).toHaveURL('/projects/space-cargo');
  await page.goBack(); await expect(page).toHaveURL('/projects/three-tier#doc-three-tier-evidence');
  await page.goto('/projects/missing-project');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This project isn’t here.');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await page.getByRole('link', { name: 'Back to projects' }).click(); await expect(page).toHaveURL('/#work');
});

test('production output has project-specific static sharing metadata and hosting fallbacks', async () => {
  const output = '.artifacts/project-pages/build-check';
  await build({ logLevel: 'silent', build: { outDir: output, emptyOutDir: false } });
  for (const project of projects) {
    const html = await readFile(`${output}/projects/${project.id}.html`, 'utf8');
    expect(html).toContain(`<title>${project.title} — Engineering documentation | Mahmoud Metwally</title>`);
    expect(html).toContain(`property="og:url" content="https://mahmoudmetwall2y.tech/projects/${project.id}"`);
    expect(html).toContain('property="og:type" content="article"');
  }
  expect(await readFile(`${output}/_redirects`, 'utf8')).toContain('/projects/* /index.html 200');
  const config = JSON.parse(await readFile('vercel.json', 'utf8'));
  expect(config.cleanUrls).toBe(true);
  expect(config.rewrites).toContainEqual({ source: '/projects/:path*', destination: '/' });
  const server = await preview({ configFile: false, build: { outDir: output }, preview: { port: 0, host: '127.0.0.1' } });
  try {
    const address = server.httpServer.address();
    if (!address || typeof address === 'string') throw new Error('Missing preview address');
    for (const project of projects) {
      const response = await fetch(`http://127.0.0.1:${address.port}/projects/${project.id}`);
      expect(response.status).toBe(200);
      expect(await response.text()).toContain(`property="og:url" content="https://mahmoudmetwall2y.tech/projects/${project.id}"`);
    }
  } finally { await new Promise<void>((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve())); }
});
