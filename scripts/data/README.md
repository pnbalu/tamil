# Data for scripts

## thirukural-explanations.json

Used by `npm run insert:thirukural-explanations` to bulk-update long explanations (1000–3000 words per kural). Comes with **two sample explanations** (kurals 1 and 2). Fill the rest by running `npm run generate:thirukural-explanations` (requires `OPENAI_API_KEY`); the generator is resumable.

- **Object format:** `{ "1": "long text...", "2": "...", … "1330": "..." }`
- **Array format:** `[ { "id": 1, "explanation_en": "..." }, … ]`

## thirukural-detail-content.json

Optional. Used by `npm run insert:thirukural-detail-content` to populate example and story (English + Tamil) per kural. All kural detail content is read from the DB; this file only seeds it.

- **Format:** `{ "1": { "example_en", "example_ta", "story_en", "story_ta" }, "2": { … }, … }`
- Sample with kurals 1–10 is included; add more keys 1–1330 as needed.

See **docs/SETUP-THIRUKURAL.md** for full details.
