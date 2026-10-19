import { useClient } from 'sanity';
import { profileFields, projectFields, type Field } from '../../content/model.ts';
import './dashboard.css';

type Value = Record<string, unknown>;
function assetUrl(value: unknown, projectId: string, dataset: string) {
  const record = value as { asset?: { _ref?: string } } | undefined;
  const ref = record?.asset?._ref;
  const image = ref?.match(/^image-([a-zA-Z0-9]+)-(\d+x\d+)-([a-zA-Z0-9]+)$/);
  if (image) return `https://cdn.sanity.io/images/${projectId}/${dataset}/${image[1]}-${image[2]}.${image[3]}?w=1200&fit=max&auto=format`;
  const file = ref?.match(/^file-([a-zA-Z0-9]+)-([a-zA-Z0-9]+)$/);
  return file ? `https://cdn.sanity.io/files/${projectId}/${dataset}/${file[1]}.${file[2]}` : undefined;
}

function Fields({ fields, value, projectId, dataset }: { fields: Field[]; value: Value; projectId: string; dataset: string }) {
  return <dl className="cms-preview-fields">{fields.map(field => {
    const item = field.kind === 'slug' ? (value.slug as { current?: string })?.current : value[field.name];
    if (item === undefined || item === null || item === '' || (Array.isArray(item) && !item.length)) return null;
    const url = ['image', 'file'].includes(field.kind) ? assetUrl(item, projectId, dataset) : undefined;
    return <div key={field.name}><dt>{field.title}</dt><dd>{field.kind === 'object' ? <Fields fields={field.fields!} value={item as Value} projectId={projectId} dataset={dataset} /> : field.kind === 'array' ? <ol>{(item as unknown[]).map((entry, index) => <li key={(entry as Value)?._key as string ?? index}>{field.of!.kind === 'object' ? <Fields fields={field.of!.fields!} value={entry as Value} projectId={projectId} dataset={dataset} /> : String(entry)}</li>)}</ol> : field.kind === 'image' ? url ? <img src={url} alt={String((item as Value).alt ?? '')} /> : <p>Upload an image to preview it.</p> : field.kind === 'file' ? url ? <a href={url} target="_blank" rel="noreferrer">Open uploaded PDF</a> : <p>Upload a PDF to preview it.</p> : field.name === 'code' ? <pre>{String(item)}</pre> : <p>{String(item)}</p>}</dd></div>;
  })}</dl>;
}

export function DraftPreview({ document }: { document: { displayed: Value } }) {
  const value = document.displayed;
  const client = useClient({ apiVersion: '2025-02-19' });
  const { projectId = '', dataset = '' } = client.config();
  const profile = value._type === 'portfolioSettings';
  return <main className="cms-preview"><p className="cms-eyebrow">LOCAL DRAFT CONTENT PREVIEW</p><h1>{profile ? 'Profile & site settings' : String(value.title ?? 'Untitled project')}</h1><p className="cms-muted">This preview reads the current draft, including unpublished edits. The public portfolio changes after publishing and a successful Netlify rebuild.</p><Fields fields={profile ? profileFields : projectFields} value={profile ? value.profile as Value ?? {} : value} projectId={projectId} dataset={dataset} /></main>;
}
