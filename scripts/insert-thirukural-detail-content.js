/**
 * Insert example and story content (example_en, example_ta, story_en, story_ta)
 * into the thirukural table from a JSON file. All kural detail content is then
 * served from the DB; the app does not hardcode any of it.
 *
 * JSON format: { "1": { "example_en", "example_ta", "story_en", "story_ta" }, ... }
 *
 * Usage:
 *   npm run insert:thirukural-detail-content
 *   npm run insert:thirukural-detail-content -- path/to/detail-content.json
 *
 * Requires: EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 * Requires: migration 011_thirukural_example_story.sql (adds example_* and story_* columns)
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DEFAULT_PATH = path.join(__dirname, 'data', 'thirukural-detail-content.json');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function loadDetailContent(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  if (typeof data !== 'object' || data === null) {
    throw new Error('JSON must be an object with kural ids as keys');
  }
  return data;
}

async function main() {
  const filePath = process.argv[2] || DEFAULT_PATH;
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    console.error('Expected JSON: { "1": { "example_en", "example_ta", "story_en", "story_ta" }, ... }');
    console.error('See scripts/data/thirukural-detail-content.json and docs/SETUP-THIRUKURAL.md');
    process.exit(1);
  }

  const content = loadDetailContent(filePath);
  const ids = Object.keys(content)
    .map((k) => parseInt(k, 10))
    .filter((n) => !Number.isNaN(n) && n >= 1 && n <= 1330);
  console.log('Loaded', ids.length, 'kural detail entries. Inserting into DB...');

  let updated = 0;
  let failed = 0;
  for (const id of ids) {
    const row = content[String(id)];
    if (!row || typeof row !== 'object') continue;
    const payload = {
      example_en: typeof row.example_en === 'string' ? row.example_en.trim() : null,
      example_ta: typeof row.example_ta === 'string' ? row.example_ta.trim() : null,
      story_en: typeof row.story_en === 'string' ? row.story_en.trim() : null,
      story_ta: typeof row.story_ta === 'string' ? row.story_ta.trim() : null,
    };
    const { error } = await supabase.from('thirukural').update(payload).eq('id', id);
    if (error) {
      console.error('Kural', id, error.message);
      failed++;
    } else {
      updated++;
    }
    if (updated % 50 === 0 && updated > 0) console.log('Progress:', updated, '/', ids.length);
  }

  console.log('Done. Updated:', updated, 'Failed:', failed);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
