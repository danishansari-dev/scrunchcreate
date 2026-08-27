/**
 * Export product catalog from src/data/products.json to a Shopify-compatible Product CSV
 *
 * Why this file exists:
 * Generates standard Shopify product import CSV file matching Shopify product schema,
 * calculating accurate offer prices, compare-at prices, variant color options, and image URLs.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsDataPath = path.resolve(__dirname, '../src/data/products.json');
const cloudinaryMapPath = path.resolve(__dirname, './cloudinary-url-map.json');
const outputPath = path.resolve(__dirname, '../shopify-migration/shopify_products_import.csv');

const productsData = JSON.parse(fs.readFileSync(productsDataPath, 'utf8'));
let cloudinaryMap = {};
if (fs.existsSync(cloudinaryMapPath)) {
  try {
    cloudinaryMap = JSON.parse(fs.readFileSync(cloudinaryMapPath, 'utf8'));
  } catch (e) {
    console.warn('Could not parse cloudinary-url-map.json', e);
  }
}

// Pricing table
const OFFER_PRICE_TABLE = {
  scrunchie: {
    default: 40,
    types: {
      classic: 40,
      tulip: 69,
      'tulip-sheer': 79,
      'satin-mini': 30,
      'satin-printed': 40,
      combo: 99
    }
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
      combo: 399
    }
  },
  gifthamper: {
    default: 199,
    types: {
      'satin-hamper': 699,
      'glimmer-grace': 189
    }
  },
  flowerjewellery: {
    default: 399,
    types: {
      rose: 399,
      combo: 399
    }
  },
  earring: {
    default: 99
  },
  paraandi: {
    default: 399
  }
};

const MRP_MARKUP = {
  scrunchie: 0.20,
  hairbow: 0.20,
  gifthamper: 0.15,
  flowerjewellery: 0.15,
  earring: 0.25,
  paraandi: 0.15
};

function getProductPrice(product) {
  const category = (product.category || '').toLowerCase();
  const type = (product.type || '').toLowerCase();

  let offerPrice = 0;
  if (product.offerPrice && product.offerPrice > 0) {
    offerPrice = product.offerPrice;
  } else if (OFFER_PRICE_TABLE[category]) {
    const catConfig = OFFER_PRICE_TABLE[category];
    if (type && catConfig.types && catConfig.types[type]) {
      offerPrice = catConfig.types[type];
    } else {
      offerPrice = catConfig.default || 99;
    }
  } else {
    offerPrice = product.price || 99;
  }

  const markup = MRP_MARKUP[category] || 0.20;
  let originalPrice = Math.round(offerPrice * (1 + markup));
  if (originalPrice <= offerPrice) {
    originalPrice = offerPrice + 20;
  }

  return { offerPrice, originalPrice };
}

function resolveImage(img) {
  if (!img) return '';
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  if (cloudinaryMap[img]) return cloudinaryMap[img];
  return `https://scrunchcreate.com${img}`;
}

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const headers = [
  'Handle',
  'Title',
  'Body (HTML)',
  'Vendor',
  'Product Category',
  'Type',
  'Tags',
  'Published',
  'Option1 Name',
  'Option1 Value',
  'Variant SKU',
  'Variant Grams',
  'Variant Inventory Tracker',
  'Variant Inventory Qty',
  'Variant Inventory Policy',
  'Variant Fulfillment Service',
  'Variant Price',
  'Variant Compare At Price',
  'Variant Requires Shipping',
  'Variant Taxable',
  'Image Src',
  'Image Position',
  'Image Alt Text',
  'Status'
];

const rows = [headers.join(',')];

productsData.forEach(product => {
  const handle = product.slug || product.id;
  const title = product.name;
  const description = `<p>${product.description || 'Handcrafted hair accessory made with premium materials.'}</p>`;
  const vendor = 'Scrunch & Create';
  const productType = product.category ? (product.category.charAt(0).toUpperCase() + product.category.slice(1)) : 'Accessories';
  const tags = [product.category, product.type, 'Handmade', 'Hair Accessories'].filter(Boolean).join(', ');
  const published = 'TRUE';
  const status = 'active';

  const pricing = getProductPrice(product);
  const variants = product.variants && product.variants.length > 0 ? product.variants : [{
    id: product.id,
    color: product.color || 'Default',
    images: product.images || [product.image]
  }];

  // Collect all product-level images
  const allImages = [];
  variants.forEach(v => {
    if (v.images && Array.isArray(v.images)) {
      v.images.forEach(img => {
        const resolved = resolveImage(img);
        if (resolved && !allImages.includes(resolved)) {
          allImages.push(resolved);
        }
      });
    }
  });
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach(img => {
      const resolved = resolveImage(img);
      if (resolved && !allImages.includes(resolved)) {
        allImages.push(resolved);
      }
    });
  }

  variants.forEach((variant, vIdx) => {
    const color = variant.color ? (variant.color.charAt(0).toUpperCase() + variant.color.slice(1)) : 'Default';
    const sku = variant.id || `${handle}-${vIdx + 1}`;
    const imageSrc = allImages[vIdx] || (allImages.length > 0 ? allImages[0] : '');

    const row = [
      escapeCsv(handle),
      escapeCsv(vIdx === 0 ? title : ''),
      escapeCsv(vIdx === 0 ? description : ''),
      escapeCsv(vIdx === 0 ? vendor : ''),
      escapeCsv(vIdx === 0 ? 'Apparel & Accessories > Clothing Accessories > Hair Accessories' : ''),
      escapeCsv(vIdx === 0 ? productType : ''),
      escapeCsv(vIdx === 0 ? tags : ''),
      escapeCsv(vIdx === 0 ? published : ''),
      escapeCsv('Color'),
      escapeCsv(color),
      escapeCsv(sku),
      escapeCsv('50'),
      escapeCsv('shopify'),
      escapeCsv('20'),
      escapeCsv('continue'),
      escapeCsv('manual'),
      escapeCsv(pricing.offerPrice),
      escapeCsv(pricing.originalPrice),
      escapeCsv('TRUE'),
      escapeCsv('FALSE'),
      escapeCsv(imageSrc),
      escapeCsv(imageSrc ? vIdx + 1 : ''),
      escapeCsv(`${title} - ${color}`),
      escapeCsv(vIdx === 0 ? status : '')
    ];
    rows.push(row.join(','));
  });

  // Additional images beyond variant count
  if (allImages.length > variants.length) {
    for (let i = variants.length; i < allImages.length; i++) {
      const extraImageRow = [
        escapeCsv(handle),
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
        escapeCsv(allImages[i]),
        escapeCsv(i + 1),
        escapeCsv(`${title} view ${i + 1}`),
        ''
      ];
      rows.push(extraImageRow.join(','));
    }
  }
});

fs.writeFileSync(outputPath, rows.join('\n'), 'utf8');
console.log(`Successfully exported ${productsData.length} products to ${outputPath}`);
