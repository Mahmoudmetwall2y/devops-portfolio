# Portfolio control panel

The existing React, TypeScript, Vite and GSAP portfolio now has a separate Sanity Studio at `/admin/`. Its public layout, motion preferences and engineering content are preserved. Sanity project: `2mn6x81s`; dataset: `production`.

## Open locally

Run these commands in separate terminals from the repository root:

```powershell
npm run dev
npm run cms:dev
```

- Portfolio: <http://127.0.0.1:5173/>
- Dashboard: <http://127.0.0.1:3333/admin/>

Choose **Google** in the dashboard and use the Google account that owns the Sanity project. CLI sign-in and browser sign-in are separate sessions. Project membership controls editing access; knowing the admin URL does not grant access.

The profile and three existing projects were imported as drafts, including the portrait and CV assets. On 19 October 2026, the owner approved deployment and those four records were published. The published profile uses `https://mahmoudmetwall2y.tech`. The import is safe to repeat: existing drafts and published records are skipped, not overwritten.

## Everyday editing

1. Open **Dashboard → Edit profile**, or **Content → Profile & site settings**. Change the portrait, alternative text, uploaded CV PDF, biography, contact links, experience or site URL.
2. Use **Add a project** for a new project, or **Content → Projects & documentation** to edit an existing one. Complete the required fields in the Overview, Images & attribution, Engineering case study and Full documentation groups. Use an accurate source revision and evidence; incomplete projects can remain drafts.
3. Set **Display order** to arrange projects. Lower numbers come first. Public numbering, counts, filters, search, terminal commands, documentation routes and sitemap follow the published list.
4. Upload an optional card image or architecture diagram with useful alternative text. The structured architecture description remains available alongside diagrams. Existing projects retain their original SVG illustrations unless an image is supplied.
5. Open **Preview draft** to review the current fields, uploaded images, CV and command examples before publishing. This is a readable content preview, not a pixel-identical preview of the public page.
6. Publish only when ready. Once hosting and the webhook are connected, publishing starts a build. Changes appear after that build succeeds, rather than immediately on clicking Publish.
7. **Unpublish** removes a project from the next successful site build while retaining a draft. **Delete** removes its Sanity document. Removing every project produces an intentional empty state; deleted projects are never restored from seed content automatically.

Keep slugs stable after launch. Changing a slug changes its URL; historical redirects need to be added separately if an old URL must remain valid. Profile deletion/unpublishing is disabled in this Studio because a published profile is required for a CMS build.

## How public content works

`content/portfolio.json` is the faithful local seed. `.env.local` currently uses `CONTENT_SOURCE=local`, so the public development site continues to show the existing content while the Sanity documents remain drafts. The build validates content before generating public files.

With `CONTENT_SOURCE=sanity`, Vite reads **published** content at build time. Drafts and private editor fields do not enter the public snapshot. Project documentation is still a separate lazy-loaded chunk. Public visitors do not load the Sanity editor, authentication code or API client. Photos and diagrams use resized Sanity CDN URLs.

There is no automatic seed fallback during a CMS build: missing profile content, an API failure or invalid content fails the build visibly. Fix the error and rebuild. On Netlify, a failed build leaves the previous successful deployment serving visitors. A successful build with zero projects intentionally publishes the empty state.

## Connect Netlify after review

The code is prepared; no Netlify site, live webhook, DNS record or deployment has been created by this task.

1. Review the local implementation and Sanity drafts. Approve publishing the intended profile and projects, then publish them in Studio before the first CMS deployment. A first build with only drafts fails deliberately.
2. After approval to push and deploy, connect the approved Git branch to a Netlify site. `netlify.toml` sets build command `npm run build:netlify`, output `dist`, Node 24, `CONTENT_SOURCE=sanity`, and the project/dataset IDs. The command builds both the public site and admin, installing the separate Studio lockfile first.
3. Set `SITE_URL` in the Netlify build environment to the final HTTPS origin, or update **Public website URL** in the profile. Use an origin such as `https://example.com`, without a subpath, query, credentials or fragment. Until changed, the existing canonical domain is retained. Rebuild after changing it.
4. In [Sanity project settings](https://www.sanity.io/manage/project/2mn6x81s), add the exact Netlify origin under **API → CORS origins**, with credentials allowed. Add the custom domain origin when connected. Local credential origins already include `http://127.0.0.1:3333` and `http://127.0.0.1:4173`. Use the documented local URLs; `localhost` is a different origin.
5. Create a Netlify build hook for the approved production branch. Store its URL only in Sanity's webhook settings; it can trigger builds and must not be added to public content or source files.
6. Add a Sanity webhook for dataset `production`, method **POST**, triggers **Create, Update and Delete**, drafts and versions **disabled**. Use this filter:

```groq
_type in ["portfolioSettings", "portfolioProject"] &&
!(_id in path("drafts.**")) && !(_id in path("versions.**"))
```

Use this small projection:

```groq
{"id": _id, "type": _type}
```

The webhook URL is the Netlify build hook URL. Verify the webhook delivery and resulting Netlify build with a reviewed content update. Test unpublishing as well: it uses the delete trigger. Draft saves should not build the website. This live end-to-end step has not been performed yet.

Official setup references: [Sanity webhooks](https://www.sanity.io/docs/content-lake/webhooks), [Netlify build hooks](https://docs.netlify.com/build/configure-builds/build-hooks/).

## Connect the purchased domain

After the site deployment has been reviewed, add the purchased domain in Netlify's domain management. Follow the DNS records Netlify supplies for that specific site and registrar, wait for domain verification and HTTPS provisioning, choose a primary hostname, update `SITE_URL`, add its exact Sanity CORS origin, and rebuild. Verify the portfolio, a direct project URL, CV download, and `/admin/` Google sign-in on the final hostname. No registrar or DNS credentials are needed in chat.

## Credentials and maintenance

- Project/dataset IDs are public configuration. Never put write tokens, passwords, hook URLs or private infrastructure details into content fields.
- A public dataset needs no token for published builds. If the dataset becomes private, set a read-only `SANITY_READ_TOKEN` in the server/build environment. Never prefix a token with `VITE_` or add it to frontend configuration.
- The admin HTML is marked `noindex, nofollow`; Netlify adds no-store and noindex headers. Authentication still comes from Sanity, not from robots settings.
- Run `npm run typecheck`, `npm run build`, `npm run cms:typecheck`, `npm run cms:build`, and `npm test` after code changes. On this Windows machine, use `$env:PLAYWRIGHT_CHANNEL='msedge'` for Playwright.
- Re-import, if ever needed: `npm run cms:seed` after `npm run cms:login`. This creates missing seed drafts only; it does not publish or overwrite.
- Studio's current dependency audit reports **14 findings: 10 high, 4 moderate**, through CLI/codegen/framework-detection dependencies involving `braces` and `sprintf-js`. Targeted overrides update YAML, TOML and UUID dependencies without forcing an SDK downgrade. Remaining advisories require upstream fixes or a separately verified tooling change. The root public app's production audit reports zero findings. Do not run `npm audit fix --force` blindly: it proposes a breaking Sanity downgrade.
- Studio's production build reports large vendor chunks and a React compiler directive warning. These belong to the separate admin app; the public bundle does not load them. Review Studio dependency updates regularly.
