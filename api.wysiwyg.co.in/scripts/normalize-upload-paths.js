require('dotenv').config();

const { getSupabase } = require('../db');

function toRelativeUploadPath(value) {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value)) return value;

  try {
    const url = new URL(value);
    return url.pathname.startsWith('/uploads/')
      ? decodeURIComponent(url.pathname)
      : value;
  } catch {
    return value;
  }
}

function normalizeImageGroups(groups) {
  return Object.fromEntries(
    Object.entries(groups || {}).map(([key, values]) => [
      key,
      Array.isArray(values) ? values.map(toRelativeUploadPath) : values,
    ])
  );
}

function changed(before, after) {
  return JSON.stringify(before) !== JSON.stringify(after);
}

async function normalizeProjects(db) {
  const { data, error } = await db.from('projects').select('project_id, main_image, images');
  if (error) throw error;
  let count = 0;

  for (const row of data || []) {
    const update = {
      main_image: toRelativeUploadPath(row.main_image),
      images: normalizeImageGroups(row.images),
    };
    if (!changed({ main_image: row.main_image, images: row.images }, update)) continue;
    const { error: updateError } = await db.from('projects').update(update).eq('project_id', row.project_id);
    if (updateError) throw updateError;
    count += 1;
  }
  return count;
}

async function normalizeSimpleTable(db, table, idColumn, imageColumns) {
  const { data, error } = await db.from(table).select([idColumn, ...imageColumns].join(','));
  if (error) throw error;
  let count = 0;

  for (const row of data || []) {
    const update = Object.fromEntries(
      imageColumns.map(column => [column, toRelativeUploadPath(row[column])])
    );
    if (!imageColumns.some(column => update[column] !== row[column])) continue;
    const { error: updateError } = await db.from(table).update(update).eq(idColumn, row[idColumn]);
    if (updateError) throw updateError;
    count += 1;
  }
  return count;
}

function normalizeAccoladesJson(value) {
  try {
    const items = JSON.parse(value);
    if (!Array.isArray(items)) return value;
    return JSON.stringify(items.map(item => ({
      ...item,
      image: toRelativeUploadPath(item.image),
    })));
  } catch {
    return value;
  }
}

async function normalizeSiteContent(db) {
  const { data, error } = await db.from('site_content').select('key, type, value');
  if (error) throw error;
  let count = 0;

  for (const row of data || []) {
    const value = row.type === 'image'
      ? toRelativeUploadPath(row.value)
      : row.key === 'home.accolades.items'
        ? normalizeAccoladesJson(row.value)
        : row.value;
    if (value === row.value) continue;
    const { error: updateError } = await db.from('site_content').update({ value }).eq('key', row.key);
    if (updateError) throw updateError;
    count += 1;
  }
  return count;
}

async function main() {
  const db = getSupabase();
  const results = {
    projects: await normalizeProjects(db),
    teamMembers: await normalizeSimpleTable(db, 'team_members', 'id', ['image']),
    clients: await normalizeSimpleTable(db, 'clients', 'id', ['bw_image', 'color_image']),
    siteContent: await normalizeSiteContent(db),
  };

  console.log('Normalized absolute upload URLs to relative paths:');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(error => {
  console.error('Failed to normalize upload paths:', error);
  process.exit(1);
});
