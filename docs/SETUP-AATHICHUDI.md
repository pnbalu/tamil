# Aathichudi module setup

**Aathichudi** (ஆத்திசூடி) is a classic Tamil work by **Avvaiyar**: 109 single-line verses in Tamil alphabetical order, with moral and practical wisdom. This module mirrors the Thirukural setup: data in Supabase, app reads from the DB.

## 1. Run migrations

```bash
npm run supabase:db-push
```

Or apply manually:

- `supabase/migrations/012_aathichudi.sql` — creates `aathichudi` (id, line_ta, meaning_en, explanation_en, sort_order).
- `supabase/migrations/013_aathichudi_example_story.sql` — adds optional `example_en`, `example_ta`, `story_en`, `story_ta` for richer detail.

## 2. Seed data

The seed script fetches [tk120404/Aathichudi](https://github.com/tk120404/Aathichudi) `aathicudi.json` from GitHub and upserts all 109 verses.

```bash
npm run seed:aathichudi
```

Requires:

- `EXPO_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
- Network access to GitHub raw URL

Optional env: `AATHICUDI_JSON_URL` — override JSON URL.

## 3. App flow

- **Aathichudi tab**: Home with title ஆத்திசூடி, “All 109 Verses”, “Today’s Verse”, and a daily verse card.
- **All 109 Verses**: List of verses; tap one → detail (Tamil line, meaning, explanation).
- **Today’s Verse**: Same as Thirukural — verse of the day by `dayOfYear % 109 + 1`.

All screens use the app theme (gradients, colors, typography).

## 4. Optional: long explanations and example/story

To add long explanations (1000–3000 words) or example/story content per verse, you can:

- Add columns or use existing `explanation_en` and the optional columns from migration 013.
- Create a seed JSON and insert script similar to Thirukural (`scripts/data/aathichudi-explanations.json` and `insert-aathichudi-explanations.js`) if you want the same pattern.
