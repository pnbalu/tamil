/**
 * Seed Aathichudi (ஆத்திசூடி) by Avvaiyar: 109 verses.
 * Fetches from tk120404/Aathichudi on GitHub. Run: npm run seed:aathichudi
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const AATHICUDI_JSON = process.env.AATHICUDI_JSON_URL || 'https://raw.githubusercontent.com/tk120404/Aathichudi/master/aathicudi.json';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  console.log('Fetching aathicudi.json...');
  const res = await fetch(AATHICUDI_JSON);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const data = await res.json();
  const list = data.athisudi || data;
  if (!Array.isArray(list) || list.length === 0) throw new Error('No athisudi array in JSON');

  const rows = list.map((row) => {
    const id = row.number ?? row.id ?? 0;
    if (id < 1 || id > 109) return null;
    return {
      id,
      line_ta: (row.poem || row.line_ta || '').trim(),
      meaning_en: (row.translation || row.meaning_en || '').trim() || null,
      explanation_en: (row.paraphrase || row.explanation_en || '').trim() || null,
      sort_order: id,
    };
  }).filter(Boolean);

  console.log('Upserting', rows.length, 'verses...');
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('aathichudi').upsert(batch, { onConflict: 'id' });
    if (error) throw new Error(error.message);
  }
  console.log('Aathichudi seed done. Verses:', rows.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
