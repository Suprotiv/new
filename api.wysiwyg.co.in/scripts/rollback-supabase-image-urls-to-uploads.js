const fs = require('fs');
const path = require('path');
const { getSupabase } = require('../db');
const dataStore = require('../dataStore');
const { publicUploadPath, safeFileName } = require('../storage');

const IMAGES_ROOT = path.join(__dirname, '..', 'images');
const SUPABASE_STORAGE_MARKER = '/storage/v1/object/public/';
const IMAGE_EXTENSIONS = new Set([
  '.avif',
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.webp',
]);

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkFiles(entryPath);
    if (!entry.isFile()) return [];
    return [entryPath];
  });
}

function toPosixPath(value) {
  return value.split(path.sep).join('/');
}

function buildLegacyImageMap() {
  const map = new Map();

  for (const filePath of walkFiles(IMAGES_ROOT)) {
    const ext = path.extname(filePath).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) continue;

    const relativePath = toPosixPath(path.relative(IMAGES_ROOT, filePath));
    const directory = path.posix.dirname(relativePath);
    const safePath = path.posix.join(
      directory === '.' ? '' : directory,
      safeFileName(path.basename(relativePath))
    );

    map.set(safePath, relativePath);
  }

  return map;
}

function getSupabaseObjectPath(value) {
  if (typeof value !== 'string') return '';

  const markerIndex = value.indexOf(SUPABASE_STORAGE_MARKER);
  if (markerIndex === -1) return '';

  const bucketAndPath = decodeURIComponent(value.slice(markerIndex + SUPABASE_STORAGE_MARKER.length));
  const slashIndex = bucketAndPath.indexOf('/');
  if (slashIndex === -1) return '';

  return bucketAndPath.slice(slashIndex + 1);
}

function removeMigrationPrefix(filename) {
  return filename.replace(/^\d+-\d+-/, '');
}

function toUploadPath(value, legacyImageMap) {
  const objectPath = getSupabaseObjectPath(value);
  if (!objectPath) return value;

  const directory = path.posix.dirname(objectPath);
  const filename = path.posix.basename(objectPath);
  const safeLegacyPath = path.posix.join(
    directory === '.' ? '' : directory,
    removeMigrationPrefix(filename)
  );
  const legacyRelativePath = legacyImageMap.get(safeLegacyPath) || safeLegacyPath;

  return publicUploadPath(legacyRelativePath);
}

function convertProject(project, legacyImageMap) {
  const nextImages = {};
  for (const [group, images] of Object.entries(project.images || {})) {
    nextImages[group] = Array.isArray(images)
      ? images.map(imagePath => toUploadPath(imagePath, legacyImageMap))
      : images;
  }

  return {
    ...project,
    mainImage: toUploadPath(project.mainImage, legacyImageMap),
    images: nextImages,
  };
}

function hasChanged(before, after) {
  return JSON.stringify(before) !== JSON.stringify(after);
}

async function rollbackProjects(legacyImageMap) {
  let count = 0;
  const projects = await dataStore.getProjects();

  for (const project of projects) {
    const nextProject = convertProject(project, legacyImageMap);
    if (!hasChanged(project, nextProject)) continue;

    await dataStore.updateProject(project.project_id, nextProject);
    count += 1;
  }

  return count;
}

async function rollbackTeam(legacyImageMap) {
  let count = 0;
  const members = await dataStore.getTeamMembers();

  for (const member of members) {
    const nextImage = toUploadPath(member.image, legacyImageMap);
    if (nextImage === member.image) continue;

    await dataStore.updateTeamMember(member.id, { ...member, image: nextImage });
    count += 1;
  }

  return count;
}

async function rollbackClients(legacyImageMap) {
  let count = 0;
  const clients = await dataStore.getClients();

  for (const client of clients) {
    const nextClient = {
      ...client,
      bwImage: toUploadPath(client.bwImage, legacyImageMap),
      colorImage: toUploadPath(client.colorImage, legacyImageMap),
    };
    if (!hasChanged(client, nextClient)) continue;

    await dataStore.updateClientRecord(client.id, nextClient);
    count += 1;
  }

  return count;
}

async function rollbackSiteContent(legacyImageMap) {
  let count = 0;
  const { data, error } = await getSupabase()
    .from('site_content')
    .select('key, type, value')
    .eq('type', 'image');

  if (error) throw error;

  for (const row of data || []) {
    const nextValue = toUploadPath(row.value, legacyImageMap);
    if (nextValue === row.value) continue;

    await dataStore.updateSiteImage(row.key, nextValue, { text: {}, images: {} });
    count += 1;
  }

  return count;
}

async function main() {
  const legacyImageMap = buildLegacyImageMap();
  const results = {
    projects: await rollbackProjects(legacyImageMap),
    teamMembers: await rollbackTeam(legacyImageMap),
    clients: await rollbackClients(legacyImageMap),
    siteImages: await rollbackSiteContent(legacyImageMap),
  };

  console.log('Rolled back Supabase Storage image URLs to local upload paths:');
  console.log(JSON.stringify(results, null, 2));
}

main().catch(error => {
  console.error('Failed to roll back image URLs:', error);
  process.exit(1);
});
