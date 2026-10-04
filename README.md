# Mahmoud Metwally — Cloud & DevOps Portfolio

A custom portfolio for recruiters and clients, built with React, TypeScript, Vite, and GSAP. The site uses self-hosted Bricolage Grotesque, Manrope, and IBM Plex Mono fonts, and can be deployed as a static website.

The Linux workstation design combines graphite backgrounds, terminal green, and infrastructure blue with a portrait-led homepage, replayable name reveal, animated orbital signals and backdrop, moving technology ribbon, scroll-driven portrait and architecture motion, layered project cards, and accessible project dialogs. Bash window details, shell prompts, and monospace labels connect the visual identity to the tools used in the work. Featured work covers the 3-Tier User Platform, Space Cargo, and Ultimate DevOps repositories. Each case study links to its implementation; upstream application foundations are credited where applicable. The career section and downloadable CV cover Easytravel, DEPI, prior IT operations, education, and AscultiCor leadership.

Motion runs automatically on every visit, including when the system requests reduced motion or an older session saved motion as off. There is no pause/play toggle or stored motion setting. Replay intro restarts the entrance sequence. On phones, project cards use a normal vertical layout. The native cursor and browser scrolling remain available.

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

Browser checks use Playwright and axe to cover the interactive release demo, project case studies and keyboard focus, keyboard search, filters, toolkit, mobile navigation, contact clipboard, link destinations, responsive widths, motion playback and preferences, and automated accessibility. Browser checks cover automatic playback under both system motion preferences, including reloads, older saved settings, and replay. Run:

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

For Netlify, Vercel, Cloudflare Pages, or an equivalent static host, use `npm run build` as the build command and `dist` as the output directory. No backend or secret environment variables are required.

The site uses `/` as its base path, suitable for the existing custom domain `https://mahmoudmetwall2y.online/` or a root-domain deployment. For a GitHub Pages project URL such as `https://USERNAME.github.io/REPOSITORY/`, add `base: '/REPOSITORY/'` to `vite.config.ts`, build again, and publish `dist`. Keep the base as `/` when GitHub Pages uses a custom domain. Set the canonical URL and social metadata in `index.html` to the actual deployment URL if it changes.

## Content

The main application lives in `src/`. Project descriptions and source links live in `src/data/projects.ts`, professional experience lives in `src/data/profile.ts`, and contact destinations live in `src/App.tsx`. Professional details were supplied in the owner's CV in October 2026. Motion is handled in `src/hooks/usePortfolioMotion.ts` and `src/components/MotionElements.tsx`; layout and motion styles live in `src/redesign.css` and `src/refinement.css`. The shared color tokens and component color states live in `src/palette.css`, which has final precedence over earlier styles. Architecture diagrams are SVG code in `src/components/ArchitectureGraphic.tsx`. Public assets live in `public/`; `public/assets/mahmoud.jpg` is the GitHub profile photograph, and `public/assets/mahmoud-metwally-cv.pdf` is an unmodified copy of the supplied CV. Replace that PDF and update the career data when the CV changes.

Profile links: [GitHub](https://github.com/Mahmoudmetwall2y) · [LinkedIn](https://www.linkedin.com/in/mahmoudmetwall2y)
