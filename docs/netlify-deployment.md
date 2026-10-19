# Netlify deployment

Approved by the owner and deployed on 19 October 2026.

## Hosting and source

- Portfolio: <https://mahmoud-metwally-devops.netlify.app/>
- Content dashboard: <https://mahmoud-metwally-devops.netlify.app/admin/>
- Netlify project: <https://app.netlify.com/projects/mahmoud-metwally-devops>
- Netlify project ID: `1f6c0d12-6c9a-49aa-8cff-32949edae920`.
- Source: <https://github.com/Mahmoudmetwall2y/devops-portfolio/tree/release/sanity-netlify>.
- **Production branch: `release/sanity-netlify`**. `main` was not changed or merged. To switch the production branch later, update Netlify's build settings and the Sanity build hook branch together.
- Build command: `npm run build:netlify`; publish directory: `dist`; Node 24. The public site uses `CONTENT_SOURCE=sanity`, project `2mn6x81s`, dataset `production`.
- Netlify has a repository-specific read-only GitHub deploy key. A GitHub push webhook connects this repository to Netlify. No personal GitHub access token was copied into Netlify or source files.

## Content publishing and synchronization

The profile and three projects are published in Sanity, including complete project documentation and portrait/CV assets. The public build validates and reads their published versions. The profile's canonical origin is `https://mahmoudmetwall2y.tech/`.

The configured Sanity webhook is **Netlify portfolio published content**. It handles published profile/project creates, updates and deletes, with draft and version events excluded. Its destination is a Netlify build hook for the production branch. The hook URL is a credential and is intentionally absent from this document and Git.

Verification: a semantically identical canonical URL update in Sanity produced a webhook delivery with HTTP **200**, followed by a new successful Netlify production deployment. Initial deploy `6ad66ba5a792bd5e54713077` and webhook-triggered deploy `6ad66c236bdac6dd078ec827` both reached `ready`.

To update the website, open `/admin/`, sign in with Google, edit content, review the draft, and click Publish. Wait for the Netlify build to succeed, then refresh the public site. Draft saves stay private; unpublishing or deleting a published project removes it on the next successful build. Code changes must be pushed to the production branch to trigger a code deployment.

Credential-enabled Sanity CORS origins include the Netlify origin and `https://mahmoudmetwall2y.tech`. These are exact origins, not wildcard permissions.

## Hostinger domain connection

Netlify is configured with primary domain `mahmoudmetwall2y.tech` and alias `www.mahmoudmetwall2y.tech`. DNS is managed by Hostinger. At the initial check, its nameservers were `artemis.dns-parking.com` and `hermes.dns-parking.com`, and the apex resolved to parking IP `2.57.91.91`.

In Hostinger **Domains → Domain portfolio → mahmoudmetwall2y.tech → DNS / Nameservers**, set:

| Type | Name | Target |
| --- | --- | --- |
| A | `@` | `75.2.60.5` |
| CNAME | `www` | `mahmoud-metwally-devops.netlify.app` |

Replace the old parking record for `@` rather than retaining conflicting web records. Use the default TTL; retain email MX/TXT records. Nameservers can stay at Hostinger. These values follow [Netlify external DNS guidance](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/) and [Hostinger DNS management guidance](https://support.hostinger.com/en/articles/1583249-how-to-manage-dns-records-at-hostinger).

After DNS points to Netlify, verify domain DNS in Netlify's domain settings, provision the managed HTTPS certificate, enable HTTPS enforcement, and check the apex, `www` redirect, project links and `/admin/` sign-in. At this report's initial preparation, the Hostinger DNS save and certificate issuance were still pending; do not treat the custom domain as verified until those checks pass.

## Deployment checks

- Public and Studio typechecks pass. Public production build using the **actual published Sanity data** and the separate Studio build pass. Netlify's clean cloud build succeeds.
- Live desktop 1440×900, mobile 390×844, and small mobile 320×700 checks pass: homepage, all three direct project URLs, uploaded CV response, Sanity portrait URL, Google sign-in screen, admin noindex header and absence of horizontal overflow or browser console errors.
- Normal-motion desktop showed 34 running browser animations. Reduced-motion mobile contexts showed zero running animations. No motion preferences were overridden in the website code.
- Live browser evidence: `.artifacts/deployment/live-inspection.json` and `.artifacts/deployment/screenshots/` (ignored by Git).
- A network limitation affected inspection from this machine: the regional IPs returned for the Netlify subdomain timed out. Browser inspection therefore resolved that exact Netlify hostname to Netlify's documented load balancer `75.2.60.5`, preserving HTTPS certificate verification and normal requests. The same server returned HTTP 200. No system DNS or certificate settings were changed. Normal regional routing and the custom domain require follow-up checks after DNS propagation.
- The earlier complete browser suite and its isolated rerun are recorded in [cms-validation.md](./cms-validation.md). The remaining Studio dependency audit findings and vendor build warnings are documented there; deployment did not resolve those upstream issues.

OAuth credentials remain with the official Netlify, GitHub and Sanity CLIs. Local integration state and hook URLs are under ignored `.artifacts/` and `.netlify/` paths, outside published build files.
