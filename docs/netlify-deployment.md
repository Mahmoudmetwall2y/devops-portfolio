# Netlify deployment

Approved by the owner and deployed on 19 October 2026.

## Hosting and source

- Portfolio: <https://mahmoudmetwall2y.tech/>
- Content dashboard: <https://mahmoudmetwall2y.tech/admin/>
- Netlify fallback hostname: <https://mahmoud-metwally-devops.netlify.app/>.
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

Credential-enabled Sanity CORS origins include the Netlify origin and `https://mahmoudmetwall2y.tech`. These are exact origins, not wildcard permissions. A GitHub push also successfully produced production deploy `6ad66d66dbb45030918feb9b`, confirming both content updates and source updates trigger the intended production branch.

## Hostinger domain connection

Netlify is configured with primary domain `mahmoudmetwall2y.tech` and alias `www.mahmoudmetwall2y.tech`. DNS is managed by Hostinger. At the initial check, its nameservers were `artemis.dns-parking.com` and `hermes.dns-parking.com`, and the apex resolved to parking IP `2.57.91.91`.

In Hostinger **Domains → Domain portfolio → mahmoudmetwall2y.tech → DNS / Nameservers**, set:

| Type | Name | Target |
| --- | --- | --- |
| A | `@` | `75.2.60.5` |
| CNAME | `www` | `mahmoudmetwall2y.tech` |

Replace the old parking record for `@` rather than retaining conflicting web records. Retain email MX/TXT records. Nameservers remain at Hostinger. The apex follows [Netlify external DNS guidance](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/); the `www` alias uses that same apex route for the connection reason described below. See [Hostinger DNS management guidance](https://support.hostinger.com/en/articles/1583249-how-to-manage-dns-records-at-hostinger) for editing records. The saved TTLs are 60 seconds for the apex and 300 seconds for `www`.

The owner saved these records in Hostinger. Public resolvers confirmed the apex points to Netlify. Netlify automatically issued its managed certificate for both hostnames, expiring 17 January 2027, and enabled HTTPS enforcement. The main domain serves HTTP 200 over HTTPS; plain HTTP redirects to HTTPS. The main domain's complete browser checks passed using normal DNS and certificate verification, without a resolver override.

A follow-up routing check found that this connection times out on the regional Netlify addresses returned through the original `www` CNAME to the Netlify hostname. The owner changed the `www` CNAME target to `mahmoudmetwall2y.tech` so both hostnames use the working apex route. Both Cloudflare and Google public DNS showed the updated CNAME, and the authoritative Hostinger nameserver returned `75.2.60.5` for both hostnames. Once the local cache expired, a normal HTTPS request to `www` successfully returned HTTP **301** to `https://mahmoudmetwall2y.tech/`, without any DNS override. The apex A record remains unchanged.

## Deployment checks

- Public and Studio typechecks pass. Public production build using the **actual published Sanity data** and the separate Studio build pass. Netlify's clean cloud build succeeds.
- Live desktop 1440×900, mobile 390×844, and small mobile 320×700 checks pass: homepage, all three direct project URLs, uploaded CV response, Sanity portrait URL, Google sign-in screen, admin noindex header and absence of horizontal overflow or browser console errors.
- Normal-motion desktop showed 34 running browser animations. Reduced-motion mobile contexts showed zero running animations. No motion preferences were overridden in the website code.
- Live browser evidence: `.artifacts/deployment/live-inspection.json` and `.artifacts/deployment/screenshots/` (ignored by Git).
- Final custom-domain browser evidence: `.artifacts/deployment/domain-inspection.json`. All three viewport/motion combinations pass on the real HTTPS domain with normal DNS: all project pages, uploaded PDF, admin login, no browser errors and no overflow.
- A network limitation affected the initial Netlify-subdomain inspection from this machine: the regional IPs returned for the Netlify subdomain timed out. That initial inspection resolved only the Netlify hostname to its documented load balancer `75.2.60.5`, preserving HTTPS certificate verification. No system DNS or certificate settings were changed. The main custom domain then passed without that override; the `www` DNS route is being adjusted as described above.
- Netlify's optional injected branding badge was disabled using the project setting, preserving the portfolio's visual identity without editing its UI.
- The earlier complete browser suite and its isolated rerun are recorded in [cms-validation.md](./cms-validation.md). The remaining Studio dependency audit findings and vendor build warnings are documented there; deployment did not resolve those upstream issues.
- The first GitHub CI run passed both builds and 106 of 109 browser tests. Three enlarged-text tests issued Control+K before the asynchronous native project-dialog close had finished. The trace confirmed that the test still targeted the closing project dialog. The tests now explicitly verify case-study unmount and restored focus before opening search, then assert that the search dialog is visible. No production application code was changed for this synchronization fix.
- All five enlarged-text/text-spacing checks pass locally after that synchronization fix (desktop, laptop, tablet, mobile and small mobile); TypeScript passes as well. A fresh GitHub CI run validates the complete suite. This test/documentation-only commit skips a redundant Netlify deployment; the running application code is unchanged.

OAuth credentials remain with the official Netlify, GitHub and Sanity CLIs. Local integration state and hook URLs are under ignored `.artifacts/` and `.netlify/` paths, outside published build files.
