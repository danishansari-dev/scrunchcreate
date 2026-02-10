import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync, writeFileSync } from 'fs'
import { join, dirname, extname, basename } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Folders to exclude from product generation
const EXCLUDED_FOLDERS = ['Marketing', 'Product measurements', 'marketing', 'product measurements']

// ============================================
// CENTRALIZED PRICING CONFIGURATION
// Single source of truth for all product prices
// Rules are evaluated in order - first match wins
// ============================================
const PRICING_RULES = [
  // ============================================
  // SPECIFIC OVERRIDES (most specific first)
  // ============================================

  // Gift Hampers
  { match: { category: 'GiftHamper', type: 'Satin hamper' }, price: 199 },
  { match: { category: 'GiftHamper' }, price: 699 },

  // Hair Bow - Mini bow pack
  { match: { category: 'HairBow', type: 'Satin', color: 'mini' }, price: 359 },

  // Scrunchie Combo packs (specific colors first)
  { match: { category: 'Scrunchie', type: 'Combo', color: 'Tulip' }, price: 349 },
  { match: { category: 'Scrunchie', type: 'Combo', color: 'tulip-sheer' }, price: 599 },

  // ============================================
  // TYPE-LEVEL RULES
  // ============================================

  // Scrunchies
  { match: { category: 'Scrunchie', type: 'Combo' }, price: 99 },
  { match: { category: 'Scrunchie', type: 'Satin_mini' }, price: 399 },

  // Hair Bows by type
  { match: { category: 'HairBow', type: 'JimmyChoo' }, price: 99 },
  { match: { category: 'HairBow', type: 'Satin' }, price: 79 },
  { match: { category: 'HairBow', type: 'Sheer_Satin' }, price: 79 },
  { match: { category: 'HairBow', type: 'Velvet' }, price: 79 },
  { match: { category: 'HairBow', type: 'Scarf' }, price: 79 },
  { match: { category: 'HairBow', type: 'Satin Tulip Bows' }, price: 79 },
  { match: { category: 'HairBow', type: 'Satin princes Bow' }, price: 79 },
  { match: { category: 'HairBow', type: 'Classic' }, price: 79 },
  { match: { category: 'HairBow', type: 'Combo' }, price: 79 },

  // ============================================
  // CATEGORY-LEVEL DEFAULTS
  // ============================================

  // Single scrunchies
  { match: { category: 'Scrunchie' }, price: 35 },

  // Hair bows default
  { match: { category: 'HairBow' }, price: 79 },

  // Flower Jewellery - enquiry only
  { match: { category: 'FlowerJewellery' }, price: 0 },

  // Earrings
  { match: { category: 'Earring' }, price: 99 },

  // Paraandi
  { match: { category: 'Paraandi' }, price: 199 },
]

/**
 * Get price for a product based on its attributes
 */
function getProductPrice(product) {
  const { category, type, color } = product

  for (const rule of PRICING_RULES) {
    const { match, price } = rule

    let isMatch = true

    if (match.category && match.category !== category) {
      isMatch = false
    }
    if (match.type && match.type !== type) {
      isMatch = false
    }
    if (match.color && match.color !== color) {
      isMatch = false
    }

    if (isMatch) {
      return price
    }
  }

  // Default price if no rule matches
  return 0
}

// Valid image extensions - PRIORITIZE WEBP
const VALID_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png', '.gif']

/**
 * Convert string to Title Case
 */
function toTitleCase(str) {
  if (!str) return ''
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Convert string to kebab-case slug
 */
function toSlug(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Check if a folder should be excluded
 */
function isExcluded(folderName) {
  return EXCLUDED_FOLDERS.some(excluded =>
    excluded.toLowerCase() === folderName.toLowerCase()
  )
}

/**
 * Recursively collect all image files from a directory
 */
function collectImages(dir, basePath = '') {
  const images = []
  if (!existsSync(dir)) return images

  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase()
      if (VALID_EXTENSIONS.includes(ext)) {
        images.push(join(basePath, entry.name).replace(/\\/g, '/'))
      }
    }
  }
  return images
}

