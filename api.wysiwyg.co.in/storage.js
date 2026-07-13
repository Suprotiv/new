const path = require('path');
const { getSupabase } = require('./db');

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'wysiwyg-media';

function safeFileName(name = 'image') {
  const ext = path.extname(name);
  const base = path.basename(name, ext);
  const safeBase = base.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
  const safeExt = ext.replace(/[^a-zA-Z0-9.]/g, '');
  return `${safeBase || 'image'}${safeExt}`;
}

async function ensureStorageBucket() {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.getBucket(STORAGE_BUCKET);

  if (!error && data) return;

  const { error: createError } = await supabase.storage.createBucket(STORAGE_BUCKET, {
    public: true,
    fileSizeLimit: 25 * 1024 * 1024,
    allowedMimeTypes: ['image/*'],
  });

  if (createError && createError.message !== 'Bucket already exists') {
    throw createError;
  }
}

async function uploadImageFile(file, folder) {
  if (!file) return '';

  await ensureStorageBucket();

  const supabase = getSupabase();
  const objectPath = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeFileName(file.originalname)}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(objectPath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

function storagePathFromUrl(value) {
  if (!value) return '';

  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const markerIndex = value.indexOf(marker);
  if (markerIndex === -1) return '';

  return decodeURIComponent(value.slice(markerIndex + marker.length));
}

async function removeStorageImage(value) {
  const objectPath = storagePathFromUrl(value);
  if (!objectPath) return;

  const { error } = await getSupabase().storage.from(STORAGE_BUCKET).remove([objectPath]);
  if (error) {
    console.warn(`Failed to remove Supabase Storage object ${objectPath}:`, error.message);
  }
}

async function removeStorageImages(values = []) {
  const objectPaths = [...new Set(values.map(storagePathFromUrl).filter(Boolean))];
  if (!objectPaths.length) return;

  const { error } = await getSupabase().storage.from(STORAGE_BUCKET).remove(objectPaths);
  if (error) {
    console.warn('Failed to remove Supabase Storage objects:', error.message);
  }
}

module.exports = {
  STORAGE_BUCKET,
  ensureStorageBucket,
  safeFileName,
  uploadImageFile,
  removeStorageImage,
  removeStorageImages,
  storagePathFromUrl,
};
