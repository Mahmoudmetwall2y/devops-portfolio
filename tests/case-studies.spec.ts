import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Expected paths were independently checked against GitHub's Contents API.
const cases = [
  { title: '3-Tier User Platform', id: 'three-tier', repo: '3-Tier-User-Platform-Project', revision: '8cf00a4166acb21ef791f48234e77951eb43cb37', status: 'Configuration reviewed', paths: ['.github/workflows/qa-cicd.yml', '.github/workflows/prod-cd.yaml', 'Dockerfile', 'server/server.js', 'k8-manifests/prod/app-deployment.yaml'] },
  { title: 'Space Cargo', id: 'space-cargo', repo: 'DEPI-Graduation-Project-', revision: 'efa13ecd127257130c6aca4d5410ae750e164d5a', status: 'CI execution verified', paths: ['infrastructure/terraform/EKS.tf', 'infrastructure/ansible/playbooks/deploy-eks.yml', '.github/workflows/ci.yaml', 'infrastructure/helm/space-cargo/templates/deployments.yaml', 'infrastructure/helm/space-cargo/templates/authorization-policy.yaml', 'infrastructure/monitoring/prometheus-server/prometheus-server.yaml', 'infrastructure/monitoring/monitoring-server/grafana/dashboards/space-cargo/overview.json', 'infrastructure/helm/space-cargo/templates/istio.yaml', 'infrastructure/helm/space-cargo/values.yaml'] },
  { title: 'Ultimate DevOps', id: 'ultimate-devops', repo: 'ultimate-devops-project-demo', revision: 'c9f81edab0792575062681e6f4895536bba492d2', status: 'Configuration reviewed', paths: ['.github/workflows/ci.yaml', 'kubernetes/complete-deploy.yaml', 'src/product-catalog/Dockerfile', 'docker-compose.yml', 'src/otel-collector/otelcol-config.yml', 'src/grafana/provisioning/datasources/default.yaml'] },
];
const sections = ['Architecture', 'Engineering challenge', 'My implementation', 'Engineering decisions', 'Delivery workflow', 'Security and reliability', 'Observability', 'Verification and evidence', 'Engineering lessons', 'Next improvements'];

async function openCase(page: Page, title: string) {
  await page.goto('/'); await page.evaluate(() => document.fonts.ready);
  const trigger = page.getByRole('button', { name: `Read ${title} case study`, exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: `${title} case study`, exact: true });
  await expect(dialog).toHaveCSS('opacity', '1');
  await expect(dialog.getByRole('button', { name: 'Close case study', exact: true })).toBeFocused();
  return { dialog, trigger };
}

async function noClippedText(page: Page) {
  const dialog = page.getByRole('dialog');
  expect(await dialog.evaluate((element) => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  const clipped = await dialog.evaluate((root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), failures: string[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.textContent?.trim() || node.parentElement?.closest('[aria-hidden="true"], svg') || !node.parentElement?.getClientRects().length) continue;
      const range = document.createRange(); range.selectNode(node);
      for (const rect of range.getClientRects()) if (rect.width && (rect.left < -1 || rect.right > innerWidth + 1)) failures.push(node.textContent.trim());
    }
    return [...new Set(failures)];
  });
  expect(clipped).toEqual([]);
}

