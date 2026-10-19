import { getCliClient } from 'sanity/cli';
import { readFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';
import { profileFields, projectFields, type Field } from '../../content/model.ts';

const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false, perspective: 'raw' });
const publicDirectory = fileURLToPath(new URL('../../public/', import.meta.url));
const seed = JSON.parse(await readFile(new URL('../../content/portfolio.json', import.meta.url), 'utf8'));
async function upload(path: string, kind: 'image' | 'file') {
  const local = resolve(publicDirectory, path.replace(/^\//, ''));
  if (relative(publicDirectory, local).startsWith('..') || !path.startsWith('/assets/')) throw new Error('Seed asset must be inside public/assets.');
  const asset = await client.assets.upload(kind, createReadStream(local), { filename: kind === 'image' ? 'mahmoud.jpg' : 'mahmoud-metwally-cv.pdf', contentType: kind === 'image' ? 'image/jpeg' : 'application/pdf' });
  return { _type: kind, asset: { _type: 'reference', _ref: asset._id } };
}
function convert(field: Field, value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  if (field.kind === 'slug') return { _type: 'slug', current: value };
  if (field.kind === 'array') return (value as unknown[]).map((item, index) => {
    if (field.of!.kind !== 'object') return item;
    return { _key: `${field.name}-${index}`, _type: `${field.name}Item`, ...convert(field.of!, item) as object };
  });
  if (field.kind === 'object') return Object.fromEntries(field.fields!.map(child => [child.name === 'id' ? 'slug' : child.name, convert(child, (value as Record<string, unknown>)[child.name])]).filter(([, item]) => item !== undefined));
  return value;
}
const profileId = 'portfolio-settings';
const ids = [profileId, ...seed.projects.map((project: { id: string }) => `portfolio-project-${project.id}`)];
const existing = await client.fetch<string[]>('*[_id in $ids]._id', { ids: [...ids, ...ids.map(id => `drafts.${id}`)] });
const records: Record<string, unknown>[] = [];
if (!existing.includes(profileId) && !existing.includes(`drafts.${profileId}`)) {
  const photo = await upload(seed.profile.photo.url, 'image');
  const cv = await upload(seed.profile.resumeUrl, 'file');
  const profile = Object.fromEntries(profileFields.map(field => [field.name, convert(field, seed.profile[field.name])]));
  records.push({ _id: `drafts.${profileId}`, _type: 'portfolioSettings', profile: { ...profile, photo: { ...photo, alt: seed.profile.photo.alt }, resumeUrl: cv } });
}
for (const [index, project] of (seed.projects as Record<string, unknown>[]).entries()) {
  const id = `portfolio-project-${project.id}`;
  if (existing.includes(id) || existing.includes(`drafts.${id}`)) continue;
  const value = { ...project, graphic: project.id, documentation: seed.documentation[String(project.id)] };
  records.push({ _id: `drafts.${id}`, _type: 'portfolioProject', order: (index + 1) * 10, ...Object.fromEntries(projectFields.map(field => [field.name === 'id' ? 'slug' : field.name, convert(field, value[field.name as keyof typeof value])]).filter(([, item]) => item !== undefined)) });
}
if (records.length) {
  let transaction = client.transaction();
  for (const record of records) transaction = transaction.createIfNotExists(record as { _id: string; _type: string });
  await transaction.commit();
}
console.log(`Imported ${records.length} draft documents. Existing drafts and published documents were preserved. Nothing was published.`);
