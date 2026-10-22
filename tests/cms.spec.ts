import { expect, test } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { build, preview } from 'vite';
import react from '@vitejs/plugin-react';
import { validateSnapshot, snapshotFromSanity, publishedQuery, loadPortfolio } from '../content/load.ts';
import { portfolioContentPlugin } from '../content/vite.ts';

async function seed() { return JSON.parse(await readFile('content/portfolio.json', 'utf8')); }

test('CMS migration preserves all existing project and professional content', async () => {
  const current = await seed();
  const checked = validateSnapshot(current);
  expect(JSON.parse(JSON.stringify(checked))).toEqual(current);
  expect(checked.projects).toHaveLength(3);
  expect(current.profile.photo.url).toBe('/assets/mahmoud.jpg');
  expect(current.profile.fullName).toBe('Mahmoud Metwally Ali');
});

test('published projection excludes drafts and deletion never merges seed projects back in', async () => {
  const current = await seed();
  expect(publishedQuery).toContain('!(_id in path("drafts.**"))');
  expect(snapshotFromSanity({ settings: { profile: current.profile }, projects: [] }).projects).toEqual([]);
  const project = { ...current.projects[1], documentation: current.documentation['space-cargo'] };
  const snapshot = snapshotFromSanity({ settings: { profile: current.profile }, projects: [project] });
  expect(snapshot.projects.map(item => item.id)).toEqual(['space-cargo']);
  expect(snapshot.projects[0].number).toBe('01');
  expect(() => snapshotFromSanity({ settings: null, projects: [] })).toThrow(/Publish the Profile/);
});

test('CMS build validation rejects unsafe links, duplicate slugs, broken documentation, and invalid domains', async () => {
  const current = await seed();
  for (const bad of ['javascript:alert(1)', 'data:text/html,test', '//example.com/image.jpg', '/\\example.com', 'https://user:password@example.com']) {
    const changed = structuredClone(current); changed.profile.photo.url = bad;
    expect(() => validateSnapshot(changed)).toThrow(/Content validation failed/);
  }
  const duplicate = structuredClone(current); duplicate.projects.push(duplicate.projects[0]);
  expect(() => validateSnapshot(duplicate)).toThrow(/must be unique/);
  const missing = structuredClone(current); delete missing.documentation['three-tier'];
  expect(() => validateSnapshot(missing)).toThrow();
  for (const domain of ['http://example.com', 'https://example.com/subpath', 'https://example.com/?token=secret']) {
    const changed = structuredClone(current); changed.profile.siteUrl = domain;
    expect(() => validateSnapshot(changed)).toThrow(/origin/);
  }
});

test('Sanity image URLs are resized without exposing credentials or private fields', async () => {
  const current = await seed();
  current.profile.photo.url = 'https://cdn.sanity.io/images/2mn6x81s/production/photo-460x460.jpg';
  current.profile.privateToken = 'must-not-ship';
  const project = { ...current.projects[0], image: { url: 'https://cdn.sanity.io/images/2mn6x81s/production/card-2000x1000.png', alt: 'Card' }, documentation: current.documentation['three-tier'], _private: 'must-not-ship' };
  const snapshot = snapshotFromSanity({ settings: { profile: current.profile }, projects: [project] });
  expect(JSON.stringify(snapshot)).not.toContain('must-not-ship');
  expect(JSON.stringify(snapshot)).toContain('w=960');
  expect(JSON.stringify(snapshot)).toContain('w=1400');
  expect(JSON.stringify(snapshot)).toContain('auto=format');
});

test('unconfigured CMS builds fail explicitly rather than silently publishing fallback content', async () => {
  await expect(loadPortfolio({ CONTENT_SOURCE: 'sanity' })).rejects.toThrow(/Set SANITY_PROJECT_ID/);
  await expect(loadPortfolio({ CONTENT_SOURCE: 'invalid' })).rejects.toThrow(/local or sanity/);
});

