import { readFile } from 'node:fs/promises';
import { createClient } from '@sanity/client';
import { z } from 'zod';
import { profileFields, projectFields, type Field } from './model.ts';

const publicUrl = z.string().max(4096).refine(value => {
  if (/[\\\r\n]/.test(value)) return false;
  if (/^\/(?!\/)/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password; } catch { return false; }
}, 'Use an HTTPS URL or a local /asset path.');
function schema(field: Field): z.ZodType {
  let value: z.ZodType;
  switch (field.kind) {
    case 'object': value = z.object(Object.fromEntries(field.fields!.map(item => [item.name, schema(item)]))); break;
    case 'array': { let items = z.array(schema({ ...field.of!, required: true })).max(field.max ?? 100); if (field.min) items = items.min(field.min); value = items; break; }
    case 'image': value = z.object({ url: publicUrl, alt: z.string().trim().min(1).max(500) }); break;
    case 'file': case 'url': value = publicUrl; break;
    case 'email': value = z.email(); break;
    case 'enum': value = z.enum(field.options as [string, ...string[]]); break;
    case 'number': value = z.number().finite(); break;
    case 'boolean': value = z.boolean(); break;
    case 'slug': value = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100); break;
    default: value = z.string().max(field.kind === 'text' ? 20000 : 1000); if (field.required) value = (value as z.ZodString).trim().min(1);
  }
  if (field.name === 'revision') value = z.string().regex(/^[a-f0-9]{40}$/i, 'Use a full reviewed Git SHA.');
  if (field.name === 'siteUrl') value = z.string().url().refine(value => { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash; }, 'Use the HTTPS website origin without credentials, a path, query, or fragment.');
  return field.required ? value : value.nullish().transform(item => item ?? undefined);
}
const projectShape = Object.fromEntries(projectFields.filter(field => field.name !== 'documentation').map(field => [field.name, schema(field)]));
const documentationSchema = schema(projectFields.find(field => field.name === 'documentation')!);
const snapshotSchema = z.object({ version: z.literal(1), profile: z.object(Object.fromEntries(profileFields.map(field => [field.name, schema(field)]))), projects: z.array(z.object({ ...projectShape, id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100), number: z.string().regex(/^\d{2,}$/) })).max(100), documentation: z.record(z.string(), documentationSchema) });

export function validateSnapshot(input: unknown) {
  const result = snapshotSchema.safeParse(input);
  if (!result.success) throw new Error(`Content validation failed: ${result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`);
  const ids = result.data.projects.map(project => project.id as string);
  if (new Set(ids).size !== ids.length) throw new Error('Content validation failed: project URL slugs must be unique.');
  for (const id of ids) if (!Object.hasOwn(result.data.documentation, id)) throw new Error(`Missing documentation for project ${id}.`);
  return result.data;
}

export const publishedQuery = `{
  "settings": *[_type == "portfolioSettings" && _id == "portfolio-settings"][0]{profile{...,
    "photo": photo{"url": asset->url, alt}, "resumeUrl": resumeUrl.asset->url}},
  "projects": *[_type == "portfolioProject" && !(_id in path("drafts.**"))] | order(order asc, _createdAt asc){...,
    "id": slug.current, "image": image{"url": asset->url, alt}, "diagram": diagram{"url": asset->url, alt}}
}`;

export function snapshotFromSanity(data: { settings?: { profile?: unknown } | null; projects?: Record<string, unknown>[] }) {
  if (!data.settings?.profile || !Array.isArray(data.projects)) throw new Error('Publish the Profile & site settings document before building from Sanity.');
  const projects: (Record<string, unknown> & { number: string })[] = data.projects.map((project, index) => ({ ...project, number: String(index + 1).padStart(2, '0') }));
  const documentation = Object.fromEntries(projects.map(project => [String(project.id), project.documentation]));
  // An empty project list is intentional: deletion/unpublishing never resurrects seed projects.
  const optimize = (value: unknown, width: number) => {
    if (!value || typeof value !== 'object') return value;
    const image = value as { url?: string; alt?: string };
    if (!image.url?.startsWith('https://cdn.sanity.io/images/')) return value;
    const url = new URL(image.url); url.searchParams.set('w', String(width)); url.searchParams.set('fit', 'max'); url.searchParams.set('auto', 'format');
    return { ...image, url: url.href };
  };
  const profile = data.settings.profile as Record<string, unknown>;
  return validateSnapshot({ version: 1, profile: { ...profile, photo: optimize(profile.photo, 960) }, projects: projects.map(project => ({ ...project, image: optimize(project.image, 1400), diagram: optimize(project.diagram, 2560) })), documentation });
}

export async function loadPortfolio(env: Record<string, string | undefined>) {
  if (env.PORTFOLIO_CONTENT_FILE) return validateSnapshot(JSON.parse(await readFile(env.PORTFOLIO_CONTENT_FILE, 'utf8')));
  const source = env.CONTENT_SOURCE ?? 'local';
  if (source === 'local') return validateSnapshot(JSON.parse(await readFile(new URL('./portfolio.json', import.meta.url), 'utf8')));
  if (source !== 'sanity') throw new Error('CONTENT_SOURCE must be local or sanity.');
  if (!env.SANITY_PROJECT_ID || !env.SANITY_DATASET) throw new Error('Set SANITY_PROJECT_ID and SANITY_DATASET for Sanity builds.');
  const client = createClient({ projectId: env.SANITY_PROJECT_ID, dataset: env.SANITY_DATASET, apiVersion: '2025-02-19', useCdn: false, perspective: 'published', token: env.SANITY_READ_TOKEN, timeout: 15000, maxRetries: 1 });
  let data;
  try { data = await client.fetch(publishedQuery, {}, { perspective: 'published' }); }
  catch { throw new Error('Sanity content could not be read. Check project/dataset settings and the server-only read token if the dataset is private. The previous deployment remains available.'); }
  return snapshotFromSanity(data);
}
