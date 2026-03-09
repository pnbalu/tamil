// Supabase Edge Function: verify secret answer and reset password
// Deploy: supabase functions deploy verify-reset-password
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { email, answer, new_password } = await req.json();
    if (!email || !answer || !new_password) {
      return new Response(JSON.stringify({ error: 'Missing email, answer or new_password' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: profile } = await supabaseAdmin.from('profiles').select('id, secret_answer_hash').eq('email', email).single();
    if (!profile) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } });

    const valid = await verifyAnswer(answer, profile.secret_answer_hash);
    if (!valid) return new Response(JSON.stringify({ error: 'Invalid answer' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } });

    const { error } = await supabaseAdmin.auth.admin.updateUserById(profile.id, { password: new_password });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    return new Response(JSON.stringify({ success: true }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});

async function verifyAnswer(plain: string, hash: string): Promise<boolean> {
  const normalized = plain.trim().toLowerCase();
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hex === hash;
}
