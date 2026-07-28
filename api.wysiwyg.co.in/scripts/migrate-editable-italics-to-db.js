require('dotenv').config();

const { getSupabase } = require('../db');

const FULL_ITALIC_KEYS = new Set([
  'about.hero.accent',
  'home.hero.title.accent',
  'home.story.accent',
  'home.collage.heading',
]);

const PRESERVE_EXISTING_ITALICS_KEYS = new Set([
  'home.news.manifesto',
]);

const FALLBACK_VALUES = {
  'about.hero.accent': 'Designers',
  'home.hero.title.accent': 'we disrupt',
  'home.story.accent': 'design mainstay',
  'home.collage.heading': 'Design with guts,',
  'home.prefooter.copy':
    'Creativity isn’t clean. It’s messy,\n' +
    'unpredictable and beautifully chaotic.\n' +
    'That’s where the magic happens— and\n' +
    'where the best stories are born.',
};

function normalizeFontSize(value) {
  const size = Number(value);
  return Number.isFinite(size) && size >= 8 && size <= 120 ? size : null;
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
      ...(mark.value === undefined ? {} : { value: mark.value }),
    }))
    .filter(
      mark =>
        mark.to > mark.from &&
        (mark.type === 'italic' || mark.type === 'color')
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
      colorStack.push({ from: text.length, value: token.slice(7, -1) });
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

function applyLayoutItalics(key, originalDocument) {
  const documentValue = normalizeDocument(originalDocument);
  const nonItalicMarks = documentValue.marks.filter(
    mark => mark.type !== 'italic'
  );
  let italicMarks = [];

  if (PRESERVE_EXISTING_ITALICS_KEYS.has(key)) {
    italicMarks = documentValue.marks.filter(mark => mark.type === 'italic');
  } else if (FULL_ITALIC_KEYS.has(key) && documentValue.text.length) {
    italicMarks = [
      { type: 'italic', from: 0, to: documentValue.text.length },
    ];
  } else if (key === 'home.prefooter.copy' && documentValue.text.length) {
    const lastLineStart = documentValue.text.lastIndexOf('\n') + 1;
    italicMarks = [
      {
        type: 'italic',
        from: lastLineStart,
        to: documentValue.text.length,
      },
    ];
  }

  return normalizeDocument({
    ...documentValue,
    marks: [...nonItalicMarks, ...italicMarks],
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
  const requiredKeys = new Set([
    ...FULL_ITALIC_KEYS,
    ...PRESERVE_EXISTING_ITALICS_KEYS,
    'home.prefooter.copy',
  ]);
  const keys = new Set([...rowsByKey.keys(), ...requiredKeys]);
  const updates = [];

  for (const key of keys) {
    const row = rowsByKey.get(key);
    const source = row?.value ?? FALLBACK_VALUES[key];
    if (source === undefined) {
      console.warn(`Skipped missing content without a fallback: ${key}`);
      continue;
    }
    const nextValue = JSON.stringify(
      applyLayoutItalics(key, parseDocument(source))
    );
    if (!row || row.value !== nextValue) {
      updates.push({ key, type: 'text', value: nextValue });
    }
  }

  if (!updates.length) {
    console.log('Editable text italics are already normalized.');
    return;
  }

  const { error: updateError } = await db
    .from('site_content')
    .upsert(updates, { onConflict: 'key' });
  if (updateError) throw updateError;

  console.log(
    `Normalized ${updates.length} editable text entr${updates.length === 1 ? 'y' : 'ies'}.`
  );
  console.log(
    `Full italics: ${[...FULL_ITALIC_KEYS].join(', ')}`
  );
  console.log('Partial italics: home.prefooter.copy (final line)');
  console.log('Preserved range italics: home.news.manifesto');
}

main().catch(error => {
  console.error('Editable italics migration failed:', error);
  process.exitCode = 1;
});
