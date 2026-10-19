import { defineField, defineType, type Rule, type FieldDefinition } from 'sanity';
import { profileFields, projectFields, type Field } from '../../content/model.ts';

function editorField(field: Field, group?: string): FieldDefinition {
  const required = (rule: Rule) => {
    let next = field.required ? rule.required() : rule;
    if (field.kind === 'array' && field.min) next = next.min(field.min);
    if (field.kind === 'array' && field.max) next = next.max(field.max);
    if (field.name === 'revision') next = next.regex(/^[a-f0-9]{40}$/i, { name: 'full Git commit SHA' });
    if (field.kind === 'url') next = next.uri({ scheme: ['https'] });
    if (field.name === 'siteUrl') next = next.custom(value => {
      if (!value) return true;
      try { const url = new URL(String(value)); return url.protocol === 'https:' && !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash ? true : 'Use your HTTPS website origin, for example https://example.com.'; }
      catch { return 'Enter a valid HTTPS website origin.'; }
    });
    return next;
  };
  const common = { name: field.name === 'id' ? 'slug' : field.name, title: field.title, description: field.description, ...(group ? { group } : {}), validation: required };
  if (field.kind === 'object') return { ...common, type: 'object', fields: field.fields!.map(item => editorField(item)), options: { collapsible: true, collapsed: false } };
  if (field.kind === 'array') {
    const item = editorField({ ...field.of!, name: `${field.name}Item`, required: false });
    return { ...common, type: 'array', of: [item], options: field.of!.kind === 'enum' ? { list: field.of!.options } : undefined };
  }
  if (field.kind === 'enum') return { ...common, type: 'string', options: { list: field.options } };
  if (field.kind === 'image') return { ...common, type: 'image', options: { accept: 'image/jpeg,image/png,image/webp,image/avif' }, fields: [defineField({ name: 'alt', title: 'Alternative text', type: 'string', validation: rule => rule.required() })] };
  if (field.kind === 'file') return { ...common, type: 'file', options: { accept: 'application/pdf' } };
  if (field.kind === 'slug') return { ...common, type: 'slug', options: { source: 'title', maxLength: 100, slugify: value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }, validation: rule => rule.required().custom(value => { const slug = (value as { current?: string } | undefined)?.current; return !slug || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? true : 'Use lowercase letters, numbers, and single hyphens.'; }) };
  return { ...common, type: field.kind, ...(field.kind === 'text' ? { rows: field.name === 'code' ? 9 : 4 } : {}) };
}

export const schemaTypes = [
  defineType({ name: 'portfolioSettings', title: 'Profile & site settings', type: 'document', fields: [defineField({ name: 'profile', title: 'Profile and website', type: 'object', fields: profileFields.map(field => editorField(field)), validation: rule => rule.required() })], preview: { select: { title: 'profile.displayName', media: 'profile.photo' }, prepare: ({ title, media }) => ({ title: title ?? 'Profile & site settings', subtitle: 'Photo, biography, CV, contact, experience, and domain', media }) } }),
  defineType({ name: 'portfolioProject', title: 'Project', type: 'document', groups: [{ name: 'overview', title: 'Overview', default: true }, { name: 'presentation', title: 'Images & attribution' }, { name: 'engineering', title: 'Engineering case study' }, { name: 'documentation', title: 'Full documentation' }], fields: [
    defineField({ name: 'order', title: 'Display order', type: 'number', group: 'overview', description: 'Lower numbers appear first. Public project numbers and filters update automatically.', initialValue: 100, validation: rule => rule.required().integer().min(0) }),
    ...projectFields.map(field => editorField(field, field.name === 'caseStudy' ? 'engineering' : field.name === 'documentation' ? 'documentation' : ['graphic', 'image', 'diagram', 'foundation'].includes(field.name) ? 'presentation' : 'overview')),
  ], initialValue: { order: 100, accent: 'blue', graphic: 'three-tier', tags: [], filters: [], architecture: [], approach: [], evidence: [], caseStudy: { status: 'Configuration review pending', decisions: [], delivery: [], security: [], observability: [], lessons: [], next: [], verification: { limitations: [] } }, documentation: { repository: [], prerequisites: [], walkthrough: [], commands: [], troubleshooting: [] } }, orderings: [{ title: 'Display order', name: 'displayOrder', by: [{ field: 'order', direction: 'asc' }] }], preview: { select: { title: 'title', subtitle: 'summary', media: 'image' } } }),
];
