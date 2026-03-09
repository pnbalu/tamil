// Supabase Edge Function: generate Tamil quiz questions via AI (OpenAI, Gemini, or Claude)
// Provider: set QUIZ_AI_PROVIDER secret, or store in public.app_config key 'quiz_ai_provider'.
// Set the corresponding API key: OPENAI_API_KEY, GEMINI_API_KEY, or ANTHROPIC_API_KEY.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
};

const QUESTION_COUNT_MAX = 50;

interface QuizQuestion {
  id: string;
  question_en: string;
  question_ta?: string;
  options: { text_en: string; text_ta?: string; correct: boolean }[];
  correctIndex: number;
}

function genId(): string {
  return crypto.randomUUID?.() ?? `q-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildPrompt(count: number, level: string, topic?: string): string {
  const topicLine = topic ? `Focus on topic: ${topic}.` : 'Cover Tamil vocabulary (e.g. family, numbers, greetings, food), grammar, and common phrases.';
  return `You are a Tamil language quiz generator. Generate exactly ${count} multiple-choice questions for Tamil learners at level: ${level}. ${topicLine}

CRITICAL - Use only these exact JSON keys (snake_case): question_en, question_ta, options, correctIndex.
- question_en: English question text (e.g. "What does 'அம்மா' mean?")
- question_ta: Same question in Tamil script, or null
- options: Array of exactly 4 objects. Each object must have: text_en (string), text_ta (string or null), correct (boolean). One option must have correct: true.
- correctIndex: 0, 1, 2, or 3 (index of the correct option)

Every question must have non-empty question_en and exactly 4 options with non-empty text_en. Include Tamil script (text_ta) for vocabulary words.

Example (copy this structure):
[{"question_en":"What does 'அம்மா' mean?","question_ta":"அம்மா என்றால் என்ன?","options":[{"text_en":"Mother","text_ta":"அம்மா","correct":true},{"text_en":"Father","text_ta":"அப்பா","correct":false},{"text_en":"Sister","text_ta":"அக்கா","correct":false},{"text_en":"Brother","text_ta":"அண்ணன்","correct":false}],"correctIndex":0}]

Output exactly ${count} questions as a JSON array. No markdown, no code block, no extra text.`;
}

function extractJsonFromResponse(text: string): string {
  const trimmed = text.trim();
  const codeBlock = /^```(?:json)?\s*([\s\S]*?)```$/m.exec(trimmed);
  if (codeBlock) return codeBlock[1].trim();
  const start = trimmed.indexOf('[');
  if (start >= 0) {
    let depth = 0;
    for (let i = start; i < trimmed.length; i++) {
      if (trimmed[i] === '[') depth++;
      if (trimmed[i] === ']') { depth--; if (depth === 0) return trimmed.slice(start, i + 1); }
    }
  }
  return trimmed;
}

function normalizeQuestions(raw: unknown[]): QuizQuestion[] {
  return raw.map((q: any, i: number) => {
    const opts = Array.isArray(q?.options) ? q.options : [];
    const questionEn = (q?.question_en ?? q?.questionEn ?? '').toString().trim();
    const questionTa = (q?.question_ta ?? q?.questionTa ?? '').toString().trim() || undefined;
    const correctIndex = typeof q?.correctIndex === 'number' ? q.correctIndex : opts.findIndex((o: any) => o?.correct === true);
    const normalizedOpts = opts.slice(0, 4).map((o: any) => ({
      text_en: (o?.text_en ?? o?.textEn ?? '').toString().trim() || 'Option',
      text_ta: (o?.text_ta ?? o?.textTa ?? '') ? (o?.text_ta ?? o?.textTa).toString().trim() : undefined,
      correct: Boolean(o?.correct),
    }));
    return {
      id: typeof q?.id === 'string' ? q.id : genId(),
      question_en: questionEn || 'Select the correct answer.',
      question_ta: questionTa,
      options: normalizedOpts.length >= 4 ? normalizedOpts : [
        { text_en: 'Mother', text_ta: 'அம்மா', correct: true },
        { text_en: 'Father', text_ta: 'அப்பா', correct: false },
        { text_en: 'Sister', text_ta: 'அக்கா', correct: false },
        { text_en: 'Brother', text_ta: 'அண்ணன்', correct: false },
      ],
      correctIndex: correctIndex >= 0 && correctIndex < 4 ? correctIndex : 0,
    };
  });
}

async function generateWithOpenAI(apiKey: string, prompt: string, count: number): Promise<QuizQuestion[]> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You output only valid JSON. No markdown, no code fences.' },
        { role: 'user', content: prompt + '\n\nReturn a single JSON object with key "questions" containing the array of questions.' },
      ],
      max_tokens: 8192,
      temperature: 0.5,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI: ${res.status} ${err}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI: no content');
  const raw = JSON.parse(extractJsonFromResponse(content));
  const arr = Array.isArray(raw) ? raw : (raw?.questions ?? []);
  if (!Array.isArray(arr) || arr.length === 0) throw new Error('AI returned no questions array');
  return normalizeQuestions(arr).slice(0, count);
}

const GEMINI_DEFAULT_MODEL = 'gemini-2.0-flash';

async function generateWithGemini(apiKey: string, prompt: string, count: number, model?: string): Promise<QuizQuestion[]> {
  const modelId = model || Deno.env.get('GEMINI_MODEL') || GEMINI_DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
  const body = {
    contents: [{ parts: [{ text: prompt + '\n\nReturn only a JSON array of questions, no other text.' }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json',
    },
  };
  const maxRetries = 2;
  let lastErr: string = '';
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Gemini: no text');
      const arr = JSON.parse(extractJsonFromResponse(text));
      const list = Array.isArray(arr) ? arr : arr?.questions ?? [];
      return normalizeQuestions(list).slice(0, count);
    }
    lastErr = await res.text();
    if (res.status === 429 && attempt < maxRetries) {
      const delayMs = 3000 + attempt * 2000;
      await new Promise((r) => setTimeout(r, delayMs));
      continue;
    }
    throw new Error(`Gemini: ${res.status} ${lastErr}`);
  }
  throw new Error(`Gemini: ${lastErr}`);
}

async function generateWithClaude(apiKey: string, prompt: string, count: number): Promise<QuizQuestion[]> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt + '\n\nReturn only a JSON array of questions.' }],
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude: ${res.status} ${err}`);
  }
  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error('Claude: no content');
  const arr = JSON.parse(extractJsonFromResponse(text));
  const list = Array.isArray(arr) ? arr : arr?.questions ?? [];
  return normalizeQuestions(list).slice(0, count);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const body = await req.json().catch(() => ({}));
    let provider = (Deno.env.get('QUIZ_AI_PROVIDER') ?? (body.provider as string) ?? '').toLowerCase();
    if (!provider) {
      try {
        const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
        const { data: row } = await supabaseAdmin.from('app_config').select('value').eq('key', 'quiz_ai_provider').single();
        if (row?.value) provider = String(row.value).toLowerCase();
      } catch (_) {}
    }
    if (!provider) provider = 'openai';
    const num = Math.min(QUESTION_COUNT_MAX, Math.max(1, Number(body.count) || 10));
    const lev = String(body.level ?? 'beginner');
    const top = body.topic ? String(body.topic) : undefined;
    const prompt = buildPrompt(num, lev, top);

    let questions: QuizQuestion[] = [];

    if (provider === 'gemini') {
      const key = Deno.env.get('GEMINI_API_KEY');
      if (!key) throw new Error('GEMINI_API_KEY not set');
      questions = await generateWithGemini(key, prompt, num);
    } else if (provider === 'claude') {
      const key = Deno.env.get('ANTHROPIC_API_KEY');
      if (!key) throw new Error('ANTHROPIC_API_KEY not set');
      questions = await generateWithClaude(key, prompt, num);
    } else {
      const key = Deno.env.get('OPENAI_API_KEY');
      if (!key) throw new Error('OPENAI_API_KEY not set');
      questions = await generateWithOpenAI(key, prompt, num);
    }

    return new Response(
      JSON.stringify({ questions, count: questions.length }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }
});
