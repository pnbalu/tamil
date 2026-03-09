# Smart Quiz Setup

The Smart Quiz serves **multiple-choice questions from the database** (no AI at runtime). You need to run the migration that creates the question table and then seed it with questions.

---

## 1. Database: migration and seed (required)

1. **Run migrations** so the `quiz_questions` table exists:
   ```bash
   npx supabase db push
   ```
   Or apply the migration `005_quiz_questions.sql` from your project’s `supabase/migrations` in the Supabase SQL Editor.

2. **Seed 5000 questions** using the script (uses Tamil vocabulary from `scripts/vocabulary.js`):
   - In `.env`, set `SUPABASE_SERVICE_ROLE_KEY` (Supabase Dashboard → Settings → API → service_role key). Do not commit this key.
   - From the project root:
   ```bash
   npm run seed:quiz
   ```
   This inserts 5000 rows into `quiz_questions`. The app will then load random questions from this table when the user starts a quiz.

---

## 2. (Legacy) AI-based quiz — optional

The following describes the previous setup that used an AI provider to generate questions on demand. **The app no longer uses this by default**; the quiz reads from the database instead. You can skip this section unless you want to keep or restore the AI Edge Function for another use.

### Choose a provider and get an API key

- **OpenAI**: [API Keys](https://platform.openai.com/api-keys) → create key. Uses `gpt-4o-mini`.
- **Google Gemini**: [Google AI Studio](https://aistudio.google.com/apikey) → get API key. Uses `gemini-2.0-flash` by default; optional secret `GEMINI_MODEL` can override with a [supported model](https://ai.google.dev/api/models) (e.g. `gemini-2.5-flash`). If you get 404 for the model, remove `GEMINI_MODEL` to use the default.
- **Anthropic Claude**: [Anthropic Console](https://console.anthropic.com/) → API keys. Uses `claude-3-5-haiku`.

---

## 2. Set Supabase secrets (Edge Function)

The Smart Quiz **Edge Function** (`generate-quiz-questions`) runs on Supabase and calls the AI API. It needs two things: which provider to use, and that provider’s API key. You set both as **Supabase secrets** (they are not in your code or repo).

---

### Option A: Configure via Supabase Dashboard (no CLI for secrets)

You can set the provider and API key **entirely in the Supabase Console**—no terminal required.

1. Open **[Supabase Dashboard](https://supabase.com/dashboard)** and select your project.
2. Go to **Edge Functions** in the left sidebar → **Secrets** (or **Project Settings** → **Edge Functions** → **Secrets**). This is where you add environment variables for your functions.
3. Add these secrets as **Key** / **Value** pairs (Save after each or use bulk add if available):

   | Key | Value |
   |-----|--------|
   | `QUIZ_AI_PROVIDER` | `openai` or `gemini` or `claude` |
   | `OPENAI_API_KEY` | Your OpenAI key (e.g. `sk-proj-...`) — only if provider is `openai` |
   | `GEMINI_API_KEY` | Your Gemini key — only if provider is `gemini` |
   | `GEMINI_MODEL`   | (Optional) Override model; default `gemini-2.0-flash`. Use a [supported model ID](https://ai.google.dev/api/models). If you see 404, remove this secret. |
   | `ANTHROPIC_API_KEY` | Your Anthropic key — only if provider is `claude` |

4. You only need to set **one** of the three API key secrets, matching the provider you chose for `QUIZ_AI_PROVIDER`.

**Deploying the function** still needs to be done once (from your machine or CI), because the Dashboard doesn’t upload your function code. So you’ll need to run the deploy step from **Option B** at least once. After that, you can change or add secrets anytime in the Dashboard.

---

### Option B: Use the CLI (deploy + secrets)

Use this if you prefer the terminal or need to deploy the function.

### Prerequisites

- **Supabase CLI** – use one of these (do **not** use `npm install -g supabase`; global npm install is not supported):
  - **From this project (recommended):** run `npm install` in the project root, then use `npx supabase` for all commands below (e.g. `npx supabase functions deploy generate-quiz-questions`).
  - **Or Homebrew (macOS):** `brew install supabase/tap/supabase` then use `supabase` directly.
- Project **linked** to your Supabase project: from the project root run `npx supabase link` (or `supabase link`) and pick your project (or use `--project-ref <your-ref>`).
- **Access token** for deploy: either run `npx supabase login` once (browser opens, token is saved), or add to your `.env` file:
  - Get a token: [Supabase Dashboard → Account → Access Tokens](https://supabase.com/dashboard/account/tokens) → Generate new token.
  - Add line: `SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxx` (replace with your token).
  - Then run `npm run supabase:deploy`; it loads `.env` and uses the token.

### Step 1: Deploy the function

From the **project root** (where `supabase/functions/generate-quiz-questions` lives):

```bash
npx supabase functions deploy generate-quiz-questions
```

(If you installed the CLI via Homebrew, you can run `supabase functions deploy generate-quiz-questions` without `npx`.)

You should see a success message and the function URL. The app calls this URL when the user taps **Start Quiz**.

### Step 2: Set the provider

Choose one of: `openai`, `gemini`, `claude`. Set the secret (replace `openai` if you use another):

```bash
npx supabase secrets set QUIZ_AI_PROVIDER=openai
```

- `openai` → uses **OpenAI** (GPT).
- `gemini` → uses **Google Gemini**.
- `claude` → uses **Anthropic Claude**.

### Step 3: Set the API key for that provider

Set **only the key for the provider** you chose in Step 2.

**If you chose OpenAI:**

```bash
npx supabase secrets set OPENAI_API_KEY=sk-proj-xxxxxxxxxxxx
```

Get the key from [OpenAI API Keys](https://platform.openai.com/api-keys). Create a key and paste it (starts with `sk-`). Do not commit this key or put it in app code.

**If you chose Gemini:**

```bash
npx supabase secrets set GEMINI_API_KEY=AIzaSyxxxxxxxxxxxx
```

Get the key from [Google AI Studio](https://aistudio.google.com/apikey). Create an API key and paste it.

**If you chose Claude:**

```bash
npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
```

Get the key from [Anthropic Console](https://console.anthropic.com/) → API keys. Create a key and paste it.

### Verify secrets (optional)

List the secret names (values are hidden):

```bash
npx supabase secrets list
```

You should see at least `QUIZ_AI_PROVIDER` and one of `OPENAI_API_KEY`, `GEMINI_API_KEY`, or `ANTHROPIC_API_KEY`.

### Notes

- **Security:** Secrets are stored in Supabase and are only available to your Edge Functions. Never put API keys in `.env`, in the app, or in git.
- **Switching provider:** Run `npx supabase secrets set QUIZ_AI_PROVIDER=gemini` (for example) and set the matching key. You do not need to redeploy the function.
- **Gemini 429 (quota exceeded):** If you see "You exceeded your current quota" or "RESOURCE_EXHAUSTED", the Gemini free tier limit is reached. See [Gemini API rate limits](https://ai.google.dev/gemini-api/docs/rate-limits). Options: wait for the quota to reset (often daily), try a different [supported model](https://ai.google.dev/api/models) via `GEMINI_MODEL`, or switch provider to OpenAI/Claude.
- **Gemini 404 (model not found):** If you see "models/... is not found for API version v1beta", the value of `GEMINI_MODEL` is invalid or retired. Remove the `GEMINI_MODEL` secret to use the default `gemini-2.0-flash`, or set it to a current model from Google's list.
- **Errors in the app:** If the quiz fails with “Could not generate questions” or similar, check: (1) the correct API key secret is set for your chosen provider, (2) the key is valid and has quota, (3) the function is deployed and the project is linked.

---

## 3. Optional: choose provider from Supabase (database)

After running the migration that creates `app_config`, you can store the provider in the database so it can be changed without redeploying:

```sql
-- In Supabase SQL Editor
update public.app_config set value = 'gemini' where key = 'quiz_ai_provider';
```

Allowed values: `openai`, `gemini`, `claude`. If `QUIZ_AI_PROVIDER` secret is set, it overrides the database value.

---

## 4. Run migrations

Ensure the quiz tables and config exist:

```bash
supabase db push
```

Or run the SQL in `supabase/migrations/003_quiz_sessions.sql` in the Supabase SQL Editor.

---

## Flow in the app

1. User opens **Practice** tab → taps **Smart Quiz**.
2. **Quiz setup**: choose number of questions (5–25) and time per question (15s, 30s, 1 min) → **Start Quiz**.
3. Edge Function `generate-quiz-questions` is called with `count` and `level`; the AI returns that many questions.
4. **Quiz run**: one question at a time with a countdown; tap an option or wait for timeout → next question.
5. **Results**: score and “Try again” or “Back to Practice”. Result is stored in `quiz_sessions` if the user is logged in.
