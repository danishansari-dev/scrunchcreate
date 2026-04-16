/**
 * Database seed script.
 * Reads the frontend product JSON, flattens variants into individual Product
 * documents, computes real prices from the pricing table, and inserts them
 * into MongoDB.
 *
 * Usage: cd backend && node seed.js
 */
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Load backend env vars (MONGO_URI, etc.)
dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./src/models/Product');

// ─── Pricing table (mirrored from src/utils/pricing.js) ─────────────
// Duplicated here because pricing.js uses ESM exports and runs in the
// browser context — this seed script uses CommonJS.
const OFFER_PRICE_TABLE = {
  scrunchie: {
    default: 40,
    types: {
      classic: 40,
      tulip: 69,
      'tulip-sheer': 79,
      'satin-mini': 30,
      'satin-printed': 40,
      combo: 99,
    },
  },
  hairbow: {
    default: 79,
    types: {
      jimmychoo: 99,
      satin: 79,
      'sheer-satin': 79,
      velvet: 79,
      scarf: 99,
      'satin-princes': 79,
      'satin-tulip': 89,
      'satin-mini': 49,
      'printed-mini': 59,
      combo: 399,
    },
  },
  gifthamper: {
    default: 199,
    types: {
      'satin-hamper': 699,
      'glimmer-grace': 189,
    },
  },
  flowerjewellery: {
    default: 399,
    types: {
      rose: 399,
      combo: 399,
    },
  },
  earring: { default: 99 },
  paraandi: { default: 399 },
};

/**
 * Resolves the offer price for a product using its category and type.
 * Falls back to 99 if the category is unknown.
 * @param {string} category - Product category (e.g. "hairbow")
 * @param {string|null} type - Product sub-type (e.g. "satin")
 * @returns {number} Price in INR
 */
function resolvePrice(category, type) {
  const cat = (category || '').toLowerCase().replace(/\s+/g, '');
  const t = (type || '').toLowerCase();

  const catConfig = OFFER_PRICE_TABLE[cat];
  if (!catConfig) return 99;

  if (catConfig.types && catConfig.types[t]) {
    return catConfig.types[t];
  }

  return catConfig.default;
}

/** CDN base URL — points to the deployed frontend that hosts the images */
const IMAGE_BASE = 'https://scrunchcreate.com';

/**
 * Converts a relative image path to a full URL.
 * @param {string} relativePath - e.g. "/assets/products/hairbow/satin/black/img.webp"
 * @returns {string} Full URL
 */
function toFullUrl(relativePath) {
  if (!relativePath) return '';
  // Already a full URL
  if (relativePath.startsWith('http')) return relativePath;
  return `${IMAGE_BASE}${relativePath}`;
}

/**
 * Flattens the nested JSON structure into an array of Product-schema-compatible
 * documents. Each variant becomes its own product document.
 *
 * JSON shape per entry:
 *   { id, slug, name, category, type, price, description, variants[] }
 * Variant shape:
 *   { id, slug, color, images[] }
 *
 * Product schema fields:
 *   { name, description, price, category, stock, images[] }
 */
function mapProducts(rawProducts) {
  const docs = [];

  for (const product of rawProducts) {
    const category = product.category || 'uncategorized';
    const type = product.type || null;
    const price = resolvePrice(category, type);
    const baseDescription = product.description || product.name || 'No description';
    const variants = product.variants || [];

    if (variants.length === 0) {
      // Product with no variants — insert as a single document
      docs.push({
        name: product.name,
        description: baseDescription,
        price,
        category,
        stock: 100,
        images: [],
      });
      continue;
    }

    for (const variant of variants) {
      // Build a descriptive name including color/variant info
      const colorLabel = variant.color && variant.color !== 'Standard'
        ? ` — ${variant.color.replace(/-/g, ' ')}`
        : '';
      const name = `${product.name}${colorLabel}`;

      // Build a useful description that includes parent + variant context
      const description = variant.color && variant.color !== 'Standard'
        ? `${baseDescription} Color: ${variant.color.replace(/-/g, ' ')}.`
        : baseDescription;

      // Convert all relative image paths to full URLs
      const images = (variant.images || []).map(toFullUrl);

      docs.push({
        name,
        description,
        price,
        category,
        stock: 100,
        images,
      });
    }
  }

  return docs;
}

// ─── Main ────────────────────────────────────────────────────────────
async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in backend/.env');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`✅ Connected: ${mongoose.connection.host}`);

  // Read the frontend product catalog JSON
  const jsonPath = path.resolve(__dirname, '..', 'src', 'data', 'products.json');

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Product JSON not found at: ${jsonPath}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const rawJson = fs.readFileSync(jsonPath, 'utf-8');
  const rawProducts = JSON.parse(rawJson);
  console.log(`📦 Read ${rawProducts.length} top-level products from JSON`);

  // Flatten variants into individual product documents
  const docs = mapProducts(rawProducts);
  console.log(`🔄 Mapped to ${docs.length} product documents (variants flattened)`);

  // Clean seed — delete all existing products first
  const deleted = await Product.deleteMany({});
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing products`);

  // Insert all products
  const inserted = await Product.insertMany(docs);
  console.log(`✅ Inserted ${inserted.length} products into MongoDB`);

  // Summary breakdown by category
  const summary = {};
  for (const doc of docs) {
    summary[doc.category] = (summary[doc.category] || 0) + 1;
  }
  console.log('\n📊 Breakdown by category:');
  for (const [cat, count] of Object.entries(summary).sort()) {
    console.log(`   ${cat}: ${count}`);
  }

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected from MongoDB. Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
