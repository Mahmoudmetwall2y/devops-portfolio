import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { buildLegacyTheme } from 'sanity';
import { schemaTypes } from './src/schema';
import { Dashboard } from './src/Dashboard';
import { DraftPreview } from './src/DraftPreview';

export const studioConfig = defineConfig({
  name: 'portfolio', title: 'Mahmoud / Portfolio', basePath: '/admin', projectId: typeof __SANITY_PROJECT_ID__ === 'string' ? __SANITY_PROJECT_ID__ : '2mn6x81s', dataset: typeof __SANITY_DATASET__ === 'string' ? __SANITY_DATASET__ : 'production',
  theme: buildLegacyTheme({ '--black': '#0e141b', '--white': '#e6edf3', '--gray-base': '#a3afbd', '--brand-primary': '#88e5a2', '--component-bg': '#0e141b', '--component-text-color': '#e6edf3', '--default-button-color': '#88e5a2', '--focus-color': '#8dbbfa' }),
  plugins: [{ name: 'portfolio-dashboard', tools: [{ name: 'dashboard', title: 'Dashboard', component: Dashboard }] }, structureTool({
    title: 'Content',
    structure: S => S.list().title('Portfolio content').items([
      S.listItem().title('Profile & site settings').child(S.document().schemaType('portfolioSettings').documentId('portfolio-settings').views([S.view.form().title('Edit'), S.view.component(DraftPreview).title('Preview draft')])),
      S.documentTypeListItem('portfolioProject').title('Projects & documentation'),
    ]),
    defaultDocumentNode: (S, { schemaType }) => S.document().views(schemaType === 'portfolioProject' ? [S.view.form().title('Edit'), S.view.component(DraftPreview).title('Preview draft')] : [S.view.form()]),
  })],
  schema: { types: schemaTypes, templates: templates => templates.filter(template => template.schemaType !== 'portfolioSettings') },
  document: { actions: (actions, context) => context.schemaType === 'portfolioSettings' ? actions.filter(action => !['delete', 'duplicate', 'unpublish'].includes(action.action ?? '')) : actions },
});
export default studioConfig;
