/**
 * Export Shopify Inventory CSV format for direct bulk inventory update
 *
 * Why this file exists:
 * Generates an Inventory-specific CSV matching Shopify's Inventory Import schema,
 * allowing instant quantity adjustment across all product variants at the primary store location.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsDataPath = path.resolve(__dirname, '../src/data/products.json');
const outputPath = path.resolve(__dirname, '../shopify-migration/shopify_inventory_import.csv');

const productsData = JSON.parse(fs.readFileSync(productsDataPath, 'utf8'));

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
  'Option1 Name',
  'Option1 Value',
  'Option2 Name',
  'Option2 Value',
  'Option3 Name',
  'Option3 Value',
  'SKU',
  'HS Code',
  'COO',
  'Location',
  'Incoming',
  'Unavailable',
  'Committed',
  'Available',
  'On hand'
];

const rows = [headers.join(',')];

productsData.forEach(product => {
  const handle = product.slug || product.id;
  const title = product.name;
  const variants = product.variants && product.variants.length > 0 ? product.variants : [{
    id: product.id,
    color: product.color || 'Default'
  }];

  variants.forEach((variant, vIdx) => {
    const color = variant.color ? (variant.color.charAt(0).toUpperCase() + variant.color.slice(1)) : 'Default';
    const sku = variant.id || `${handle}-${vIdx + 1}`;

    const row = [
      escapeCsv(handle),
      escapeCsv(title),
      escapeCsv('Color'),
      escapeCsv(color),
      '',
      '',
      '',
      '',
      escapeCsv(sku),
      '',
      '',
      escapeCsv('Primary location'),
      escapeCsv('0'),
      escapeCsv('0'),
      escapeCsv('0'),
      escapeCsv('50'),
      escapeCsv('50')
    ];
    rows.push(row.join(','));
  });
});

fs.writeFileSync(outputPath, rows.join('\n'), 'utf8');
console.log(`Successfully generated inventory CSV: ${outputPath}`);
