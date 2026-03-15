import { supabase } from './supabase';

/**
 * Fetch all 3 sections (Aram, Porul, Inbam).
 */
export async function getSections() {
  const { data, error } = await supabase
    .from('thirukural_sections')
    .select('id, name_en, name_ta, sort_order')
    .order('sort_order', { ascending: true });
  if (error) return { sections: [], error: error.message };
  return { sections: data || [] };
}

/**
 * Fetch adhigarams (chapters) for a section.
 */
export async function getAdhigarams(sectionId) {
  const { data, error } = await supabase
    .from('thirukural_adhigaram')
    .select('id, section_id, name_en, name_ta, sort_order')
    .eq('section_id', sectionId)
    .order('sort_order', { ascending: true });
  if (error) return { adhigarams: [], error: error.message };
  return { adhigarams: data || [] };
}

/**
 * Fetch all 133 adhigarams (e.g. for browse-by-chapter).
 */
export async function getAllAdhigarams() {
  const { data, error } = await supabase
    .from('thirukural_adhigaram')
    .select('id, section_id, name_en, name_ta, sort_order')
    .order('sort_order', { ascending: true });
  if (error) return { adhigarams: [], error: error.message };
  return { adhigarams: data || [] };
}

/**
 * Fetch 10 kurals for an adhigaram.
 */
export async function getKuralsByAdhigaram(adhigaramId) {
  const { data, error } = await supabase
    .from('thirukural')
    .select('id, adhigaram_id, line1_ta, line2_ta, meaning_en, explanation_en, sort_order')
    .eq('adhigaram_id', adhigaramId)
    .order('sort_order', { ascending: true });
  if (error) return { kurals: [], error: error.message };
  return { kurals: data || [] };
}

/**
 * Fetch single kural by id (1–1330).
 */
export async function getKuralById(kuralId) {
  const { data, error } = await supabase
    .from('thirukural')
    .select('id, adhigaram_id, line1_ta, line2_ta, meaning_en, explanation_en, example_en, example_ta, story_en, story_ta, sort_order')
    .eq('id', kuralId)
    .single();
  if (error) return { kural: null, error: error.message };
  return { kural: data };
}

/**
 * Fetch a random set of kurals for play (fill-in-blank). difficulty: 'easy' | 'medium' | 'hard'
 * easy = 1 word missing, medium = 2, hard = 3.
 */
export async function getRandomKuralsForPlay(count = 10, difficulty = 'easy') {
  const { data: list, error } = await supabase
    .from('thirukural')
    .select('id, adhigaram_id, line1_ta, line2_ta, meaning_en')
    .order('id');
  if (error || !list?.length) return { kurals: [], error: error?.message || 'No kurals' };
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, list.length));
  return { kurals: selected };
}

/**
 * Get words from a line (Tamil). Splits on spaces; filters empty and very short.
 */
export function getWordsFromLine(line) {
  if (!line || typeof line !== 'string') return [];
  return line.trim().split(/\s+/).filter((w) => w.length > 0);
}

/**
 * Build one line with blanks and options for a kural.
 * wordsToHide: number (1 = easy, 2 = medium, 3 = hard). We hide that many words, return indices and correct answers.
 */
export function buildBlanksForLine(line, wordsToHide, seed = 0) {
  const words = getWordsFromLine(line);
  if (words.length === 0) return { displayParts: [], blanks: [] };
  if (wordsToHide >= words.length) wordsToHide = Math.max(1, words.length - 1);
  const indices = [...Array(words.length).keys()];
  const rng = (i) => ((seed + i) * 9301 + 49297) % 233280;
  for (let i = indices.length - 1; i > 0; i--) {
    const j = rng(i) % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const blankIndices = indices.slice(0, wordsToHide).sort((a, b) => a - b);
  const displayParts = [];
  const blanks = [];
  let last = 0;
  for (const idx of blankIndices) {
    if (idx > last) displayParts.push({ type: 'text', value: words.slice(last, idx).join(' ') });
    displayParts.push({ type: 'blank', blankIndex: blanks.length });
    blanks.push({ correctWord: words[idx], position: idx });
    last = idx + 1;
  }
  if (last < words.length) displayParts.push({ type: 'text', value: words.slice(last).join(' ') });
  return { displayParts, blanks, allWords: words };
}

/**
 * Get wrong-option words from other kurals (for multiple choice). Fetches a sample of kurals and extracts words.
 */
export async function getWordPoolForOptions(limit = 80, excludeWords = []) {
  const excludeSet = new Set(excludeWords.map((w) => (w || '').trim()));
  const { data } = await supabase
    .from('thirukural')
    .select('line1_ta, line2_ta')
    .limit(200);
  const words = new Set();
  (data || []).forEach((k) => {
    getWordsFromLine(k.line1_ta).forEach((w) => { if (!excludeSet.has(w)) words.add(w); });
    getWordsFromLine(k.line2_ta).forEach((w) => { if (!excludeSet.has(w)) words.add(w); });
  });
  return [...words].sort(() => Math.random() - 0.5).slice(0, limit);
}
