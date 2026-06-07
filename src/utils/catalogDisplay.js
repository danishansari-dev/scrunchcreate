// The product feed has historic category/type values in several spellings; this keeps
// customer-facing labels polished without changing saved product data or URLs.
export const CATEGORY_DISPLAY_NAMES = {
  combo: 'Combo Sets',
  earring: 'Earrings',
  earings: 'Earrings',
  flowerjewellery: 'Flower Jewellery',
  gifthamper: 'Gift Hampers',
  hairbow: 'Hair Bows',
  hairclip: 'Hair Clips',
  paraandi: 'Paraandi',
  scrunchie: 'Scrunchies',
}

export const CATEGORY_SLUGS = {
  combo: 'combo',
  earring: 'earings',
  flowerjewellery: 'flower-jewellery',
  gifthamper: 'hamper',
  hairbow: 'hair-bows',
  hairclip: 'hairclips',
  paraandi: 'paraandi',
  scrunchie: 'scrunchies',
}

export const TYPE_DISPLAY_NAMES = {
  classic: 'Classic',
  combo: 'Combo',
  jimmychoo: 'Jimmy Choo',
  rose: 'Rose',
  satin: 'Satin',
  'satin-hamper': 'Satin Hamper',
  'satin-mini': 'Satin Mini',
  satin_mini: 'Satin Mini',
  Satin_mini: 'Satin Mini',
  'satin-printed': 'Satin Printed',
  satin_printed: 'Satin Printed',
  Satin_printed: 'Satin Printed',
  'satin-princes': 'Satin Princess',
  'Satin princes Bow': 'Satin Princess Bow',
  'satin-tulip': 'Satin Tulip',
  'Satin Tulip Bows': 'Satin Tulip Bows',
  scarf: 'Scarf',
  'sheer-satin': 'Sheer Satin',
  tulip: 'Tulip',
  'tulip-sheer': 'Tulip Sheer',
  velvet: 'Velvet',
  'printed-mini': 'Printed Mini',
  printed_mini: 'Printed Mini',
  Printed_mini: 'Printed Mini',
}

/**
 * Normalizes catalogue keys that arrive from URLs, generated JSON, and older imports.
 * @danishansari-dev value - Category or type-like value to normalize
 * @returns Lowercase key without spaces
 */
export function normalizeCatalogKey(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, '')
}

/**
 * Returns a customer-facing category label while preserving the raw category in data.
 * @danishansari-dev category - Category key from product data or route params
 * @returns Display-ready category label
 */
export function getCategoryDisplayName(category) {
  const key = normalizeCatalogKey(category)
  return CATEGORY_DISPLAY_NAMES[key] || String(category || 'Products')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

/**
 * Returns a customer-facing type label for filter chips and product metadata.
 * @danishansari-dev rawType - Product type value from product data
 * @returns Display-ready type label
 */
export function formatTypeName(rawType) {
  if (!rawType) return 'Handcrafted'
  if (TYPE_DISPLAY_NAMES[rawType]) return TYPE_DISPLAY_NAMES[rawType]

  return String(rawType)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