/**
 * Create a product object with pricing
 */
function createProduct(productKey, name, category, type, color, images) {
  const product = {
    id: productKey,
    slug: productKey,
    name,
    category,
    type: type || null,
    color: color || null,
    price: 0, // Will be set below
    images,
  }
  product.price = getProductPrice(product)
  return product
}

/**
 * Scan the products directory and generate product objects
 * Structure: Category/[Type]/[Color]/images
 */
function generateProductsFromFolder(productsDir) {
  const products = new Map()

  if (!existsSync(productsDir)) return []

  // Get all category folders
  const categoryFolders = readdirSync(productsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !isExcluded(entry.name))

  for (const categoryEntry of categoryFolders) {
    const category = categoryEntry.name
    const categoryPath = join(productsDir, category)
    const categoryEntries = readdirSync(categoryPath, { withFileTypes: true })

    // Check for images directly in category folder (flat structure)
    const categoryImages = categoryEntries
      .filter(e => e.isFile() && VALID_EXTENSIONS.includes(extname(e.name).toLowerCase()))
      .map(e => `/assets/products/${category}/${e.name}`)

    if (categoryImages.length > 0) {
      const productKey = toSlug(category)
      products.set(productKey, createProduct(
        productKey,
        toTitleCase(category),
        category,
        null,
        null,
        categoryImages
      ))
    }

    // Get type subfolders
    const typeFolders = categoryEntries
      .filter(entry => entry.isDirectory() && !isExcluded(entry.name))

    for (const typeEntry of typeFolders) {
      const type = typeEntry.name
      const typePath = join(categoryPath, type)
      const typeEntries = readdirSync(typePath, { withFileTypes: true })

      // Check for images directly in type folder (no color subfolder)
      const typeImages = typeEntries
        .filter(e => e.isFile() && VALID_EXTENSIONS.includes(extname(e.name).toLowerCase()))
        .map(e => `/assets/products/${category}/${type}/${e.name}`)

      if (typeImages.length > 0) {
        const productKey = toSlug(`${type}-${category}`)
        products.set(productKey, createProduct(
          productKey,
          `${toTitleCase(type)} ${toTitleCase(category)}`,
          category,
          type,
          null,
          typeImages
        ))
      }

      // Get color subfolders
      const colorFolders = typeEntries
        .filter(entry => entry.isDirectory() && !isExcluded(entry.name))

      for (const colorEntry of colorFolders) {
        const color = colorEntry.name
        const colorPath = join(typePath, color)
        const colorEntries = readdirSync(colorPath, { withFileTypes: true })

        // Get images in color folder
        const colorImages = colorEntries
          .filter(e => e.isFile() && VALID_EXTENSIONS.includes(extname(e.name).toLowerCase()))
          .map(e => `/assets/products/${category}/${type}/${color}/${e.name}`)

        if (colorImages.length > 0) {
          const productKey = toSlug(`${type}-${category}-${color}`)
          products.set(productKey, createProduct(
            productKey,
            `${toTitleCase(type)} ${toTitleCase(category)} ${toTitleCase(color)}`,
            category,
            type,
            color,
            colorImages
          ))
        }

        // Handle even deeper nesting (depth 4+) - treat as color variations
        const deeperFolders = colorEntries
          .filter(entry => entry.isDirectory() && !isExcluded(entry.name))

        for (const deeperEntry of deeperFolders) {
          const deeperName = deeperEntry.name
          const deeperPath = join(colorPath, deeperName)
          const deeperImages = collectImages(deeperPath)
            .map(img => `/assets/products/${category}/${type}/${color}/${deeperName}/${img}`)

          if (deeperImages.length > 0) {
            const productKey = toSlug(`${type}-${category}-${color}-${deeperName}`)
            products.set(productKey, createProduct(
              productKey,
              `${toTitleCase(type)} ${toTitleCase(category)} ${toTitleCase(color)} ${toTitleCase(deeperName)}`,
              category,
              type,
              `${color} ${deeperName}`,
              deeperImages
            ))
          }
        }
      }
    }
  }

  // Convert to array and sort images
  const productList = Array.from(products.values()).map(product => ({
    ...product,
    images: product.images.sort((a, b) => {
      // Sort logic
      return a.localeCompare(b)
    }),
  }))

  // Sort products by category, then by name
  productList.sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category)
    return a.name.localeCompare(b.name)
  })

  return productList
}

