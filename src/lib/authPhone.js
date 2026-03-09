import { supabase } from './supabase';

/**
 * Send OTP to phone number. Phone must be E.164 (e.g. +919876543210).
 * @param {string} phone
 * @returns {{ error: Error | null }}
 */
export async function sendPhoneOtp(phone) {
  const normalized = phone.startsWith('+') ? phone : `+${phone}`;
  const { error } = await supabase.auth.signInWithOtp({
    phone: normalized,
  });
  return { error: error || null };
}

/**
 * Verify OTP and create session.
 * @param {string} phone - E.164 (with or without +)
 * @param {string} token - 6-digit code
 * @returns {{ error: Error | null }}
 */
export async function verifyPhoneOtp(phone, token) {
  const normalized = phone.replace(/\D/g, '');
  const { error } = await supabase.auth.verifyOtp({
    phone: normalized,
    token: token.trim(),
    type: 'sms',
  });
  return { error: error || null };
}
