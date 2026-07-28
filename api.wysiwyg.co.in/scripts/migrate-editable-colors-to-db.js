require('dotenv').config();

const { getSupabase } = require('../db');

const DEFAULT_COLOR = '#000000';

// Colors previously supplied by the current layout through inherited CSS.
const LAYOUT_COLORS = {
  'about.hero.accent': '#b65a2a',
  'about.hero.line1': '#fefdf8',
  'about.hero.line2': '#fefdf8',
  'about.hero.line3': '#fefdf8',
  'contact.email': '#5a6b3e',
  'home.hero.title.line1': '#ffffff',
  'home.hero.title.line2': '#ffffff',
  'home.hero.title.accent': '#72814b',
  'home.news.manifesto': '#111010',
  'home.featured.title': '#fefdf8',
  'home.featured.category': '#ffffff',
  'home.featured.type': '#ffffff',
  'home.story.heading': '#111010',
  'home.story.accent': '#111010',
  'home.featured.description': '#404040',
  'home.collage.heading': '#ffffff',
  'home.collage.subheading': '#ffffff',
  'home.work.panel1.caption': '#fafafa',
  'home.work.panel2.caption': '#fafafa',
  'home.work.panel3.caption': '#fafafa',
  'home.stats.1.value': '#111010',
  'home.stats.1.label': '#111010',
  'home.stats.1.subLabel': '#111010',
  'home.stats.2.value': '#fefdf8',
  'home.stats.2.label': '#fefdf8',
  'home.stats.2.subLabel': '#fefdf8',
  'home.stats.3.value': '#111010',
  'home.stats.3.label': '#111010',
  'home.stats.3.subLabel': '#111010',
  'home.stats.4.value': '#fefdf8',
  'home.stats.4.label': '#fefdf8',
  'home.stats.4.subLabel': '#fefdf8',
  'home.prefooter.copy': '#e8e8e8',
};

const FALLBACK_VALUES = {
  'about.hero.accent': 'Designers',
  'about.hero.line1': 'aren’t one role.',
  'about.hero.line2': 'They’re multiple roles',
  'about.hero.line3': 'with one job title.',
  'contact.email': 'business@wysiwyg.co.in',
};

function normalizeFontSize(value) {
  const size = Number(value);
  return Number.isFinite(size) && size >= 8 && size <= 120 ? size : null;
}

function normalizeColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || ''))
    ? String(value).toLowerCase()
    : null;
}

function normalizeDocument(documentValue) {
  const text = String(documentValue?.text || '');
  const legacyFontSize = documentValue?.marks?.find(
    mark => mark.type === 'fontSize'
  )?.value;
  const fontSize = normalizeFontSize(
    documentValue?.fontSize ?? legacyFontSize
  );
  const marks = (Array.isArray(documentValue?.marks)
    ? documentValue.marks
    : [])
    .map(mark => ({
      type: mark.type,
      from: Math.max(0, Math.min(text.length, Number(mark.from) || 0)),
      to: Math.max(0, Math.min(text.length, Number(mark.to) || 0)),
      ...(mark.type === 'color'
        ? { value: normalizeColor(mark.value) }
        : {}),
    }))
    .filter(
      mark =>
        mark.to > mark.from &&
        (mark.type === 'italic' ||
          (mark.type === 'color' && Boolean(mark.value)))
    );

  return { version: 1, text, marks, fontSize };
}

