/**
 * Why this script exists:
 * Reads the local products.json + cloudinary-url-map.json, computes
 * pricing/colors, and upserts everything into the Supabase products
 * and product_variants tables. Run once to seed the database.
 *
 * Usage: node scripts/seed-supabase.js
 *
 * Requires: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
 *           or set a SUPABASE_SERVICE_ROLE_KEY for admin writes
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Load env vars from .env file (simple parser, no dotenv dependency) ───
const envPath = join(__dirname, '..', '.env');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
} catch {
  // .env might not exist, rely on environment variables
}

// ─── Supabase client ─────────────────────────────────────────────────────
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Prefer service role key for seeding (bypasses RLS), fall back to anon key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Load local data ─────────────────────────────────────────────────────
const productsData = JSON.parse(
  readFileSync(join(__dirname, '..', 'src', 'data', 'products.json'), 'utf-8')
);

const cloudinaryMap = JSON.parse(
  readFileSync(join(__dirname, 'cloudinary-url-map.json'), 'utf-8')
);

// ─── Pricing logic (duplicated from src/shared/utils/pricing.js) ─────────
// Why duplicated: This is a Node script that can't import Vite-based modules.
const OFFER_PRICE_TABLE = {
  scrunchie: {
    default: 40,
    types: { classic: 40, tulip: 69, 'tulip-sheer': 79, 'satin-mini': 30, 'satin-printed': 40, combo: 99 }
  },
  hairbow: {
    default: 79,
    types: { jimmychoo: 99, satin: 79, 'sheer-satin': 79, velvet: 79, scarf: 99, 'satin-princes': 79, 'satin-tulip': 89, 'satin-mini': 49, 'printed-mini': 59, combo: 399 }
  },
  gifthamper: { default: 199, types: { 'satin-hamper': 699, 'glimmer-grace': 189 } },
  flowerjewellery: { default: 399, types: { rose: 399, combo: 399 } },
  earring: { default: 99 },
  paraandi: { default: 399 }
};

const MRP_MARKUP = {
  scrunchie: 0.20, hairbow: 0.20, gifthamper: 0.15,
  flowerjewellery: 0.15, earring: 0.25, paraandi: 0.15
};

function roundToNicePrice(price) {
  if (price < 500) return Math.ceil(price / 10) * 10 - 1;
  return Math.ceil(price / 100) * 100 - 1;
}

function calculateOfferPrice(product) {
  if (!product) return 0;
  const category = (product.category || '').toLowerCase().replace(/\s+/g, '');
  const type = (product.type || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  const catConfig = OFFER_PRICE_TABLE[category];
  if (!catConfig) return 99;

  if (category === 'scrunchie') {
    if (type === 'combo' || name.includes('combo') || name.includes('pack')) {
      if (name.includes('tulip') && name.includes('sheer')) return 599;
      if (name.includes('tulip')) return 199;
      if (type === 'satin-mini' || name.includes('mini')) return 399;
      if (type === 'satin-printed' || name.includes('printed')) return 197;
      return 99;
    }
    if (type === 'satin-printed') return 40;
    if (type === 'satin-mini' || type === 'satin_mini') {
      if (name.includes('pack') || name.includes('set') || name.includes('14')) return 399;
      return 30;
    }
    if (catConfig.types && catConfig.types[type]) return catConfig.types[type];
    return catConfig.default;
  }

  if (category === 'hairbow') {
    if (type === 'printed-mini' || type === 'printed_mini') return 59;
    if (OFFER_PRICE_TABLE.hairbow.types[type]) return OFFER_PRICE_TABLE.hairbow.types[type];
    if (name.includes('scarf')) return 99;
    return catConfig.default;
  }

  if (category === 'gifthamper') {
    if (type === 'satin-hamper') return 699;
    if (name.includes('glimmer') || name.includes('grace')) return 189;
    return 199;
  }

  if (typeof catConfig === 'object' && catConfig.default) {
    if (catConfig.types && catConfig.types[type]) return catConfig.types[type];
    return catConfig.default;
  }
  if (typeof catConfig === 'number') return catConfig;
  return 99;
}

function getProductPrice(product) {
  if (!product) return { offerPrice: 0, originalPrice: 0, discountPercent: 0 };
  const category = (product.category || '').toLowerCase().replace(/\s+/g, '');
  const offerPrice = calculateOfferPrice(product);
  const safeOfferPrice = offerPrice > 0 ? offerPrice : 99;
  const markup = MRP_MARKUP[category] || 0.20;
  const rawMrp = safeOfferPrice / (1 - markup);
  const originalPrice = roundToNicePrice(rawMrp);
  const discountPercent = originalPrice > safeOfferPrice
    ? Math.round(((originalPrice - safeOfferPrice) / originalPrice) * 100)
    : 0;
  return { offerPrice: safeOfferPrice, originalPrice, discountPercent };
}

// ─── Color normalization (minimal version) ────────────────────────────
const COLOR_HEX_MAP = {
  'black': '#000000', 'white': '#FFFFFF', 'cream': '#FFFDD0', 'beige': '#F5F5DC',
  'grey': '#808080', 'brown': '#8B4513', 'red': '#FF0000', 'wine': '#722F37',
  'maroon': '#800000', 'burgundy': '#800020', 'pink': '#FFC0CB', 'hot-pink': '#FF69B4',
  'baby-pink': '#F4C2C2', 'blush': '#DE5D83', 'rose': '#F33A6A', 'peach': '#FFDAB9',
  'peach-cream': '#FFEFDB', 'coral': '#FF7F50', 'orange': '#FFA500', 'yellow': '#FFFF00',
  'light-yellow': '#FFFFE0', 'mustard': '#FFDB58', 'gold': '#FFD700', 'green': '#008000',
  'olive': '#808000', 'metallic-olive': '#556B2F', 'olive-green': '#556B2F',
  'mint': '#98FF98', 'light-mint': '#E0FFE0', 'sage': '#9DC183', 'teal': '#008080',
  'turquoise': '#40E0D0', 'blue': '#0000FF', 'navy': '#000080', 'sky-blue': '#87CEEB',
  'petrol-blue': '#1F4E5F', 'royal-blue': '#4169E1', 'purple': '#800080',
  'lavender': '#E6E6FA', 'lilac': '#C8A2C8', 'magenta': '#FF00FF', 'pistachio': '#93C572',
  'chocolate': '#D2691E', 'silver': '#C0C0C0',
  'multi': 'linear-gradient(135deg, red, orange, yellow, green, blue, indigo, violet)',
  'combo': 'linear-gradient(135deg, #FFC0CB 50%, #87CEEB 50%)'
};

function normalizeColor(rawColor) {
  if (!rawColor) return null;
  return rawColor.toString().toLowerCase().trim().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function getColorHex(rawColor) {
  const normalized = normalizeColor(rawColor);
  if (!normalized) return '#dddddd';
  return COLOR_HEX_MAP[normalized] || normalized;
}

/**
 * Resolves a local asset path to its Cloudinary CDN URL
 * @param {string} path - Local asset path
 * @returns {string} Cloudinary URL or original path
 */
