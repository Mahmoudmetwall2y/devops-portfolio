import { getCliClient } from 'sanity/cli';
import { publishedQuery, snapshotFromSanity } from '../../content/load.ts';

// Explicitly invoked for the owner's approved first deployment. Never runs in a build.
const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false, perspective: 'raw' });
const ids = ['portfolio-settings', 'portfolio-project-three-tier', 'portfolio-project-space-cargo', 'portfolio-project-ultimate-devops'];
const rows = await client.fetch<{ _id: string; _rev: string }[]>('*[_id in $ids]{_id,_rev}', { ids: [...ids, ...ids.map(id => `drafts.${id}`)] });
const selected = ids.map(id => {
  const row = rows.find(item => item._id === `drafts.${id}`) ?? rows.find(item => item._id === id);
  if (!row) throw new Error(`Missing initial content: ${id}`);
  return row;
});
const settings = selected[0];
await client.patch(settings._id).ifRevisionId(settings._rev).set({ 'profile.siteUrl': 'https://mahmoudmetwall2y.tech' }).commit();
const previewQuery = publishedQuery.replace('_id == "portfolio-settings"', '_id == $settingsId').replace('!(_id in path("drafts.**"))', '_id in $projectIds');
const preview = snapshotFromSanity(await client.fetch(previewQuery, { settingsId: settings._id, projectIds: selected.slice(1).map(row => row._id) }));
if (preview.projects.length !== 3) throw new Error('Expected three projects in the first release.');
const current = await client.fetch<{ _id: string; _rev: string }[]>('*[_id in $ids]{_id,_rev}', { ids: ids.map(id => `drafts.${id}`) });
if (current.length) await client.action(current.map(draft => ({ actionType: 'sanity.action.document.publish' as const, draftId: draft._id, publishedId: draft._id.replace(/^drafts\./, ''), ifDraftRevisionId: draft._rev })));
const published = snapshotFromSanity(await client.withConfig({ perspective: 'published' }).fetch(publishedQuery));
console.log(`Published and validated profile plus ${published.projects.length} projects. Canonical origin: ${published.profile.siteUrl}`);
