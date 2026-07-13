require('dotenv').config();

const fs = require('fs');
const path = require('path');
const dataStore = require('../dataStore');
const { uploadImageFile } = require('../storage');
const siteContent = require('../siteContent.json');

const IMAGES_ROOT = path.join(__dirname, '..', 'images');

const MIME_BY_EXT = {
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

const IMAGE_EXTENSIONS = new Set(Object.keys(MIME_BY_EXT));

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkFiles(fullPath);
    if (entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      return [fullPath];
    }
    return [];
  });
}

function localImagePath(filePath) {
  return `/images/${path.relative(IMAGES_ROOT, filePath).split(path.sep).join('/')}`;
}

function replaceImagePath(value, imageMap) {
  if (!value || typeof value !== 'string') return value;
  return imageMap.get(value) || value;
}

function replaceProjectImages(project, imageMap) {
  const images = project.images || {};
  const nextImages = {};

  for (const [group, groupImages] of Object.entries(images)) {
    nextImages[group] = Array.isArray(groupImages)
      ? groupImages.map((image) => replaceImagePath(image, imageMap))
      : groupImages;
  }

  return {
    ...project,
    mainImage: replaceImagePath(project.mainImage, imageMap),
    images: nextImages,
  };
}

async function uploadLocalImages() {
  const imageMap = new Map();
  const files = walkFiles(IMAGES_ROOT);

  for (const filePath of files) {
    const relativePath = path.relative(IMAGES_ROOT, filePath).split(path.sep).join('/');
    const folder = path.dirname(relativePath).replace(/^\.$/, 'misc');
    const originalname = path.basename(filePath);
    const mimetype = MIME_BY_EXT[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    const publicUrl = await uploadImageFile(
      {
        buffer: fs.readFileSync(filePath),
        originalname,
        mimetype,
      },
      folder
    );

    imageMap.set(localImagePath(filePath), publicUrl);
    console.log(`Uploaded ${localImagePath(filePath)} -> ${publicUrl}`);
  }

  return imageMap;
}

async function migrateProjects(imageMap) {
  const projects = await dataStore.getProjects();

  for (const project of projects) {
    const nextProject = replaceProjectImages(project, imageMap);
    if (JSON.stringify(nextProject) !== JSON.stringify(project)) {
      await dataStore.updateProject(project.project_id, nextProject);
      console.log(`Updated project ${project.project_id}`);
    }
  }
}

async function migrateTeam(imageMap) {
  const members = await dataStore.getTeamMembers();

  for (const member of members) {
    const nextImage = replaceImagePath(member.image, imageMap);
    if (nextImage !== member.image) {
      await dataStore.updateTeamMember(member.id, { ...member, image: nextImage });
      console.log(`Updated team member ${member.id}`);
    }
  }
}

async function migrateClients(imageMap) {
  const clients = await dataStore.getClients();

  for (const client of clients) {
    const nextClient = {
      ...client,
      bwImage: replaceImagePath(client.bwImage, imageMap),
      colorImage: replaceImagePath(client.colorImage, imageMap),
    };

    if (JSON.stringify(nextClient) !== JSON.stringify(client)) {
      await dataStore.updateClientRecord(client.id, nextClient);
      console.log(`Updated client ${client.id}`);
    }
  }
}

async function migrateSiteContent(imageMap) {
  const imageEntries = siteContent.images || {};

  for (const [key, imagePath] of Object.entries(imageEntries)) {
    const nextImage = replaceImagePath(imagePath, imageMap);
    if (nextImage !== imagePath) {
      await dataStore.updateSiteImage(key, nextImage, { text: {}, images: {} });
      console.log(`Updated site content image ${key}`);
    }
  }

  const currentContent = await dataStore.getSiteContent({ text: {}, images: {} });
  for (const [key, imagePath] of Object.entries(currentContent.images || {})) {
    const nextImage = replaceImagePath(imagePath, imageMap);
    if (nextImage !== imagePath) {
      await dataStore.updateSiteImage(key, nextImage, { text: {}, images: {} });
      console.log(`Updated stored site content image ${key}`);
    }
  }
}

async function main() {
  const imageMap = await uploadLocalImages();
  await migrateProjects(imageMap);
  await migrateTeam(imageMap);
  await migrateClients(imageMap);
  await migrateSiteContent(imageMap);
  console.log(`Migrated ${imageMap.size} local image files to upload storage.`);
}

main().catch((error) => {
  console.error('Image migration failed:', error);
  process.exit(1);
});