function legacyMarkupToDocument(sourceValue) {
  const source = String(sourceValue ?? '');
  const tokenPattern =
    /(\[color=#[0-9a-fA-F]{6}\]|\[\/color\]|\[size=\d{1,3}\]|\[\/size\]|\*)/g;
  const marks = [];
  const colorStack = [];
  const sizeStack = [];
  let italicStart = null;
  let text = '';
  let cursor = 0;
  let match;

  const closeMark = (stack, type) => {
    const opened = stack.pop();
    if (opened && text.length > opened.from) {
      marks.push({
        type,
        from: opened.from,
        to: text.length,
        value: opened.value,
      });
    }
  };

  while ((match = tokenPattern.exec(source)) !== null) {
    text += source.slice(cursor, match.index);
    const token = match[0];
    if (token === '*') {
      if (italicStart === null) {
        italicStart = text.length;
      } else {
        if (text.length > italicStart) {
          marks.push({ type: 'italic', from: italicStart, to: text.length });
        }
        italicStart = null;
      }
    } else if (token.startsWith('[color=')) {
      colorStack.push({
        from: text.length,
        value: token.slice(7, -1).toLowerCase(),
      });
    } else if (token === '[/color]') {
      closeMark(colorStack, 'color');
    } else if (token.startsWith('[size=')) {
      sizeStack.push({
        from: text.length,
        value: Number(token.slice(6, -1)),
      });
    } else if (token === '[/size]') {
      closeMark(sizeStack, 'fontSize');
    }
    cursor = match.index + token.length;
  }

  text += source.slice(cursor);
  if (italicStart !== null && text.length > italicStart) {
    marks.push({ type: 'italic', from: italicStart, to: text.length });
  }
  while (colorStack.length) closeMark(colorStack, 'color');
  while (sizeStack.length) closeMark(sizeStack, 'fontSize');

  return normalizeDocument({ version: 1, text, marks });
}

function parseDocument(value) {
  const source = String(value ?? '');
  try {
    const parsed = JSON.parse(source);
    if (
      parsed?.version === 1 &&
      typeof parsed.text === 'string' &&
      Array.isArray(parsed.marks)
    ) {
      return normalizeDocument(parsed);
    }
  } catch {
    // Plain text and legacy markup are converted below.
  }
  return legacyMarkupToDocument(source);
}

function applyLayoutColor(key, originalDocument) {
  const documentValue = normalizeDocument(originalDocument);
  if (!documentValue.text.length) return documentValue;

  const baseColor = LAYOUT_COLORS[key] || DEFAULT_COLOR;
  const existingColors = documentValue.marks.filter(
    mark => mark.type === 'color'
  );
  const nonColorMarks = documentValue.marks.filter(
    mark => mark.type !== 'color'
  );
  const partialColors = existingColors.filter(
    mark => mark.from > 0 || mark.to < documentValue.text.length
  );

  return normalizeDocument({
    ...documentValue,
    marks: [
      ...nonColorMarks,
      { type: 'color', from: 0, to: documentValue.text.length, value: baseColor },
      ...partialColors,
    ],
  });
}

async function main() {
  const db = getSupabase();
  const { data, error } = await db
    .from('site_content')
    .select('key, type, value')
    .eq('type', 'text');
  if (error) throw error;

  const rowsByKey = new Map((data || []).map(row => [row.key, row]));
  const keys = new Set([...rowsByKey.keys(), ...Object.keys(LAYOUT_COLORS)]);
  const updates = [];

  for (const key of keys) {
    const row = rowsByKey.get(key);
    const source = row?.value ?? FALLBACK_VALUES[key];
    if (source === undefined) {
      console.warn(`Skipped missing content without a fallback: ${key}`);
      continue;
    }
    const nextValue = JSON.stringify(
      applyLayoutColor(key, parseDocument(source))
    );
    if (!row || row.value !== nextValue) {
      updates.push({ key, type: 'text', value: nextValue });
    }
  }

  if (!updates.length) {
    console.log('Editable text colors are already normalized.');
    return;
  }

  const { error: updateError } = await db
    .from('site_content')
    .upsert(updates, { onConflict: 'key' });
  if (updateError) throw updateError;

  console.log(
    `Normalized ${updates.length} editable text color entr${updates.length === 1 ? 'y' : 'ies'}.`
  );
  console.log(`Default color: ${DEFAULT_COLOR}`);
  console.log(
    `Layout colors copied for ${Object.keys(LAYOUT_COLORS).length} keys.`
  );
}

main().catch(error => {
  console.error('Editable color migration failed:', error);
  process.exitCode = 1;
});