for (const variant of ['edited', 'empty', 'four-projects'] as const) {
  test(`CMS ${variant} content reaches homepage, documentation, search and terminal after a build`, async ({ page }) => {
    const data = await seed();
    data.profile.aboutParagraphs[0] = 'Updated biography from the content fixture.';
    data.profile.photo.url = '/assets/mahmoud.jpg?content-revision=2';
    if (variant === 'edited') {
      const added = { ...data.projects[0], id: 'pipeline-operations', title: 'Pipeline Operations', number: '02', filters: ['delivery'], image: { url: '/assets/mahmoud.jpg?card=2', alt: 'Uploaded project card fixture' } };
      data.projects = [{ ...data.projects[1], number: '01' }, added];
      data.documentation = { 'space-cargo': data.documentation['space-cargo'], 'pipeline-operations': { ...data.documentation['three-tier'], subtitle: 'Updated documentation fixture' } };
    } else if (variant === 'empty') { data.projects = []; data.documentation = {}; }
    else {
      const added = { ...data.projects[0], id: 'fourth-project', title: 'Fourth Project', number: '04', graphic: 'three-tier' };
      data.projects.push(added); data.documentation['fourth-project'] = data.documentation['three-tier'];
    }
    const directory = `.artifacts/cms-review/fixtures/${variant}`;
    await mkdir(directory, { recursive: true });
    const file = `${directory}/content.json`; await writeFile(file, JSON.stringify(data));
    const plugin = await portfolioContentPlugin({ PORTFOLIO_CONTENT_FILE: file });
    await build({ configFile: false, logLevel: 'silent', plugins: [react(), plugin], build: { outDir: `${directory}/dist`, emptyOutDir: false } });
    const server = await preview({ configFile: false, build: { outDir: `${directory}/dist` }, preview: { port: 0, host: '127.0.0.1' } });
    try {
      const address = server.httpServer.address(); if (!address || typeof address === 'string') throw new Error('Missing preview address');
      const origin = `http://127.0.0.1:${address.port}`;
      const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
      await page.goto(origin); await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('.hero-portrait-frame img')).toHaveAttribute('src', data.profile.photo.url);
      await expect(page.locator('.about-intro')).toHaveText(data.profile.aboutParagraphs[0]);
      await expect(page.locator('.project-card')).toHaveCount(data.projects.length);
      await expect(page.getByRole('group', { name: 'Filter projects' }).getByRole('button', { name: /^All work/ }).locator('sup')).toHaveText(String(data.projects.length).padStart(2, '0'));
      if (variant === 'edited') {
        await expect(page.locator('.project-title-button h3')).toHaveText(['Space Cargo', 'Pipeline Operations']);
        await expect(page.getByAltText('Uploaded project card fixture')).toBeVisible();
        await page.keyboard.press('Control+k'); await page.getByRole('textbox').fill('Pipeline Operations');
        await page.getByRole('dialog').getByRole('button', { name: /Pipeline Operations/ }).click();
        await expect(page).toHaveURL(`${origin}/projects/pipeline-operations`);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pipeline Operations');
        await expect(page.locator('.doc-subtitle')).toHaveText('Updated documentation fixture');
        const sitemap = await readFile(`${directory}/dist/sitemap.xml`, 'utf8'); expect(sitemap).toContain('pipeline-operations'); expect(sitemap).not.toContain('/projects/three-tier');
        const response = await page.request.get(`${origin}/projects/pipeline-operations`); expect(await response.text()).toContain('Pipeline Operations — Engineering documentation');
      } else {
        await page.getByRole('button', { name: 'Open Terminal', exact: true }).click();
        const input = page.getByRole('textbox', { name: 'Terminal command' });
        if (variant === 'four-projects') { await input.fill('open project 4'); await input.press('Enter'); await expect(page).toHaveURL(`${origin}/projects/fourth-project`); await expect(page.getByRole('heading', { level: 1, name: 'Fourth Project', exact: true })).toBeVisible(); }
        else { await input.fill('open project 1'); await input.press('Enter'); await expect(page.locator('.portfolio-terminal-entry').last()).toContainText('There are no projects to open yet.'); await page.keyboard.press('Escape'); await expect(page.locator('.projects-empty')).toBeVisible(); }
      }
      expect(errors).toEqual([]);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.httpServer.close(error => error ? reject(error) : resolve());
        // Assertions have finished. Browser keep-alive connections must not
        // hold an isolated fixture server open until the test times out.
        if ('closeAllConnections' in server.httpServer) server.httpServer.closeAllConnections();
      });
    }
  });
}
