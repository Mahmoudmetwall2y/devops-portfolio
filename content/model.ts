// One field model drives the editor and build validation. Public data contains no credentials.
export type Field = { name: string; title: string; kind: 'string' | 'text' | 'url' | 'email' | 'number' | 'boolean' | 'enum' | 'object' | 'array' | 'image' | 'file' | 'slug'; required?: boolean; fields?: Field[]; of?: Field; options?: string[]; min?: number; max?: number; description?: string };
const field = (name: string, title: string, kind: Field['kind'] = 'string', extra: Partial<Field> = {}): Field => ({ name, title, kind, ...extra });
const text = (name: string, title: string, required = true) => field(name, title, 'text', { required });
const strings = (name: string, title: string, min = 0) => field(name, title, 'array', { of: field('item', 'Item'), min, required: true });
const object = (name: string, title: string, fields: Field[], required = true) => field(name, title, 'object', { fields, required });
const array = (name: string, title: string, fields: Field[], min = 0) => field(name, title, 'array', { of: object('item', 'Item', fields), min, required: true });
const url = (name: string, title: string, required = true) => field(name, title, 'url', { required });
const links = (name: string, title: string) => array(name, title, [text('label', 'Label'), url('url', 'URL')]);

export const profileFields: Field[] = [
  text('fullName', 'Full name'), text('displayName', 'Display name'), text('brandName', 'Brand name'),
  { ...strings('nameLines', 'Headline name lines', 2), max: 2 },
  field('contactEmail', 'Contact email', 'email', { required: true }), url('githubUrl', 'GitHub URL'), url('linkedinUrl', 'LinkedIn URL'),
  field('photo', 'Portrait photo', 'image', { required: true, description: 'Used in both portrait positions. Include useful alternative text.' }),
  field('resumeUrl', 'CV / résumé PDF', 'file', { required: true }), url('siteUrl', 'Public website URL', true),
  strings('aboutParagraphs', 'Biography paragraphs', 1),
  object('hero', 'Hero content', [text('role', 'Professional role'), text('location', 'Location and current role'), { ...strings('headline', 'Professional statement lines', 2), max: 2 }, text('description', 'Introduction'), text('proofLabel', 'Responsibility description'), { ...array('proof', 'Responsibility facts', [text('value', 'Value'), text('label', 'Label')]), max: 3 }]),
  array('experience', 'Professional experience', [text('company', 'Organization'), text('role', 'Role'), text('period', 'Period'), field('current', 'Current role', 'boolean', { required: true }), text('summary', 'Short summary'), text('details', 'Responsibilities'), strings('tools', 'Tools')], 1),
  object('education', 'Education', [text('year', 'Year'), text('degree', 'Degree'), text('university', 'University'), text('languages', 'Languages')]),
  object('leadership', 'Leadership', [text('teamSize', 'Team size'), text('eyebrow', 'Role label'), text('title', 'Title'), text('description', 'Description')]),
];

export const caseFields: Field[] = [
  field('revision', 'Reviewed Git commit SHA', 'string', { required: true, description: '40-character source revision reviewed for this case study.' }), text('status', 'Evidence status'), text('learningContext', 'Learning context', false), text('contribution', 'My implementation'),
  { ...links('contributionEvidence', 'Contribution links'), required: false },
  object('architecture', 'Architecture', [text('description', 'Architecture explanation'), array('lanes', 'Architecture lanes', [text('title', 'Lane title'), array('nodes', 'Components in flow order', [text('title', 'Component'), text('detail', 'Responsibility'), text('via', 'Connection from previous component', false)], 1)], 1)]),
  array('decisions', 'Decisions and tradeoffs', [text('choice', 'Decision'), text('tradeoff', 'Tradeoff')]), strings('delivery', 'Delivery steps'), strings('security', 'Security and reliability'),
  { ...strings('observability', 'Observability'), required: false },
  object('verification', 'Verification and evidence', [text('summary', 'What is actually verified'), object('execution', 'Recorded execution', [text('label', 'Run label'), url('url', 'Run URL')], false), strings('limitations', 'Evidence limits and gaps')]),
  strings('lessons', 'Engineering lessons'), strings('next', 'Proposed next improvements'),
];
export const documentationFields: Field[] = [
  text('subtitle', 'Article subtitle'), text('focus', 'Engineering focus'),
  array('repository', 'Repository guide', [text('path', 'File or directory path'), text('purpose', 'Purpose')]),
  array('prerequisites', 'Environment and prerequisites', [text('title', 'Requirement'), text('detail', 'Explanation')]),
  array('walkthrough', 'Implementation walkthrough', [text('title', 'Step title'), text('detail', 'Explanation'), text('source', 'Source file path')]),
  array('commands', 'Validation command examples', [text('title', 'Title'), text('detail', 'Prerequisites and expected interpretation'), text('code', 'Commands'), text('source', 'Source file path', false)]),
  array('troubleshooting', 'Troubleshooting', [text('symptom', 'Symptom'), text('checks', 'Diagnostic steps')]),
];
export const projectFields: Field[] = [
  field('id', 'URL slug', 'slug', { required: true, description: 'Stable lowercase URL identifier. Changing this changes the public project URL.' }),
  text('title', 'Project title'), text('category', 'Category'), text('kind', 'Project type'), text('summary', 'Card summary'), text('description', 'Project overview'), strings('tags', 'Technologies'), url('repo', 'Repository URL'), text('challenge', 'Engineering challenge'), strings('approach', 'Implementation details'),
  array('evidence', 'Source evidence', [text('label', 'Label'), text('detail', 'Explanation'), url('url', 'Evidence URL')]),
  strings('architecture', 'Architecture keywords'),
  field('accent', 'Card accent', 'enum', { options: ['lime', 'blue', 'orange'], required: true }),
  field('filters', 'Project filters', 'array', { of: field('item', 'Filter', 'enum', { options: ['cloud', 'delivery'] }), required: true }),
  object('foundation', 'Upstream application credit', [text('label', 'Credit label'), url('url', 'Upstream URL')], false),
  field('graphic', 'Fallback card illustration', 'enum', { options: ['three-tier', 'space-cargo', 'ultimate-devops'] }),
  field('image', 'Project card image', 'image'), field('diagram', 'Architecture diagram image', 'image', { description: 'The labeled architecture remains available as a text equivalent below this image.' }),
  object('caseStudy', 'Engineering case study', caseFields), object('documentation', 'Full project documentation', documentationFields),
];
