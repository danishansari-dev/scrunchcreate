# Scripts

Operational scripts for seeding, media uploads, and one-off data tasks. Schema migrations live in `supabase/migrations/`.

- `seed-supabase.js` — Upserts products and variants from `products.json` and `cloudinary-url-map.json` into Supabase.
- `upload-to-cloudinary.js` — Uploads `.webp` files from `public/assets/products/` to Cloudinary and updates `cloudinary-url-map.json`.
- `reseed-with-cloudinary.js` — Legacy/inactive MongoDB reseed helper kept only for old migration reference; the live app uses Supabase.
- `sync_products.cjs` — Scans `public/assets/products/` and regenerates `src/data/products.json` from the filesystem layout.
- `exportToSheets.js` — Exports products, pricing rules, and store config into `prepared_*.json` for Google Sheets import.
- `run-admin-migration.js` — Compiles `VITE_ADMIN_EMAILS` from `.env` into `admin-migration-compiled.sql` from the admin RLS migration template.
- `cloudinary-url-map.json` — Static map of local image paths to Cloudinary CDN URLs used by seeding and the frontend.
- `admin-migration-compiled.sql` — Generated output from `run-admin-migration.js`; paste into the Supabase SQL Editor when applying admin RLS policies.