function toCloudinary(path) {
  if (!path) return path;
  return cloudinaryMap[path] || path;
}

// ─── Transform and seed ──────────────────────────────────────────────
async function seed() {
  console.log(`📦 Seeding ${productsData.length} products...`);

  const productRows = [];
  const variantRows = [];

  for (const product of productsData) {
    const hasVariants = product.variants && product.variants.length > 0;
    const pricing = getProductPrice(product);

    // Determine primary image
    const rawMainImage = product.image
      || (product.images && product.images.length > 0 ? product.images[0] : null)
      || (hasVariants && product.variants[0].images && product.variants[0].images[0]);
    const primaryImage = toCloudinary(rawMainImage);

    // Skip products with no image
    if (!primaryImage) {
      console.warn(`⚠️  Skipping ${product.id} — no image`);
      continue;
    }

    // Build images array
    let images;
    if (hasVariants) {
      const defaultVariant = product.variants[0];
      images = (product.images || (defaultVariant.images && defaultVariant.images.length > 0
        ? defaultVariant.images : [rawMainImage])).map(toCloudinary);
    } else {
      images = (product.images || [rawMainImage]).map(toCloudinary);
    }

    // Build available colors
    let availableColors = [];
    const productColor = product.color || (hasVariants ? product.variants[0].color : null);
    if (hasVariants) {
      availableColors = [...new Set(product.variants.map(v => normalizeColor(v.color)).filter(Boolean))];
    } else if (productColor) {
      availableColors = [normalizeColor(productColor)];
    }

    // Build variants JSONB for the products row (matches frontend shape)
    const variantsJsonb = hasVariants
      ? product.variants.map(v => ({
          id: v.id,
          slug: v.slug,
          color: v.color,
          colorHex: getColorHex(v.color),
          normalizedColor: normalizeColor(v.color),
          images: (v.images || []).map(toCloudinary),
          price: v.price || null,
          offerPrice: v.offerPrice || null,
        }))
      : [];

    // Product row
    productRows.push({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category,
      type: product.type || null,
      color: productColor || null,
      normalized_color: normalizeColor(productColor),
      color_hex: getColorHex(productColor),
      price: product.price || 0,
      offer_price: pricing.offerPrice,
      original_price: pricing.originalPrice,
      discount_percent: pricing.discountPercent,
      description: product.description || null,
      primary_image: primaryImage,
      images: images,
      available_colors: availableColors,
      badge: product.badge || null,
      in_stock: true,
      variants: variantsJsonb,
    });

    // Variant rows (normalized table)
    if (hasVariants) {
      for (const v of product.variants) {
        variantRows.push({
          id: v.id,
          product_id: product.id,
          slug: v.slug || null,
          color: v.color || null,
          normalized_color: normalizeColor(v.color),
          color_hex: getColorHex(v.color),
          price: v.price || null,
          offer_price: v.offerPrice || null,
          images: (v.images || []).map(toCloudinary),
          in_stock: true,
        });
      }
    }
  }

  // ─── Upsert products (batch of 50) ────────────────────────────────
  console.log(`📝 Upserting ${productRows.length} product rows...`);
  const BATCH_SIZE = 50;

  for (let i = 0; i < productRows.length; i += BATCH_SIZE) {
    const batch = productRows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Products batch ${i / BATCH_SIZE + 1} failed:`, error.message);
      process.exit(1);
    }
    console.log(`  ✅ Products batch ${Math.floor(i / BATCH_SIZE) + 1} done (${batch.length} rows)`);
  }

  // ─── Upsert variants (batch of 50) ────────────────────────────────
  if (variantRows.length > 0) {
    console.log(`📝 Upserting ${variantRows.length} variant rows...`);

    for (let i = 0; i < variantRows.length; i += BATCH_SIZE) {
      const batch = variantRows.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('product_variants')
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Variants batch ${i / BATCH_SIZE + 1} failed:`, error.message);
        process.exit(1);
      }
      console.log(`  ✅ Variants batch ${Math.floor(i / BATCH_SIZE) + 1} done (${batch.length} rows)`);
    }
  }

  // ─── Verify ────────────────────────────────────────────────────────
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: variantCount } = await supabase
    .from('product_variants')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✅ Seeding complete!`);
  console.log(`   Products in DB: ${productCount}`);
  console.log(`   Variants in DB: ${variantCount}`);
}

seed().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
