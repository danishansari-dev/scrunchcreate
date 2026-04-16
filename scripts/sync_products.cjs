const fs = require('fs');
const path = require('path');

const PRODUCTS_JSON_PATH = path.join(__dirname, '../src/data/products.json');
const ASSETS_DIR = path.join(__dirname, '../public/assets/products');

// Helper to get all files recursively
function getFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            getFiles(filePath, fileList);
        } else {
            if (/\.(webp|jpg|jpeg|png)$/i.test(file)) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

// Helper to format string for ID/Slug
function slugify(text) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

// Helper to format title (e.g. "satin-hairbow" -> "Satin Hairbow")
function titleize(slug) {
    return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

async function syncProducts() {
    console.log('Starting product sync...');

    // 1. Load existing products to preserve metadata
    let existingProducts = [];
    try {
        if (fs.existsSync(PRODUCTS_JSON_PATH)) {
            const data = fs.readFileSync(PRODUCTS_JSON_PATH, 'utf8');
            existingProducts = JSON.parse(data);
        }
    } catch (err) {
        console.error('Error reading existing products.json:', err);
    }

    // Create lookup map for existing products to preserve metadata
    const productMap = new Map();
    existingProducts.forEach(p => {
        const key = `${p.category}-${p.type || 'null'}`;
        productMap.set(key, p);
    });

    const categories = fs.readdirSync(ASSETS_DIR).filter(f => fs.statSync(path.join(ASSETS_DIR, f)).isDirectory());
    const newProducts = [];

    for (const category of categories) {
        const categoryDir = path.join(ASSETS_DIR, category);
        const types = fs.readdirSync(categoryDir).filter(f => fs.statSync(path.join(categoryDir, f)).isDirectory());

        for (const type of types) {
            const typeDir = path.join(categoryDir, type);
            // Check if this typeDir has sub-folders (variants) or files directly (legacy structure mostly, but we assume standardized 3-level deep)
            // Standard structure: assets/products/{category}/{type}/{variant}/{image.webp}
            // However, we need to handle cases where there might be mix.
            // Based on user request and current JSON, it seems mostly:
            // Category matching "hairbow", "scrunchie" etc.
            // Type matching "satin", "combo" etc.

            let productKey = `${category}-${type}`;
            let existingProduct = productMap.get(productKey);

            // Fallback for types that might be null in JSON but folder name exists?
            // Actually, we should stick to the folder structure defining the product structure.

            let productData = {
                id: existingProduct?.id || `${category}-${type}`,
                slug: existingProduct?.slug || `${category}-${type}`,
                name: existingProduct?.name || `${titleize(type)} ${titleize(category)}`,
                category: category,
                type: type,
                price: existingProduct?.price || 0,
                description: existingProduct?.description || `Beautiful ${titleize(type)} ${titleize(category)}.`,
                variants: []
            };

            // Get variants (subfolders)
            const variants = fs.readdirSync(typeDir).filter(f => {
                const fullPath = path.join(typeDir, f);
                return fs.statSync(fullPath).isDirectory();
            });

            console.log(`Processing ${category}/${type}: found ${variants.length} variants`);

            // Also handle images directly in type folder (if any, treated as a "default" or "standard" variant maybe?)
            // Current patterns show variants are folders like "black", "red", "combo" etc.

            if (variants.length === 0) {
                // Maybe files are directly here?
                const files = fs.readdirSync(typeDir).filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f));
                console.log(`Checking direct files in ${typeDir}: found ${files.length}`);
                if (files.length > 0) {
                    // Treat as single variant product?
                    // Let's create a "standard" variant
                    let variantId = existingProduct?.variants[0]?.id || `${productData.id}-standard`;
                    productData.variants.push({
                        id: variantId,
                        slug: variantId,
                        color: 'Standard',
                        images: files.map(f => `/assets/products/${category}/${type}/${f}`)
                    });
                }
            } else {
                for (const variant of variants) {
                    const variantDir = path.join(typeDir, variant);
                    const images = fs.readdirSync(variantDir)
                        .filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f))
                        .map(f => `/assets/products/${category}/${type}/${variant}/${f}`);

                    if (images.length > 0) {
                        // Try to find existing variant to preserve ID if possible
                        let existingVariant = existingProduct?.variants?.find(v => v.color.toLowerCase() === variant.toLowerCase() || v.slug.includes(variant.toLowerCase()));

                        let variantId = existingVariant?.id || `${productData.id}-${slugify(variant)}`;

                        productData.variants.push({
                            id: variantId,
                            slug: variantId,
                            color: existingVariant?.color || titleize(variant), // Use folder name as color/variant name
                            images: images
                        });
                    }
                }
            }

            // Only add product if it has variants with images
            if (productData.variants.length > 0) {
                newProducts.push(productData);
            }
        }

        // START: Handle categories that might be products themselves (like 'gifthamper' in the existing JSON?)
        // In current JSON 'gifthamper' is a category AND a product id.
        // existing: id: "gifthamper", category: "gifthamper", type: null
        // structure: public/assets/products/gifthamper/sc-gifthamper-1.webp
        // The previous loop iterates categories (gifthamper). Inside it iterates types.
        // If 'gifthamper' folder has images directly, they are ignored by the inner loop which looks for directories (types).
        // Let's handle direct images in category folder as a "null type" product.

        const directImages = fs.readdirSync(categoryDir).filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f));
        if (directImages.length > 0) {
            let productKey = `${category}-null`;
            let existingProduct = productMap.get(productKey); // key in map would be "gifthamper-null"

            // It seems existing JSON has type: null for these.

            let productData = {
                id: existingProduct?.id || category, // Default ID to category name if new
                slug: existingProduct?.slug || category,
                name: existingProduct?.name || titleize(category),
                category: category,
                type: null,
                price: existingProduct?.price || 0,
                description: existingProduct?.description || `Beautiful ${titleize(category)} collection.`,
                variants: []
            };

            let variantId = existingProduct?.variants[0]?.id || category;
            productData.variants.push({
                id: variantId,
                slug: variantId,
                color: existingProduct?.variants[0]?.color || 'Standard',
                images: directImages.map(f => `/assets/products/${category}/${f}`)
            });

            newProducts.push(productData);
        }
        // END: Handle direct images

    }

    // Preserve manual sort order? 
    // The user didn't ask for sort order preservation, but it's good practice.
    // However, since we are rebuilding the array, new items will be appended or inserted.
    // Let's just output the new list. The JSON file order might change.

    fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(newProducts, null, 2));
    console.log(`Successfully synced products. Total products: ${newProducts.length}`);
}

syncProducts();
