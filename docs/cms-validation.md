# CMS implementation and validation

Pre-deployment baseline validated locally on 19 October 2026, on branch `fix/motion-accessibility`. At that stage no commit, push, pull request, deployment or DNS change had been made. The subsequently approved deployment is recorded in [netlify-deployment.md](./netlify-deployment.md).

## Implementation

- `studio/`: separate authenticated Sanity Studio, Linux-styled dashboard, profile singleton, project CRUD, field groups, image/PDF uploads, display ordering and draft content preview. Includes its own package lock, CLI configuration and repeatable seed import.
- `content/portfolio.json`, `content/model.ts`, `content/load.ts`, `content/vite.ts`: preserved content seed, shared editor/build field definitions, validated published projection, build-time snapshots, generated project metadata, routes and sitemap.
- `src/data/profile.ts`, `src/data/projects.ts`, `src/data/projectDocumentation.ts`, `src/content.d.ts`: public data now uses the shared build snapshot.
- `src/App.tsx`, `src/components/Experience.tsx`, `src/components/ArchitectureGraphic.tsx`, `src/ProjectPage.tsx`, `src/case-study.css`: connect editable profile content, photos, CV, project images/diagrams and an empty-project state to existing components.
- `src/data/terminal.ts`, `src/components/TerminalDialog.tsx`: generated project commands support additions/removals instead of assuming exactly three projects.
- `vite.config.ts`, `package.json`, `package-lock.json`, `.env.example`, `.nvmrc`, `netlify.toml`, `public/_redirects`: build configuration for public content and the separate `/admin/` app. The local `.env.local` file is ignored.
- `tests/cms.spec.ts`: eight checks covering preserved seed shape, published-only querying, validation, deletion/empty states, safe media, and edited/added/reordered content reaching the actual built application.

Earlier motion, readability, terminal and documentation work already existed in this dirty working tree. Those changes were preserved; the animation hooks were not rewritten for this CMS task.

## Verified results

- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run cms:typecheck`: passed, including the schema and CLI scripts.
- `npm run cms:build`: passed.
- `npm run build:netlify`: passed with a clean installation of Studio's lockfile. This tested the deployment command locally with the explicit local seed source; it did not deploy or publish drafts. An initial clean-install attempt was blocked by Windows locking Vite's native module in the running Studio server. Stopping that server and rerunning resolved it.
- Official Sanity CLI document validation: **4 valid documents, 0 errors**.
- Authenticated API CRUD check: temporary draft created, updated, read and deleted successfully; published perspective excluded it. The temporary document was cleaned up. Owner content remains **4 drafts, 0 published profile/project documents**.
- Actual stored draft projection: profile and all three projects passed the public build validator, including documentation and uploaded portrait/CV references. No draft snapshot was written to the public build.
- Production browser inspection at 1440×900, 390×844 and 320×700: public homepage and actual Sanity sign-in page rendered without document overflow, browser exceptions or console errors.
- Root `npm audit`: **0 vulnerabilities**. Studio audit: **14 findings: 10 high, 4 moderate**, through CLI/codegen/framework-detection dependency paths involving `braces` and `sprintf-js`. Remaining findings are unresolved; see the maintenance notes in `content-management.md`.
- Public build has no large-chunk warning. Separate Studio build warns about large vendor chunks and a React compiler directive; both builds complete successfully.

- Full `npm test` run: **108 passed, 1 failed** in 5.2 minutes. The release-lab test was interrupted by a Vite page reload while the build configuration was being edited: its trace shows three completed stages, navigation back to `/`, then zero completed stages. With source files settled, the exact test was rerun using `npm test -- --grep 'release lab completes every stage' --reporter=list`: **1 passed**, including both pipeline runs and the browser-error assertion. Thus all 109 test cases have passing results, with this one isolated rerun; the initial full-run report still records its interruption.
- Passing coverage includes normal/reduced motion, live preference changes, animation cleanup, project dialogs and documentation, command search, navigation, toolkit, terminal, release demo, WCAG AA automated checks, five responsive widths, 200% text and text-spacing adjustments, and the eight new CMS tests.
- Hash comparison against the pre-CMS source snapshot confirms `src/hooks/usePortfolioMotion.ts` and `src/components/MotionElements.tsx` are byte-for-byte unchanged.

## Review artifacts

Screenshots are in `.artifacts/cms-review/screenshots/`:

- `production-desktop-public-home.png`, `production-desktop-admin-login.png`
- `production-mobile-public-home.png`, `production-mobile-admin-login.png`
- `production-small-mobile-public-home.png`, `production-small-mobile-admin-login.png`

Additional evidence: `.artifacts/cms-review/production-inspection.json`, `.artifacts/cms-review/netlify-build.log`, isolated changed-content fixture builds in `.artifacts/cms-review/fixtures/`, and the Playwright report in `playwright-report/index.html`. The interrupted test's trace is preserved in `.artifacts/cms-review/interrupted-release-test/`; its successful rerun log is `.artifacts/cms-review/release-rerun.log`. Artifacts are ignored by Git.

## Remaining integration steps and limitations

- CLI authentication succeeded. The user's browser still needs its own Google sign-in at `/admin/`. Automated browser inspection verified the real unauthenticated sign-in page; it did not complete Google OAuth or exercise the signed-in editor controls. Backend CRUD, schema validation and real-content projection were verified separately.
- Draft preview is a structured content/media preview, not a rendered public-site preview.
- Netlify site connection, approved branch selection, publishing reviewed drafts, production CORS, build-hook setup and the live publish-to-build cycle remain pending. `CONTENT_SOURCE=sanity` intentionally fails until the profile is published.
- Domain DNS, HTTPS verification and final canonical URL configuration remain pending. No domain value was guessed or changed.
- Changing a project's slug changes its URL; redirects from historical slugs require an explicit addition.

The exact publishing, hosting and domain steps are in [content-management.md](./content-management.md).
