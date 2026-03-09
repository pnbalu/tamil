# Google & Phone Authentication Setup

This app uses **Supabase Auth** for Google OAuth and Phone (SMS OTP). Follow the steps below to enable them.

---

## 1. Google Authentication

### 1.1 Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Open **APIs & Services** → **Credentials**.
4. Click **Create Credentials** → **OAuth client ID**.
5. If asked, configure the **OAuth consent screen** (External, add your app name and support email).
6. Choose **Web application** as the application type.
7. Set **Authorized redirect URIs** to:
   ```
   https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback
   ```
   Replace `<YOUR_SUPABASE_PROJECT_REF>` with your project reference (from Supabase Dashboard URL: `https://supabase.com/dashboard/project/<this-part>`).
8. Click **Create** and copy the **Client ID** and **Client Secret**.

### 1.2 Supabase Dashboard

1. In [Supabase Dashboard](https://supabase.com/dashboard), open your project.
2. Go to **Authentication** → **Providers**.
3. Find **Google** and enable it.
4. Paste the **Client ID** and **Client Secret** from Google Cloud.
5. Save.

### 1.3 Redirect URL for the app

1. In Supabase, go to **Authentication** → **URL Configuration**.
2. Under **Redirect URLs**, add your app’s redirect URL. The app uses the scheme `tamil`:
   - **Expo Go / dev:** add the URL shown in the terminal when you run `npx expo start` (e.g. `exp://192.168.x.x:8081`), or use **tunnel**: run `npx expo start --tunnel` and add the `https://...exp.direct` URL.
   - **Development build:** add:
     ```
     tamil://auth/callback
     ```
3. Save.

### 1.4 Install dependencies (if not already)

```bash
npm install expo-auth-session expo-web-browser
```

### 1.5 Notes

- **Expo Go:** OAuth may not work reliably in Expo Go. Use a **development build** (`npx expo run:ios` or `npx expo run:android`) for testing Google sign-in.
- The app uses `scheme: "tamil"` in `app.json` so the redirect URL is `tamil://auth/callback`.

---

## 2. Phone (SMS OTP) Authentication

### 2.1 Enable Phone in Supabase

1. In Supabase Dashboard, go to **Authentication** → **Providers**.
2. Find **Phone** and enable it.
3. Save.

### 2.2 Configure an SMS provider

Supabase does not send SMS by default. You must configure one of the supported providers.

1. In Supabase Dashboard, go to **Authentication** → **Providers** → **Phone** (or **Project Settings** → **Auth** → **SMS**, depending on UI).
2. Choose an **SMS provider** and follow the in-dashboard instructions:

   **Option A – Twilio (common)**  
   - Sign up at [Twilio](https://www.twilio.com/).  
   - Get **Account SID**, **Auth Token**, and a **Phone Number** (or Messaging Service SID).  
   - In Supabase, select Twilio and enter SID, Auth Token, and the sending number (or Messaging Service SID).

   **Option B – MessageBird, Vonage, TextLocal**  
   - See [Supabase Phone Login](https://supabase.com/docs/guides/auth/phone-login) for each provider’s setup.

3. Save the provider configuration.

### 2.3 Phone number format

The app sends the number to Supabase as-is; it should be in **E.164** format (e.g. `+919876543210`). The UI allows the user to type with or without `+`; the code normalizes it before calling Supabase.

### 2.4 Rate limits

Supabase applies rate limits to OTP (e.g. one OTP per phone per 60 seconds). If you need different limits, adjust them in **Project Settings** → **Auth** → **Rate Limits** (or equivalent in your Supabase version).

---

## 3. Quick checklist

| Step | Google | Phone |
|------|--------|--------|
| Enable provider in Supabase | ✅ Authentication → Providers → Google | ✅ Authentication → Providers → Phone |
| External config | Google Cloud: OAuth client, redirect URI | SMS provider (e.g. Twilio) |
| Redirect / URL config | Add `tamil://auth/callback` (and dev/tunnel URL if needed) | — |
| App scheme | `scheme: "tamil"` in `app.json` | — |

---

## 4. Testing

- **Google:** Run a development build (`npx expo run:ios` or `npx expo run:android`), tap **Google** on Login or Sign Up, and complete the flow.
- **Phone:** Enter a phone number in E.164 form, tap **Send code**, then enter the 6-digit OTP from SMS and tap **Verify**.

If something fails, check Supabase **Authentication** → **Logs** for errors.
