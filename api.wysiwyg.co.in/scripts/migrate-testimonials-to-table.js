require('dotenv').config();

const { getSupabase } = require('../db');
const {
  getUploadRelativePath,
  relocateStorageImage,
} = require('../storage');

function isLegacyAccoladeImage(value) {
  return getUploadRelativePath(value).startsWith('accolades/');
}

async function main() {
  const db = getSupabase();
  const { data: legacyRows, error: legacyError } = await db
    .from('accolades')
    .select('*')
    .eq('award', 'Testimonial')
    .order('display_order', { ascending: true });
  if (legacyError) throw legacyError;

  const migratedIds = [];
  let relocatedImages = 0;

  for (const row of legacyRows || []) {
    let image = row.image || '';
    if (isLegacyAccoladeImage(image)) {
      const relocated = await relocateStorageImage(image, 'testimonials');
      if (relocated === image || isLegacyAccoladeImage(relocated)) {
        throw new Error(
          `Could not relocate legacy testimonial image for ${row.id}: ${image}`
        );
      }
      image = relocated;
      relocatedImages += 1;
    }

    const testimonial = {
      id: row.id,
      name: row.project,
      designation: row.category,
      quote: row.description,
      image,
      display_order: row.display_order,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
    const { error: upsertError } = await db
      .from('testimonials')
      .upsert(testimonial, { onConflict: 'id' });
    if (upsertError) throw upsertError;
    migratedIds.push(row.id);
  }

  const { data: destinationRows, error: destinationError } = await db
    .from('testimonials')
    .select('id, image');
  if (destinationError) throw destinationError;

  const destinationById = new Map(
    (destinationRows || []).map(row => [row.id, row])
  );
  const legacyDestinationImages = (destinationRows || []).filter(row =>
    isLegacyAccoladeImage(row.image)
  );
  if (legacyDestinationImages.length) {
    throw new Error(
      `${legacyDestinationImages.length} testimonial images still reference the accolades folder`
    );
  }
  for (const id of migratedIds) {
    const row = destinationById.get(id);
    if (!row) throw new Error(`Testimonial ${id} is missing after migration`);
  }

  if (migratedIds.length) {
    const { error: deleteError } = await db
      .from('accolades')
      .delete()
      .in('id', migratedIds)
      .eq('award', 'Testimonial');
    if (deleteError) throw deleteError;
  }

  const { count: remainingLegacyCount, error: countError } = await db
    .from('accolades')
    .select('id', { count: 'exact', head: true })
    .eq('award', 'Testimonial');
  if (countError) throw countError;
  if (remainingLegacyCount !== 0) {
    throw new Error(
      `${remainingLegacyCount} legacy testimonial accolade rows remain`
    );
  }

  console.log(`Migrated ${migratedIds.length} testimonials.`);
  console.log(`Relocated ${relocatedImages} images to /uploads/testimonials/.`);
  console.log(`Verified ${(destinationRows || []).length} testimonial records.`);
  console.log('Verified that no testimonial rows remain in accolades.');
}

main().catch(error => {
  console.error('Testimonial migration failed:', error);
  process.exitCode = 1;
});