for (const project of cases) {
  for (const preference of ['reduce', 'no-preference'] as const) {
    for (const width of [1440, 390, 320]) {
      test(`${project.title}: ${width}px ${preference} case study, sources, diagram, and focus`, async ({ page }) => {
        await page.setViewportSize({ width, height: width === 1440 ? 900 : width === 390 ? 844 : 700 });
        await page.emulateMedia({ reducedMotion: preference });
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        const { dialog, trigger } = await openCase(page, project.title);
        for (const title of sections) await expect(dialog.getByRole('heading', { name: title, exact: true })).toBeVisible();
        await expect(dialog.locator('.case-review-status > span')).toHaveText(project.status);
        await expect(dialog.getByRole('link', { name: `Reviewed revision ${project.revision.slice(0, 7)}` })).toHaveAttribute('href', `https://github.com/Mahmoudmetwall2y/${project.repo}/commit/${project.revision}`);
        const sources = await dialog.locator('.evidence-list a').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
        expect(sources).toEqual(project.paths.map((path) => `https://github.com/Mahmoudmetwall2y/${project.repo}/blob/main/${path}`));
        const figure = dialog.getByRole('figure');
        await expect(figure).toHaveAccessibleName(/SIMPLIFIED CONFIGURATION VIEW/);
        expect(await figure.locator('.case-architecture-node').count()).toBeGreaterThanOrEqual(6);
        expect(await figure.locator('.case-architecture-node strong').evaluateAll((elements) => Math.min(...elements.map((element) => parseFloat(getComputedStyle(element).fontSize))))).toBeGreaterThanOrEqual(13);
        await expect(dialog.getByText('Proposed work — not verified as implemented.', { exact: true })).toBeVisible();
        await dialog.getByRole('navigation').getByRole('link', { name: 'Decisions', exact: true }).focus();
        await page.keyboard.press('Enter');
        const target = dialog.getByRole('heading', { name: 'Engineering decisions' });
        await expect(target).toBeFocused();
        expect(await target.evaluate((element) => element.getBoundingClientRect().top >= element.closest('dialog')!.querySelector('.modal-top')!.getBoundingClientRect().bottom + 4)).toBe(true);
        await expect(dialog.getByRole('button', { name: 'Close case study' })).toBeInViewport();
        await noClippedText(page);
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
        expect(axe.violations.map((violation) => ({ id: violation.id, targets: violation.nodes.map((node) => node.target) }))).toEqual([]);
        await page.keyboard.press('Escape');
        await expect(dialog).toHaveCount(0); await expect(trigger).toBeFocused();
        await trigger.click(); await page.getByRole('button', { name: 'Close case study', exact: true }).click();
        await expect(trigger).toBeFocused(); expect(errors).toEqual([]);
      });
    }
  }
}

test('course context, upstream attribution, and verified CI remain separate', async ({ page }) => {
  for (const project of cases) {
    const { dialog } = await openCase(page, project.title);
    if (project.id === 'space-cargo') {
      await expect(dialog.getByRole('link', { name: 'Successful CI run and job steps' })).toHaveAttribute('href', 'https://github.com/Mahmoudmetwall2y/DEPI-Graduation-Project-/actions/runs/29333854603');
      await expect(dialog.getByRole('link', { name: 'My metrics configuration commit' })).toHaveAttribute('href', /commit\/200332203abe8f94ca283d44e420cb4f1365e392$/);
      await expect(dialog.locator('.case-content')).toContainText('no Argo CD Application');
      await expect(dialog.locator('.case-content')).toContainText('not Terraform apply');
    } else {
      await expect(dialog.locator('.case-learning-context')).toContainText('Hands-on Udemy course reproduction');
      await expect(dialog.locator('.project-foundation a')).toHaveAttribute('href', project.id === 'three-tier' ? 'https://github.com/jaiswaladi246/3-Tier-User-Platform-Project' : 'https://github.com/iam-veeramalla/ultimate-devops-project-demo');
      await expect(dialog.locator('.case-content')).toContainText('zero runs');
    }
    if (project.id === 'ultimate-devops') {
      await expect(dialog.getByRole('figure')).toContainText('Docker Compose signal flow');
      await expect(dialog.getByRole('figure')).toContainText('Traces → Jaeger; metrics → Prometheus; logs → OpenSearch');
    }
    await dialog.getByRole('link', { name: 'Back to projects' }).click();
    await expect(dialog).toHaveCount(0); await expect(page).toHaveURL(/#work$/);
  }
});

test('320px detailed diagrams and evidence reflow at 200% text and with WCAG text spacing', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  for (const project of cases) {
    for (const adjustment of ['resize', 'spacing']) {
      const { dialog } = await openCase(page, project.title);
      if (adjustment === 'resize') await dialog.evaluate((root) => {
        const elements = [root, ...root.querySelectorAll('*')].filter((element): element is HTMLElement => element instanceof HTMLElement);
        const sizes = elements.map((element) => ({ element, size: parseFloat(getComputedStyle(element).fontSize) }));
        sizes.forEach(({ element, size }) => element.style.setProperty('font-size', `${size * 2}px`, 'important'));
      });
      else await page.addStyleTag({ content: '.project-modal * { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } .project-modal p { margin-bottom: 2em !important; }' });
      await noClippedText(page);
      await dialog.getByRole('navigation').getByRole('link', { name: 'Evidence', exact: true }).focus();
      await page.keyboard.press('Enter');
      await expect(dialog.getByRole('heading', { name: 'Verification and evidence' })).toBeFocused();
      await expect(dialog.getByRole('button', { name: 'Close case study' })).toBeInViewport();
      await dialog.getByRole('link', { name: 'View full repository' }).scrollIntoViewIfNeeded();
      await expect(dialog.getByRole('link', { name: 'View full repository' })).toBeVisible();
      await page.keyboard.press('Escape');
    }
  }
});
