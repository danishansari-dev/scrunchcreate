import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productsDir = path.join(__dirname, '../src/assets/products');
const outputFile = path.join(__dirname, '../src/data/products.json');

/**
 * Convert string to kebab-case slug
 */
function toSlug(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Convert slug to title case
 */
function slugToTitle(slug) {
  if (!slug) return '';
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get price based on category
 */
function getPrice(category) {
  const cat = category.toLowerCase();
  if (cat === 'hairbow') return 899;
  if (cat === 'scrunchie') return 499;
  if (cat === 'gifthamper') return 1299;
  return 0;
}

/**
 * Check if a file is an image
 */
function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
}

/**
 * Recursively find all leaf folders with images
 */
function findProductFolders(dir, relativePath = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const folders = [];
  const files = [];

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    
    // Skip certain folders
    const skipFolders = ['product measurements', 'paraandi', 'earring'];
    if (skipFolders.includes(entry.name.toLowerCase())) {
      return;
    }

    if (entry.isDirectory()) {
      folders.push({ name: entry.name, path: fullPath, relPath });
    } else if (entry.isFile() && isImageFile(entry.name)) {
      files.push(entry.name);
    }
  });

  // If this folder has images directly, it's a product folder
  if (files.length > 0 && folders.length === 0) {
    return [{
      path: dir,
      relativePath,
      images: files.map(f => `/assets/products/${relativePath}/${f}`)
    }];
  }

  // Recursively check subfolders
  const results = [];
  folders.forEach(folder => {
    const subResults = findProductFolders(folder.path, folder.relPath);
    results.push(...subResults);
  });

  return results;
}

/**
 * Parse product info from folder path
 */
function parseProductPath(relativePath) {
  const parts = relativePath.split('/').filter(Boolean);
  
  if (parts.length === 0) return null;

  // Pattern 1: Category/Type/Color (3 levels)
  if (parts.length >= 3) {
    const category = parts[0];
    const type = parts[1];
    const color = parts[parts.length - 1];
    return { category, type, color };
  }

  // Pattern 2: Category/Type (2 levels) - treat type as type, no color
  if (parts.length === 2) {
    const category = parts[0];
    const type = parts[1];
    return { category, type, color: null };
  }

  // Pattern 3: Category only (1 level)
  if (parts.length === 1) {
    const category = parts[0];
    return { category, type: null, color: null };
  }

  return null;
}

/**
 * Generate products.json
 */
function generateProducts() {
  console.log('Scanning products directory...');
  
  const productFolders = findProductFolders(productsDir);
  console.log(`Found ${productFolders.length} product folders`);

  const productsMap = new Map();
  const slugCollisions = new Map();

  productFolders.forEach(folder => {
    if (folder.images.length === 0) {
      console.warn(`[ProductGenerator] Folder "${folder.relativePath}" has no images`);
      return;
    }

    const parsed = parseProductPath(folder.relativePath);
    if (!parsed) {
      console.warn(`[ProductGenerator] Could not parse path: "${folder.relativePath}"`);
      return;
    }

    const { category, type, color } = parsed;
    
    // Generate slug: {type}-{category}-{color}
    let slug;
    if (type && color) {
      slug = `${toSlug(type)}-${toSlug(category)}-${toSlug(color)}`;
    } else if (type) {
      slug = `${toSlug(type)}-${toSlug(category)}`;
    } else {
      slug = toSlug(category);
    }

    // Check for slug collisions
    if (productsMap.has(slug)) {
      const existing = productsMap.get(slug);
      if (!slugCollisions.has(slug)) {
        slugCollisions.set(slug, [existing.relativePath]);
      }
      slugCollisions.get(slug).push(folder.relativePath);
      console.warn(`[ProductGenerator] Slug collision: "${slug}" from paths: ${slugCollisions.get(slug).join(', ')}`);
    }

    const product = {
      id: slug,
      slug,
      name: slugToTitle(slug),
      category,
      type: type || null,
      color: color || null,
      price: getPrice(category),
      images: folder.images.sort()
    };

    productsMap.set(slug, product);
  });

  // Log warnings
  if (slugCollisions.size > 0) {
    console.warn(`[ProductGenerator] Found ${slugCollisions.size} slug collision(s)`);
  }

  const products = Array.from(productsMap.values());

  // Ensure data directory exists
  const dataDir = path.dirname(outputFile);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write JSON file
  fs.writeFileSync(outputFile, JSON.stringify(products, null, 2), 'utf-8');
  console.log(`Generated ${products.length} products in ${outputFile}`);
  
  return products;
}

// Run the generator
generateProducts();

export { generateProducts };

