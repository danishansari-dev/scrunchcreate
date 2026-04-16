import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ProductCJS from '../backend/src/models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../backend/.env') });

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in backend/.env');
  process.exit(1);
}

// Fix Mongoose buffering timeout: 
// The ESM `import mongoose` and CJS `require('mongoose')` (used in backend) create 
// two separate instances in Node. Re-registering the schema to the active ESM mongoose instance solves this.
const Product = mongoose.models.Product || mongoose.model('Product', ProductCJS.schema);

// 6. EXACT same mapping logic as backend/seed.js
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

const IMAGE_BASE = 'https://scrunchcreate.com';

function toFullUrlWithCloudinary(relativePath, urlMap) {
  if (!relativePath) return '';
  // Replace with Cloudinary URL or fall back to scrunchcreate.com
  if (urlMap[relativePath]) return urlMap[relativePath];
  if (relativePath.startsWith('http')) return relativePath;
  return `${IMAGE_BASE}${relativePath}`;
}

function mapProducts(rawProducts, urlMap) {
  const docs = [];

  for (const product of rawProducts) {
    const category = product.category || 'uncategorized';
    const type = product.type || null;
    const price = resolvePrice(category, type);
    const baseDescription = product.description || product.name || 'No description';
    const variants = product.variants || [];

    if (variants.length === 0) {
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
      const colorLabel = variant.color && variant.color !== 'Standard'
        ? ` — ${variant.color.replace(/-/g, ' ')}`
        : '';
      const name = `${product.name}${colorLabel}`;

      const description = variant.color && variant.color !== 'Standard'
        ? `${baseDescription} Color: ${variant.color.replace(/-/g, ' ')}.`
        : baseDescription;

      const images = (variant.images || []).map(p => toFullUrlWithCloudinary(p, urlMap));

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

async function seed() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`✅ Connected: ${mongoose.connection.host}`);

  // Reads scripts/cloudinary-url-map.json
  const mapPath = resolve(__dirname, './cloudinary-url-map.json');
  if (!existsSync(mapPath)) {
    console.error(`❌ Missing url map file at: ${mapPath}. Run upload-to-cloudinary first.`);
    await mongoose.disconnect();
    process.exit(1);
  }
  const urlMap = JSON.parse(readFileSync(mapPath, 'utf8'));

  // Reads src/data/products.json
  const jsonPath = resolve(__dirname, '../src/data/products.json');
  if (!existsSync(jsonPath)) {
    console.error(`❌ Product JSON not found at: ${jsonPath}`);
    await mongoose.disconnect();
    process.exit(1);
  }
  const rawProducts = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  const docs = mapProducts(rawProducts, urlMap);

  // Deletes all existing products (Product.deleteMany)
  const deleted = await Product.deleteMany({});
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing products`);

  // Inserts all products with Cloudinary image URLs
  const inserted = await Product.insertMany(docs);
  console.log(`✅ Inserted ${inserted.length} products into MongoDB`);

  // Logs breakdown by category and total inserted
  const summary = {};
  for (const doc of docs) {
    summary[doc.category] = (summary[doc.category] || 0) + 1;
  }
  console.log('\n📊 Breakdown by category:');
  for (const [cat, count] of Object.entries(summary).sort()) {
    console.log(`   ${cat}: ${count}`);
  }

  // Disconnects cleanly
  await mongoose.disconnect();
  console.log('\n🔌 Disconnected from MongoDB. Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