/**
 * Plugin to generate products.json from folder structure
 */
function generateProductsPlugin() {
  return {
    name: 'generate-products',
    buildStart() {
      generateProductsJson()
    },
    configureServer(server) {
      // Also generate on dev server start
      generateProductsJson()

      // Watch for changes in public/assets/products
      const productsDir = join(__dirname, 'public', 'assets', 'products')
      server.watcher.add(productsDir)

      // Debounce regeneration to batch rapid filesystem changes
      let debounceTimer = null
      const debouncedRegenerate = (eventType, path) => {
        if (path.includes('assets/products') || path.includes('assets\\products')) {
          clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => {
            console.log(`Product images ${eventType}: regenerating products.json...`)
            generateProductsJson()
          }, 500)
        }
      }

      // Listen for all relevant file events (not just 'change')
      server.watcher.on('change', (path) => debouncedRegenerate('changed', path))
      server.watcher.on('add', (path) => debouncedRegenerate('added', path))
      server.watcher.on('unlink', (path) => debouncedRegenerate('deleted', path))
      server.watcher.on('unlinkDir', (path) => debouncedRegenerate('folder deleted', path))
    }
  }
}

function generateProductsJson() {
  const productsDir = join(__dirname, 'public', 'assets', 'products')
  const outputPath = join(__dirname, 'src', 'data', 'products.json')

  if (!existsSync(productsDir)) {
    console.log('⚠ No products directory found at public/assets/products')
    writeFileSync(outputPath, '[]')
    return
  }

  const products = generateProductsFromFolder(productsDir)

  // Write to JSON file
  writeFileSync(outputPath, JSON.stringify(products, null, 2))
  console.log(`✓ Generated products.json with ${products.length} products`)

  // Log price summary for verification
  const priceSummary = {}
  products.forEach(p => {
    const key = `${p.category}/${p.type || 'default'}`
    if (!priceSummary[key]) {
      priceSummary[key] = { price: p.price, count: 0 }
    }
    priceSummary[key].count++
  })
  console.log('  Price summary:')
  Object.entries(priceSummary).forEach(([key, val]) => {
    console.log(`    ${key}: ₹${val.price} (${val.count} products)`)
  })
}

// Plugin to copy product images to public folder during build
function copyProductsPlugin() {
  return {
    name: 'copy-products',
    buildStart() {
      const srcDir = join(__dirname, 'src', 'assets', 'products')
      const destDir = join(__dirname, 'public', 'assets', 'products')

      function copyRecursive(src, dest) {
        if (!existsSync(src)) return

        if (!existsSync(dest)) {
          mkdirSync(dest, { recursive: true })
        }

        const entries = readdirSync(src, { withFileTypes: true })

        for (const entry of entries) {
          const srcPath = join(src, entry.name)
          const destPath = join(dest, entry.name)

          // Skip certain folders
          const skipFolders = ['product measurements', 'paraandi', 'earring']
          if (skipFolders.includes(entry.name.toLowerCase())) {
            continue
          }

          if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath)
          } else if (entry.isFile()) {
            const ext = entry.name.toLowerCase().split('.').pop()
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
              copyFileSync(srcPath, destPath)
            }
          }
        }
      }

      if (existsSync(srcDir)) {
        copyRecursive(srcDir, destDir)
        console.log('✓ Copied product images to public/assets/products')
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copyProductsPlugin(), generateProductsPlugin()],
})
