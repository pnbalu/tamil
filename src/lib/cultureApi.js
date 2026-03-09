import { supabase } from './supabase';

/**
 * Fetch all culture categories (e.g. Festivals, Food).
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('culture_categories')
    .select('id, slug, name_en, name_ta, sort_order')
    .order('sort_order', { ascending: true });
  if (error) return { categories: [], error: error.message };
  return { categories: data || [] };
}

/**
 * Fetch culture items in a category (e.g. Diwali, Pongal under Festivals).
 */
export async function getItemsByCategory(categoryId, level) {
  let q = supabase
    .from('culture_items')
    .select('id, slug, name_en, name_ta, info_en, level, sort_order')
    .eq('category_id', categoryId)
    .order('sort_order', { ascending: true });
  if (level) q = q.in('level', ['beginner', level]);
  const { data, error } = await q;
  if (error) return { items: [], error: error.message };
  return { items: data || [] };
}

/**
 * Fetch single culture item detail with category name for display.
 */
export async function getItemDetail(itemId) {
  const { data, error } = await supabase
    .from('culture_items')
    .select('id, slug, name_en, name_ta, info_en, level, category_id, culture_categories(name_en, name_ta)')
    .eq('id', itemId)
    .single();
  if (error) return { item: null, error: error.message };
  const item = data ? { ...data, categoryName: data.culture_categories?.name_en, categoryNameTa: data.culture_categories?.name_ta } : null;
  if (item) delete item.culture_categories;
  return { item };
}

/**
 * Fetch terms for an item (for "Words in this story" display). Returns a sample for UI.
 */
export async function getTermsForItem(itemId, limit = 24) {
  const { data, error } = await supabase
    .from('culture_terms')
    .select('id, term_ta, term_en, sort_order')
    .eq('item_id', itemId)
    .order('sort_order', { ascending: true })
    .limit(limit);
  if (error) return { terms: [], error: error.message };
  return { terms: data || [] };
}

/**
 * Fetch related culture items (same category) for "More Stories".
 */
export async function getRelatedItems(itemId, categoryId, limit = 6) {
  if (!categoryId) return { items: [] };
  const { data, error } = await supabase
    .from('culture_items')
    .select('id, name_en, name_ta, info_en, sort_order')
    .eq('category_id', categoryId)
    .neq('id', itemId)
    .order('sort_order', { ascending: true })
    .limit(limit);
  if (error) return { items: [], error: error.message };
  return { items: data || [] };
}

/**
 * Build random quiz questions from culture terms for an item.
 * Each question: "What is the Tamil word for X?" with 4 options in Tamil, or "What does X mean?" with 4 options in English.
 * Respects level by only using terms from items at or below user level (we use item's level when fetching terms).
 */
export async function getCultureQuizQuestions(itemId, count = 10, level = 'beginner') {
  const { data: terms, error: termsErr } = await supabase.rpc('get_culture_terms_for_item', {
    p_item_id: itemId,
    p_limit: 50,
  });
  if (termsErr || !terms?.length) return { questions: [], error: termsErr?.message || 'No terms found for this topic.' };

  const { data: otherTerms, error: otherErr } = await supabase.rpc('get_culture_terms_from_other_items', {
    p_exclude_item_id: itemId,
    p_limit: 60,
  });
  const wrongPool = (otherTerms || []).map((t) => ({ ta: t.term_ta, en: t.term_en }));

  const numQuestions = Math.min(count, terms.length);
  const shuffled = [...terms].sort(() => Math.random() - 0.5);
  const questions = [];

  for (let i = 0; i < numQuestions; i++) {
    const correct = shuffled[i];
    const askInEnglish = Math.random() > 0.5; // "What is the Tamil word for Oil bath?" vs "What does எண்ணெய் குளிப்பு mean?"

    let questionEn;
    let correctAnswerTa;
    let correctAnswerEn;
    let options;

    if (askInEnglish) {
      questionEn = `What is the Tamil word for "${correct.term_en}"?`;
      correctAnswerTa = correct.term_ta;
      correctAnswerEn = correct.term_en;
      let wrongTa = wrongPool.filter((w) => w.ta !== correct.term_ta).map((w) => w.ta);
      while (wrongTa.length < 3) wrongTa = [...wrongTa, ...wrongTa];
      wrongTa = wrongTa.sort(() => Math.random() - 0.5).slice(0, 3);
      const allOptions = [correct.term_ta, ...wrongTa].sort(() => Math.random() - 0.5);
      options = allOptions.map((text_ta) => ({ text_ta, text_en: '', correct: text_ta === correct.term_ta }));
    } else {
      questionEn = `What does "${correct.term_ta}" mean?`;
      correctAnswerEn = correct.term_en;
      correctAnswerTa = correct.term_ta;
      let wrongEn = wrongPool.filter((w) => w.en !== correct.term_en).map((w) => w.en);
      while (wrongEn.length < 3) wrongEn = [...wrongEn, ...wrongEn];
      wrongEn = wrongEn.sort(() => Math.random() - 0.5).slice(0, 3);
      const allOptions = [correct.term_en, ...wrongEn].sort(() => Math.random() - 0.5);
      options = allOptions.map((text_en) => ({ text_en, text_ta: '', correct: text_en === correct.term_en }));
    }

    const correctIndex = options.findIndex((o) => o.correct);
    questions.push({
      id: correct.id || `q-${i}`,
      question_en: questionEn,
      question_ta: '',
      options,
      correctIndex: correctIndex >= 0 ? correctIndex : 0,
      explanationLine: `${correct.term_ta} = ${correct.term_en}`,
    });
  }

  return { questions };
}
