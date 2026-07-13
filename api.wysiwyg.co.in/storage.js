const fs = require('fs');
const os = require('os');
const path = require('path');

const HOSTINGER_UPLOAD_ROOT = '/domains/api.wysiwyg.co.in/uploads';

function firstUsableUploadRoot() {
  const candidates = [
    HOSTINGER_UPLOAD_ROOT,
    path.join(os.homedir(), 'domains/api.wysiwyg.co.in/uploads'),
    path.resolve(__dirname, 'uploads'),
    path.resolve(__dirname, '..', 'uploads'),
    path.resolve(__dirname, '..', '..', 'uploads'),
    path.resolve(process.cwd(), 'uploads'),
    path.resolve(process.cwd(), '..', 'uploads'),
    path.resolve(process.cwd(), '..', '..', 'uploads'),
  ];

  const existingUploadRoot = candidates.find(candidate => fs.existsSync(candidate));
  if (existingUploadRoot) return existingUploadRoot;

  const writableParent = candidates.find(candidate => fs.existsSync(path.dirname(candidate)));
  return writableParent || path.join(__dirname, 'uploads');
}

const DEFAULT_UPLOAD_ROOT = firstUsableUploadRoot();

const UPLOAD_ROOT = process.env.UPLOAD_ROOT || DEFAULT_UPLOAD_ROOT;
const LEGACY_IMAGES_ROOT = path.join(__dirname, 'images');

function safeFileName(name = 'image') {
  const ext = path.extname(name);
  const base = path.basename(name, ext);
  const safeBase = base.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
  const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, '');
  return `${safeBase || 'image'}${safeExt}`;
}

function toPublicUploadPath(...parts) {
  return `/uploads/${parts.filter(Boolean).join('/')}`.replace(/\/+/g, '/');
}

function resolveInside(root, relativePath) {
  const resolvedRoot = path.resolve(root);
  const resolvedPath = path.resolve(resolvedRoot, relativePath);
  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)) {
    return '';
  }
  return resolvedPath;
}

function localPathFromPublicPath(value) {
  if (!value) return '';

  if (value.startsWith('/uploads/')) {
    return resolveInside(UPLOAD_ROOT, value.replace(/^\/uploads\/?/, ''));
  }

  if (value.startsWith('/images/')) {
    return resolveInside(LEGACY_IMAGES_ROOT, value.replace(/^\/images\/?/, ''));
  }

  return '';
}

async function uploadImageFile(file, folder) {
  if (!file) return '';

  const targetFolder = path.join(UPLOAD_ROOT, folder);
  fs.mkdirSync(targetFolder, { recursive: true });

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeFileName(file.originalname)}`;
  const targetPath = path.join(targetFolder, filename);
  await fs.promises.writeFile(targetPath, file.buffer);

  return toPublicUploadPath(folder, filename);
}

async function removeStorageImage(value) {
  const filePath = localPathFromPublicPath(value);
  if (!filePath || !fs.existsSync(filePath)) return;

  await fs.promises.unlink(filePath);
}

async function removeStorageImages(values = []) {
  for (const value of [...new Set(values.filter(Boolean))]) {
    await removeStorageImage(value);
  }
}

function removeUploadFolder(...parts) {
  const folderPath = path.join(UPLOAD_ROOT, ...parts);
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
}

module.exports = {
  UPLOAD_ROOT,
  LEGACY_IMAGES_ROOT,
  localPathFromPublicPath,
  removeStorageImage,
  removeStorageImages,
  removeUploadFolder,
  safeFileName,
  uploadImageFile,
};
