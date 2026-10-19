import { getCliClient } from 'sanity/cli';
import { randomUUID } from 'node:crypto';
import { publishedQuery, snapshotFromSanity } from '../../content/load.ts';

// A temporary draft only: never publishes or changes the owner's content.
const client = getCliClient({ apiVersion: '2025-02-19' }).withConfig({ useCdn: false, perspective: 'raw' });
const id = `drafts.portfolio-verification-${randomUUID()}`;
try {
  await client.create({ _id: id, _type: 'portfolioProject', title: 'Temporary draft verification', slug: { _type: 'slug', current: 'temporary-verification' }, order: 9999 });
  await client.patch(id).set({ title: 'Updated temporary draft verification' }).commit();
  const draft = await client.getDocument<{ title: string }>(id);
  if (draft?.title !== 'Updated temporary draft verification') throw new Error('Draft update was not saved.');
  const publicCount = await client.withConfig({ perspective: 'published' }).fetch<number>('count(*[_id in $ids])', { ids: [id, id.replace(/^drafts\./, '')] });
  if (publicCount !== 0) throw new Error('Temporary draft unexpectedly appeared in published content.');
} finally {
  await client.delete(id);
}
if (await client.getDocument(id)) throw new Error('Temporary draft was not deleted.');
const counts = await client.fetch('{"drafts":count(*[_type in ["portfolioSettings","portfolioProject"] && _id in path("drafts.**")]),"published":count(*[_type in ["portfolioSettings","portfolioProject"] && !(_id in path("drafts.**"))])}');
console.log(JSON.stringify({ createUpdateReadDelete: 'passed', draftExcludedFromPublished: true, temporaryDraftDeleted: true, remainingContent: counts }, null, 2));
// The authenticated drafts perspective overlays draft edits on published data.
// This also works after the initial drafts have been published. Nothing is
// published or persisted to the public build by this verification script.
const snapshot = snapshotFromSanity(await client.withConfig({ perspective: 'drafts' }).fetch(publishedQuery));
console.log(`Editorial build projection validated: profile and ${snapshot.projects.length} projects, including documentation and uploaded media.`);
