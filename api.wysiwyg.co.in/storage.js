const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/home/u148414751/uploads';
const LEGACY_IMAGES_ROOT = path.join(__dirname, 'images');

class UploadStorageError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'UploadStorageError';
    this.cause = cause;
    this.statusCode = 500;
  }
}

function safeFileName(name = 'image') {
  const ext = path.extname(name);
  const base = path.basename(name, ext);
  const safeBase = base.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
  const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, '');
  return `${safeBase || 'image'}${safeExt}`;
}

function publicUploadPath(...parts) {
  const relativePath = parts
    .filter(Boolean)
    .join('/')
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/');
  return `/uploads/${relativePath}`;
}

function resolveInside(root, relativePath) {
  const resolvedRoot = path.resolve(root);
  const resolvedPath = path.resolve(resolvedRoot, relativePath);
  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)) {
    return '';
  }
  return resolvedPath;
}

function getUploadRelativePath(value) {
  if (!value || typeof value !== 'string') return '';

  if (value.startsWith('/uploads/')) {
    return value.replace(/^\/uploads\/?/, '');
  }

  try {
    const url = new URL(value);
    if (url.pathname.startsWith('/uploads/')) {
      return decodeURIComponent(url.pathname.replace(/^\/uploads\/?/, ''));
    }
  } catch {
    return '';
  }

  return '';
}

function localPathFromPublicPath(value) {
  const uploadRelativePath = getUploadRelativePath(value);
  if (uploadRelativePath) {
    return resolveInside(UPLOAD_DIR, uploadRelativePath);
  }

  if (typeof value === 'string' && value.startsWith('/images/')) {
    return resolveInside(LEGACY_IMAGES_ROOT, value.replace(/^\/images\/?/, ''));
  }

  return '';
}

function ensureUploadDirectory() {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    fs.accessSync(UPLOAD_DIR, fs.constants.R_OK | fs.constants.W_OK);
  } catch (error) {
    throw new UploadStorageError(`Upload directory is not writable: ${UPLOAD_DIR}`, error);
  }
}

async function writeFileWithoutOverwrite(targetPath, buffer) {
  try {
    await fs.promises.writeFile(targetPath, buffer, { flag: 'wx' });
  } catch (error) {
    throw new UploadStorageError('Failed to write uploaded file to storage', error);
  }
}

async function convertImageToWebp(buffer) {
  try {
    return await sharp(buffer, { animated: true })
      .rotate()
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
  } catch (error) {
    throw new UploadStorageError('Failed to convert uploaded image to WebP', error);
  }
}

async function uploadImageFile(file, folder = '') {
  if (!file) return '';

  ensureUploadDirectory();

  const safeOriginalName = safeFileName(file.originalname);
  const originalExt = path.extname(safeOriginalName);
  const safeBase = path.basename(safeOriginalName, originalExt) || 'image';
  const webpBuffer = await convertImageToWebp(file.buffer);
  const targetFolder = resolveInside(UPLOAD_DIR, folder);
  if (!targetFolder) {
    throw new UploadStorageError('Invalid upload folder');
  }

  try {
    await fs.promises.mkdir(targetFolder, { recursive: true });
  } catch (error) {
    throw new UploadStorageError('Failed to create upload folder', error);
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const filename = `${Date.now()}-${crypto.randomUUID()}-${safeBase}.webp`;
    const targetPath = path.join(targetFolder, filename);

    try {
      await writeFileWithoutOverwrite(targetPath, webpBuffer);
      return publicUploadPath(folder, filename);
    } catch (error) {
      if (error.cause?.code === 'EEXIST' && attempt < 2) continue;
      throw error;
    }
  }

  throw new UploadStorageError('Failed to generate a unique uploaded filename');
}

async function removeStorageImage(value) {
  const filePath = localPathFromPublicPath(value);
  if (!filePath) return;

  try {
    if (!fs.existsSync(filePath)) return;
    await fs.promises.unlink(filePath);
  } catch (error) {
    throw new UploadStorageError('Failed to remove uploaded file from storage', error);
  }
}

async function removeStorageImages(values = []) {
  for (const value of [...new Set(values.filter(Boolean))]) {
    await removeStorageImage(value);
  }
}

function removeUploadFolder(...parts) {
  const folderPath = resolveInside(UPLOAD_DIR, path.join(...parts));
  if (!folderPath || !fs.existsSync(folderPath)) return;

  try {
    fs.rmSync(folderPath, { recursive: true, force: true });
  } catch (error) {
    throw new UploadStorageError('Failed to remove upload folder from storage', error);
  }
}

module.exports = {
  LEGACY_IMAGES_ROOT,
  UPLOAD_DIR,
  UploadStorageError,
  convertImageToWebp,
  ensureUploadDirectory,
  getUploadRelativePath,
  localPathFromPublicPath,
  publicUploadPath,
  removeStorageImage,
  removeStorageImages,
  removeUploadFolder,
  safeFileName,
  uploadImageFile,
};
