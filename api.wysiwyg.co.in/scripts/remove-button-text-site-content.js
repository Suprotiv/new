require('dotenv').config();

const { getSupabase } = require('../db');

const BUTTON_TEXT_KEYS = [
  'about.cta',
  'home.hero.cta',
  'home.story.cta',
];

async function main() {
  const { data, error } = await getSupabase()
    .from('site_content')
    .delete()
    .in('key', BUTTON_TEXT_KEYS)
    .select('key');

  if (error) throw error;
  console.log(
    `Removed ${(data || []).length} button text entr${data?.length === 1 ? 'y' : 'ies'} from site_content.`
  );
}

main().catch(error => {
  console.error('Failed to remove button text site content:', error);
  process.exitCode = 1;
});
