# Thirukural module setup

The Thirukural module uses 3 sections (பால்), 133 chapters (அதிகாரம்), and 1330 verses. **All kural detail content (meaning, explanation, example, story) is read from the database**—nothing is hardcoded in the app.

## 1. Run migrations

```bash
npm run supabase:db-push
```

Or apply migrations manually:

- `supabase/migrations/010_thirukural.sql` creates:
  - `thirukural_sections` (3 rows: Aram, Porul, Inbam)
  - `thirukural_adhigaram` (133 chapters)
  - `thirukural` (1330 verses; columns: line1_ta, line2_ta, meaning_en, explanation_en)
- `supabase/migrations/011_thirukural_example_story.sql` adds to `thirukural`:
  - `example_en`, `example_ta`, `story_en`, `story_ta` (optional rich content per verse)

## 2. Seed data

The seed script fetches [tk120404/thirukkural](https://github.com/tk120404/thirukkural) JSON from GitHub and upserts into your database.

```bash
npm run seed:thirukural
```

Requires:

- `EXPO_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- Network access to GitHub raw URLs

Optional env:

- `THIRUKKURAL_JSON_URL` – override kural JSON URL
- `THIRUKKURAL_DETAIL_URL` – override detail (chapter names) JSON URL

## 3. App flow

- **Thirukural tab**: Home with 3 sections, “Browse all 133 chapters”, and Play (Easy / Medium / Hard).
- **Sections**: Tap a section → list of chapters in that section → tap chapter → 10 verses → tap verse → detail (Tamil + English meaning/explanation).
- **Browse all chapters**: List of all 133 adhigarams → same chapter → verses → detail.
- **Play**: Fill-in-the-blank by difficulty:
  - **Easy**: 1 word missing per verse
  - **Medium**: 2 words missing
  - **Hard**: 3 words missing

All screens use the app theme (gradients, shadows, typography, colors).

## 4. Optional: Seed example and story content

To show **Example** and **Story** (English/Tamil) on the verse detail screen, populate the DB from a JSON file. A sample file with kurals 1–10 is at `scripts/data/thirukural-detail-content.json`. Add more entries in the same shape and run:

```bash
npm run insert:thirukural-detail-content
```

Or with a custom path: `npm run insert:thirukural-detail-content -- path/to/detail-content.json`

JSON format: `{ "1": { "example_en", "example_ta", "story_en", "story_ta" }, "2": { ... }, ... }`. The app only displays content that exists in the DB.

## 5. Long explanations (1000–3000 words per kural)

The app shows each kural’s **Explanation** from the database (`thirukural.explanation_en`). The seed fills short explanations from the source JSON. To use **long explanations (1000–3000 words)** for all 1330 kurals you can generate them or prepare a JSON file.

**Option A – Generate all 1330:** The repo includes two sample long explanations (kurals 1 and 2) in `scripts/data/thirukural-explanations.json`. To generate the rest you can use **either**:

- **OpenAI:** set `OPENAI_API_KEY` in `.env`, then run the script below.
- **Local LLM (no API key):** install [Ollama](https://ollama.com), run `ollama pull llama3.2`, then run the script. It will use `http://localhost:11434` by default. Optional: set `GEN_MODEL=llama3.2` or another model name.

```bash
npm run generate:thirukural-explanations
```

The script fetches each verse from the same source as the seed, calls the chosen LLM for a 1000–3000 word explanation, and appends to the JSON (resumable). Use `--start=3 --end=100` for a batch, or `--delay=5000` to slow down. When done, run `npm run insert:thirukural-explanations` to load into the DB.

**Option B – Prepare a JSON file manually:**

1. **Prepare a JSON file** with one explanation per kural.

   **Format A – object (id as key):**
   ```json
   {
     "1": "Full 1000–3000 word explanation for kural 1...",
     "2": "Full explanation for kural 2...",
     ...
     "1330": "..."
   }
   ```

   **Format B – array:**
   ```json
   [
     { "id": 1, "explanation_en": "Full 1000–3000 word explanation..." },
     { "id": 2, "explanation_en": "..." },
     ...
   ]
   ```

2. **Save the file** as `scripts/data/thirukural-explanations.json` (or any path).

3. **Run the insert script** (loads explanations from the JSON file into the DB):
   ```bash
   npm run insert:thirukural-explanations
   ```
   Or with a custom path:
   ```bash
   npm run insert:thirukural-explanations -- path/to/your-explanations.json
   ```

The insert script updates `thirukural.explanation_en` for each kural id in the file. The app reads and displays this from the database on the verse detail screen (English slide).
