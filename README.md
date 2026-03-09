# தமிழ் கற்போம் – Tamil Katpom

A React Native (Expo) Tamil learning app with Supabase backend. Screens are based on the provided HTML reference. Auth uses email/password; forgot password uses a **secret question** (no OTP).

## Setup

### 1. Install dependencies

Already done if you created the app. Otherwise:

```bash
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env` and set:
   - `EXPO_PUBLIC_SUPABASE_URL` – project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` – anon/public key

3. Run the migration to create tables and RLS:

   - In Supabase Dashboard → SQL Editor, run the contents of `supabase/migrations/001_initial.sql`.

4. **Forgot password (secret question)**  
   Deploy the Edge Function so users can reset password by answering their secret question:

   ```bash
   npx supabase functions deploy verify-reset-password
   ```

   Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in the function secrets (Dashboard → Edge Functions → verify-reset-password → Secrets).

5. **Google & Phone authentication (optional)**  
   To enable **Google** sign-in and **Phone (SMS OTP)** login, follow the step-by-step guide:

   **[docs/SETUP-AUTH.md](docs/SETUP-AUTH.md)** – Google Cloud + Supabase provider setup, Supabase redirect URL, and SMS provider (e.g. Twilio) for phone OTP.

### 3. Run the app

```bash
npx expo start
```

Then open in Expo Go (scan QR) or a simulator.

## Screens (from reference)

- **Splash / Welcome** – Get Started, Sign In
- **Login** – Email, password, Forgot Password (secret question), Create Account
- **Sign Up** – Full name, email, password, secret question + answer, terms
- **Forgot Password** – Email → secret question → answer → new password (no OTP)
- **Onboarding** – Goal (why learn), Level (beginner/intermediate/advanced), Daily goal + reminder
- **Dashboard** – Greeting, streak, XP, today’s goal, lesson cards (Alphabet, Numbers, Family, Food)
- **Lesson detail** – Chapter overview, progress, topics
- **Learn** – Category list
- **Practice / Badges** – Placeholders
- **Profile** – Name, email, daily goal, Sign Out

## Tech

- **Expo** ~55, **React Native** 0.83
- **Navigation**: React Navigation (native stack + bottom tabs)
- **Backend**: Supabase (auth, profiles, lessons, progress)
- **Forgot password**: Secret question + Edge Function to verify and reset password

## Supabase schema (summary)

- **profiles** – `id`, `email`, `full_name`, `learning_goal`, `level`, `daily_goal_minutes`, `reminder_enabled`, `reminder_time`, `secret_question`, `secret_answer_hash`, `streak_days`, `total_xp`, etc.
- **lesson_categories** / **lessons** / **user_lesson_progress** – for learning content and progress.
- RPC **get_secret_question_for_reset(email)** – returns `secret_question` for forgot-password flow.
- Trigger **on_auth_user_created** – creates a row in `profiles` on sign up.

Secret answer is stored as SHA-256 hash (normalized: trim + lower case). The Edge Function hashes the submitted answer the same way and compares with `secret_answer_hash`.
