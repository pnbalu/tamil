# Culture images: DB vs manual upload to Supabase

Culture cards use an image for each **category** (Culture home) and each **item** (Category screen). You can either store image URLs in the database or upload files to Supabase Storage and then store those URLs in the DB.

## Option 1: Store URLs in the database only

- Set **`image_url`** on `culture_categories` and/or `culture_items` to any public image URL (e.g. from your CDN, Unsplash, etc.).
- In **Supabase Dashboard** → **Table Editor** → `culture_categories` or `culture_items` → edit a row and paste the URL in the `image_url` column.
- The app uses `image_url` when present; otherwise it falls back to built-in placeholder images.

## Option 2: Upload images manually to Supabase Storage

You can upload images in the Supabase Dashboard and then paste the public URL into the table.

### 1. Create a Storage bucket (one-time)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Storage** in the sidebar.
3. Click **New bucket**.
4. Name: `culture-images`.
5. Enable **Public bucket** (so the app can load images without auth).
6. Click **Create bucket**.

### 2. Upload images

1. Open the **culture-images** bucket.
2. Create folders (optional but tidy):
   - `categories` – one image per category (e.g. `festivals.jpg`, `food-drink.jpg`).
   - `items` – one image per item (e.g. `diwali.jpg`, `pongal.jpg`); you can use item slug or any naming you track.
3. Click **Upload file** and choose your image (e.g. JPG/PNG; keep under ~100KB for faster loading if you want).
4. After upload, click the file → **Get URL** (or use the public URL pattern below).

### 3. Public URL format

Supabase Storage public URLs look like:

```text
https://<PROJECT_REF>.supabase.co/storage/v1/object/public/culture-images/categories/festivals.jpg
https://<PROJECT_REF>.supabase.co/storage/v1/object/public/culture-images/items/diwali.jpg
```

Replace `<PROJECT_REF>` with your project reference (e.g. from **Settings** → **General**).

### 4. Save the URL in the database

1. Go to **Table Editor** → **culture_categories** (or **culture_items**).
2. Find the row (by name or slug).
3. Paste the full public URL into the **image_url** column and save.

The app will then use this image for that category or item.

## Option 3: Upload from a folder (script)

If you prefer to upload many files at once from your computer:

1. Put images in the folder used by the script (see script header for paths).
2. Name files by **slug** (e.g. `festivals.jpg`, `diwali.jpg`).
3. Set `EXPO_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`.
4. Run:

```bash
npm run upload:culture-images
```

The script uploads files to the **culture-images** bucket and updates **image_url** in `culture_categories` and `culture_items` by matching slug. See the script source for exact folder layout and slug rules.

## Summary

| Goal                         | Action |
|-----------------------------|--------|
| Use any external image      | Paste URL in **image_url** in Table Editor. |
| Upload your own files       | Create bucket **culture-images** (public), upload in Dashboard, paste URL in **image_url**. |
| Bulk upload from computer   | Use `npm run upload:culture-images` (after adding the script and folder). |

Images are always referenced by URL; the app does not store binary image data in the database.
