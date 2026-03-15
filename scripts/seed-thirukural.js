/**
 * Seed Thirukural: 3 sections, 133 adhigarams, 1330 kurals.
 * Fetches data from tk120404/thirukkural (GitHub). Run: npm run seed:thirukural
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const KURAL_JSON = process.env.THIRUKKURAL_JSON_URL || 'https://raw.githubusercontent.com/tk120404/thirukkural/master/thirukkural.json';
const DETAIL_JSON = process.env.THIRUKKURAL_DETAIL_URL || 'https://raw.githubusercontent.com/tk120404/thirukkural/master/detail.json';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function flattenAdhigarams(detailData) {
  const sections = [];
  const adhigarams = [];
  const sectionList = detailData?.section?.detail || [];
  for (const sec of sectionList) {
    sections.push({
      id: sec.number,
      name_en: sec.translation || sec.name,
      name_ta: sec.name,
      sort_order: sec.number,
    });
    const groups = sec.chapterGroup?.detail || [];
    for (const grp of groups) {
      const chapters = grp.chapters?.detail || [];
      for (const ch of chapters) {
        adhigarams.push({
          id: ch.number,
          section_id: sec.number,
          name_en: ch.translation || ch.name,
          name_ta: ch.name,
          sort_order: ch.number,
        });
      }
    }
  }
  return { sections, adhigarams };
}

async function main() {
  console.log('Fetching detail.json...');
  const detailRes = await fetch(DETAIL_JSON);
  if (!detailRes.ok) throw new Error(`Failed to fetch detail: ${detailRes.status}`);
  const rawDetail = await detailRes.json();
  const detailData = Array.isArray(rawDetail) ? rawDetail[0] : rawDetail;
  const { sections, adhigarams } = flattenAdhigarams(detailData);
  console.log('Fetching thirukkural.json...');
  const kuralRes = await fetch(KURAL_JSON);
  if (!kuralRes.ok) throw new Error(`Failed to fetch kurals: ${kuralRes.status}`);
  const kuralPayload = await kuralRes.json();
  const kurals = kuralPayload.kural || kuralPayload;
  if (!Array.isArray(kurals) || kurals.length === 0) throw new Error('No kural array in JSON');

  console.log('Inserting sections:', sections.length);
  const { error: e1 } = await supabase.from('thirukural_sections').upsert(sections, { onConflict: 'id' });
  if (e1) throw new Error(e1.message);

  console.log('Inserting adhigarams:', adhigarams.length);
  const { error: e2 } = await supabase.from('thirukural_adhigaram').upsert(adhigarams, { onConflict: 'id' });
  if (e2) throw new Error(e2.message);

  const thirukuralRows = kurals.map((k) => {
    const num = k.Number ?? k.number ?? 0;
    const adhigaramId = Math.ceil(num / 10);
    if (adhigaramId < 1 || adhigaramId > 133) return null;
    return {
      id: num,
      adhigaram_id: adhigaramId,
      line1_ta: (k.Line1 || k.line1 || '').trim(),
      line2_ta: (k.Line2 || k.line2 || '').trim(),
      meaning_en: (k.Translation || k.translation || k.meaning_en || '').trim() || null,
      explanation_en: (k.explanation || '').trim() || null,
      sort_order: num,
    };
  }).filter(Boolean);

  console.log('Inserting kurals:', thirukuralRows.length);
  const BATCH = 100;
  for (let i = 0; i < thirukuralRows.length; i += BATCH) {
    const batch = thirukuralRows.slice(i, i + BATCH);
    const { error: e3 } = await supabase.from('thirukural').upsert(batch, { onConflict: 'id' });
    if (e3) throw new Error(e3.message);
  }
  console.log('Thirukural seed done. Sections:', sections.length, 'Adhigarams:', adhigarams.length, 'Kurals:', thirukuralRows.length);
}

main().catch((e) => { console.error(e); process.exit(1); });
