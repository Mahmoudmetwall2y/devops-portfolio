import type { Plugin } from 'vite';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadPortfolio } from './load.ts';
type Snapshot = typeof import('./portfolio.json');

export async function portfolioContentPlugin(env: Record<string, string | undefined>): Promise<Plugin> {
  const content = await loadPortfolio(env) as Snapshot;
  const origin = (env.SITE_URL ?? content.profile.siteUrl).replace(/\/$/, '');
  let site: URL;
  try { site = new URL(origin); } catch { throw new Error('SITE_URL must be a valid HTTPS origin.'); }
  if (site.protocol !== 'https:' || site.username || site.password || site.pathname !== '/' || site.search || site.hash) throw new Error('SITE_URL must be an HTTPS origin without a path, credentials, query, or fragment.');
  content.profile.siteUrl = origin;
  const modules: Record<string, unknown> = { 'virtual:portfolio-profile': content.profile, 'virtual:portfolio-projects': content.projects, 'virtual:portfolio-documentation': content.documentation };
  const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const metadata = (html: string, title: string, description: string, url: string, article = false) => html
    .replace(/<title>[^<]*<\/title>/, () => `<title>${escape(title)}</title>`)
    .replace(/(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*/g, (_, prefix) => `${prefix}${escape(description)}`)
    .replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*/g, (_, prefix) => `${prefix}${escape(title)}`)
    .replace(/(<meta property="og:type" content=")[^"]*/, (_, prefix) => `${prefix}${article ? 'article' : 'website'}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, (_, prefix) => `${prefix}${escape(url)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, (_, prefix) => `${prefix}${escape(url)}`)
    .replaceAll('https://mahmoudmetwall2y.online', origin);
  return {
    name: 'portfolio-published-content',
    resolveId(id) { if (Object.hasOwn(modules, id)) return `\0${id}`; },
    load(id) { const key = id.replace(/^\0/, ''); if (id.startsWith('\0') && Object.hasOwn(modules, key)) return `export default ${JSON.stringify(modules[key])}`; },
    transformIndexHtml(html) {
      return metadata(html, `${content.profile.displayName} | Cloud & DevOps Engineer`, `${content.profile.displayName}. ${content.profile.hero.description}`, `${origin}/`)
        .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, () => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: content.profile.fullName, jobTitle: content.profile.hero.role, url: origin, image: new URL(content.profile.photo.url, origin).href, sameAs: [content.profile.githubUrl, content.profile.linkedinUrl] }).replaceAll('<', '\\u003c')}</script>`);
    },
    async writeBundle(options) {
      const directory = resolve(options.dir ?? 'dist');
      const template = await readFile(resolve(directory, 'index.html'), 'utf8');
      await mkdir(resolve(directory, 'projects'), { recursive: true });
      for (const project of content.projects) {
        const page = metadata(template, `${project.title} — Engineering documentation | ${content.profile.displayName}`, project.description, `${origin}/projects/${project.id}`, true);
        await writeFile(resolve(directory, 'projects', `${project.id}.html`), page);
      }
      const urls = [origin + '/', ...content.projects.map(project => `${origin}/projects/${project.id}`)];
      await writeFile(resolve(directory, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${escape(url)}</loc></url>`).join('')}</urlset>\n`);
      await writeFile(resolve(directory, '_redirects'), ['/admin /admin/ 301', '/admin/* /admin/index.html 200', ...content.projects.map(project => `/projects/${project.id} /projects/${project.id}.html 200`), '/projects/* /index.html 200'].join('\n') + '\n');
    },
  };
}
