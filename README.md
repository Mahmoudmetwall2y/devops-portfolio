# Mahmoud Metwally — Cloud & DevOps Portfolio

A custom portfolio for recruiters and clients, built with React, TypeScript, Vite, and GSAP. The site uses self-hosted Bricolage Grotesque, Manrope, and IBM Plex Mono fonts, and can be deployed as a static website.

The Linux workstation design combines graphite backgrounds, terminal green, and infrastructure blue with a portrait-led homepage, replayable name reveal, animated orbital signals and backdrop, moving technology ribbon, scroll-driven portrait and architecture motion, layered project cards, and accessible project dialogs. Bash window details, shell prompts, and monospace labels connect the visual identity to the tools used in the work. Featured work covers the 3-Tier User Platform, Space Cargo, and Ultimate DevOps repositories. Each case study links to its implementation; upstream application foundations are credited where applicable. The career section and downloadable CV cover Easytravel, DEPI, prior IT operations, education, and AscultiCor leadership.

Motion runs automatically for visitors who allow animation. System reduced-motion preferences disable nonessential movement while keeping all content and controls usable. Replay intro respects that preference. There is no stored motion toggle. On phones, project cards use a normal vertical layout. The native cursor and browser scrolling remain available.

## Run locally

Use Node.js 22.12 or newer (Node.js 24 is used in CI).

```sh
npm install
npm run dev
```

Open the local address Vite prints, normally `http://127.0.0.1:5173`.

## Check and build

```sh
npm run typecheck
npm run build
npm run preview
```

The production files are written to `dist/`. Preview normally runs at `http://127.0.0.1:4173`. `npm run lint` is an alias for the TypeScript check. The GitHub Actions workflow checks the production build and runs browser tests on pull requests and pushes to `main` or `master`; it saves diagnostics on failure and does not publish the site.

Browser checks use Playwright and axe to cover the interactive release demo, project case studies and keyboard focus, keyboard search, filters, toolkit, mobile navigation, contact clipboard, link destinations, responsive widths, motion playback and preferences, and automated accessibility. Normal animation and reduced-motion behavior are tested separately, including live preference changes and replay. Run:

```sh
npx playwright install chromium
npm test
```

An installed Microsoft Edge or Google Chrome can be used when the Playwright browser download is unavailable. In PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'msedge' # or 'chrome'
npm test
```

The test configuration starts the local Vite server or reuses a server already running on port 5173. Failure screenshots and traces are saved in `test-results/`, and the HTML report is saved in `playwright-report/`. Run `npx playwright show-report` to inspect the report.

## Deploy

For the complete Netlify site and Sanity dashboard, use `npm run build:netlify` and publish `dist`. `netlify.toml` supplies Node 24 and the published Sanity content configuration. Publish the profile and intended projects before the first CMS build. The separate authenticated dashboard is served at `/admin/`. Connect a Sanity webhook to a Netlify build hook to rebuild after publishing, updating, unpublishing or deleting content. See [the content and deployment guide](docs/content-management.md) for setup, CORS, domain configuration and maintenance notes.

The site uses `/` as its base path for a root-domain deployment. The owner's purchased domain is `https://mahmoudmetwall2y.tech`. Set the canonical origin in the Sanity profile or the server-side `SITE_URL` build environment variable; project metadata and the sitemap are generated from that value. Domain DNS and HTTPS must also be configured on the hosting provider.

## Content

The main application lives in `src/`. Sanity manages profile content, projects, complete project documentation and uploaded media; `content/portfolio.json` preserves the local seed. Build-time validation and projections live in `content/`, and the editor lives in `studio/`. The public data modules consume the validated snapshot. Professional details were supplied in the owner's CV in October 2026. Motion is handled in `src/hooks/usePortfolioMotion.ts` and `src/components/MotionElements.tsx`; layout and motion styles live in `src/redesign.css` and `src/refinement.css`. The shared color tokens and component color states live in `src/palette.css`, which has final precedence over earlier styles. Architecture diagrams are SVG code in `src/components/ArchitectureGraphic.tsx`, with optional uploaded diagrams alongside accessible structured descriptions. Original public media remains in `public/assets/`.

Profile links: [GitHub](https://github.com/Mahmoudmetwall2y) · [LinkedIn](https://www.linkedin.com/in/mahmoudmetwall2y)
