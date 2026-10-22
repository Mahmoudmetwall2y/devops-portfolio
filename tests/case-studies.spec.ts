import { expect, test } from '@playwright/test';

const cases = [
  { title: '3-Tier User Platform', id: 'three-tier', repo: '3-Tier-Application', revision: 'bc58f64225a42d68049280efaf2f82c854d837fd', status: 'Pipeline execution recorded' },
  { title: 'Space Cargo', id: 'space-cargo', repo: 'DEPI-Graduation-Project-', revision: 'efa13ecd127257130c6aca4d5410ae750e164d5a', status: 'CI execution verified' },
  { title: 'Ultimate DevOps', id: 'ultimate-devops', repo: 'ultimate-devops-project-demo', revision: 'c9f81edab0792575062681e6f4895536bba492d2', status: 'Configuration reviewed' },
];

for (const project of cases) {
  for (const preference of ['reduce', 'no-preference'] as const) {
    for (const width of [1440, 390, 320]) {
      test(`${project.title}: ${width}px ${preference} documentation remains readable and verified`, async ({ page }) => {
        await page.setViewportSize({ width, height: width === 1440 ? 900 : width === 390 ? 844 : 700 });
        await page.emulateMedia({ reducedMotion: preference });
        const errors: string[] = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`/projects/${project.id}`);
        await expect(page.getByRole('heading', { level: 1, name: project.title, exact: true })).toBeVisible();
        await expect(page.locator('.doc-meta')).toContainText(project.status);
        await expect(page.getByRole('link', { name: `Reviewed revision ${project.revision.slice(0, 7)}`, exact: true })).toHaveAttribute('href', `https://github.com/Mahmoudmetwall2y/${project.repo}/commit/${project.revision}`);
        await expect(page.locator('.doc-overview')).toContainText('My contribution');
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
        expect(await page.locator('.project-documentation').evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
        expect(errors).toEqual([]);
      });
    }
  }
}
