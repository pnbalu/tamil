import { Platform } from 'react-native';
import { supabase } from './supabase';

const APP_SCHEME = 'tamil';

/**
 * Sign in with Google via Supabase OAuth.
 * Loads expo-web-browser and expo-auth-session only when called so the app can start without them.
 * Requires: Google provider enabled in Supabase, redirect URL in Dashboard, app scheme in app.json.
 * On native we use the app scheme so the redirect opens the app (not localhost, which fails on device).
 * @returns {{ error: Error | null }}
 */
export async function signInWithGoogle() {
  try {
    const [webBrowserMod, authSessionMod] = await Promise.all([
      import('expo-web-browser'),
      import('expo-auth-session'),
    ]);
    const WebBrowser = webBrowserMod.default ?? webBrowserMod;
    const makeRedirectUri = authSessionMod.makeRedirectUri;

    // On native, always use app scheme so Safari doesn't try to open localhost (device can't reach it)
    const redirectUrl =
      Platform.OS === 'web'
        ? makeRedirectUri({ path: 'auth/callback', scheme: APP_SCHEME })
        : `${APP_SCHEME}://auth/callback`;
    const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (oauthError) {
      return { error: oauthError };
    }

    if (!data?.url) {
      return { error: new Error('No auth URL returned') };
    }

    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectUrl,
      { preferEphemeralSession: false }
    );

    if (result.type !== 'success' || !result.url) {
      return { error: new Error('Sign in was cancelled or failed') };
    }

    const url = result.url;
    const params = url.includes('#') ? getParamsFromHash(url) : getParamsFromQuery(url);

    if (params.access_token && params.refresh_token) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });
      WebBrowser.maybeCompleteAuthSession();
      if (sessionError) return { error: sessionError };
      return { error: null };
    }

    if (params.error) {
      return { error: new Error(params.error_description || params.error) };
    }

    return { error: new Error('Could not get session from callback') };
  } catch (err) {
    if (err?.message?.includes('expo-web-browser') || err?.code === 'MODULE_NOT_FOUND') {
      return { error: new Error('Google sign-in is not available. Install expo-web-browser and expo-auth-session.') };
    }
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

function getParamsFromHash(url) {
  const hash = url.split('#')[1] || '';
  return Object.fromEntries(new URLSearchParams(hash));
}

function getParamsFromQuery(url) {
  try {
    const q = url.includes('?') ? url.split('?')[1] : '';
    return Object.fromEntries(new URLSearchParams(q));
  } catch {
    return {};
  }
}
