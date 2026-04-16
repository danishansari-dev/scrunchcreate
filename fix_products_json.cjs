
const fs = require('fs');
const path = require('path');

const PRODUCTS_JSON_PATH = path.join(__dirname, 'src/data/products.json');
const ASSETS_ROOT = path.join(__dirname, 'public/assets/products');

// Helper to slugify consistent with folder naming (lowercase, hyphens)
function slugify(text) {
    if (!text) return '';
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start
        .replace(/-+$/, '');            // Trim - from end
}

// Special overrides if auto-slugify doesn't match specific folders
const CATEGORY_OVERRIDES = {
    // Add overrides here if needed, e.g. 'GiftHamper': 'gifthamper' (slugify handles this)
};

function main() {
    console.log('Reading products.json...');
    const rawData = fs.readFileSync(PRODUCTS_JSON_PATH, 'utf-8');
    const products = JSON.parse(rawData);

    let updatedCount = 0;
    let missingImagesCount = 0;

    const productsWithMissingImages = [];

    products.forEach(product => {
        // Construct potential directory path
        // Hierarchy seems to be: Category / Type / Color
        // Or sometimes just Category / Type
        // Or Category / Color?
        // Let's rely on recursive search if exact path fails, or try multiple combinations.

        // Based on file list analysis:
        // public/assets/products/hairbow/satin/black/...
        // Category: HairBow -> hairbow
        // Type: Satin -> satin
        // Color: Black -> black

        const catSlug = slugify(product.category);
        const typeSlug = slugify(product.type);
        const colorSlug = slugify(product.color);

        let targetDir = path.join(ASSETS_ROOT, catSlug);

        if (typeSlug) {
            targetDir = path.join(targetDir, typeSlug);
        }

        if (colorSlug) {
            // Sometimes color is inside type, sometimes it might be direct if type is null?
            // But existing data usually has type if nested.
            // If type is present, color is usually inside it.
            targetDir = path.join(targetDir, colorSlug);
        }

        // Check if this constructed directory exists
        let foundImages = [];
        let searchDir = targetDir;

        // Debug first 5 items
        if (products.indexOf(product) < 5) {
            console.log(`Checking: ${product.id}`);
            console.log(`  Target Dir: ${searchDir}`);
            console.log(`  Exists: ${fs.existsSync(searchDir)}`);
        }

        if (fs.existsSync(searchDir)) {
            // Directory matches exact hierarchy
            foundImages = getImagesInDir(searchDir);
        } else {
            // Fallback: Try to find a matching folder by walking up? 
            // Or maybe the folder structure is slightly different.
            // Let's try to match loosely. 
            // Warning: ambiguous matching could link wrong images. 
            // Use stricter fallback: if color folder missing, look in Type folder?
            // But usually specific color products need specific color images.

            // Try explicit check without color if color was preventing match (just to see)
            // But we shouldn't use parent images for a specific color variant usually.

            // Let's log if not found.
            // Special handling for "Satin princes Bow" -> "satin-princes-bow"? Slugify should handle.
        }

        // Filter images to ensure they belong to this product?
        // Filenames usually allow loose matching, but if we are in the specific folder, 
        // we can probably assume all images in that leaf folder belong to the product 
        // IF the folder is specific to the product (Color level).
        // If the product is generic (no color), the folder might contain subfolders. 
        // We should ONLY take files, not directories.

        // Refined Logic:
        // 1. Get all files in the target directory (non-recursive).
        // 2. Sort them natural order.
        if (foundImages.length > 0) {
            // Update product images
            // Convert FS paths to URL paths
            product.images = foundImages.map(absPath => {
                // Remove public root
                // c:\Users\...\public\assets\products\... -> /assets/products/...
                const relPath = path.relative(path.join(__dirname, 'public'), absPath);
                return '/' + relPath.replace(/\\/g, '/');
            });
            updatedCount++;
            // console.log(`Updated ${product.id}: ${foundImages.length} images`);
        } else {
            missingImagesCount++;
            productsWithMissingImages.push({
                id: product.id,
                path: searchDir,
                exists: fs.existsSync(searchDir)
            });
            console.warn(`No images found for ${product.id} at ${searchDir}`);

            // Keep old images? Or clear them? 
            // If we cant find new ones, likely the old paths are also dead since we know folders moved.
            // But keeping them might be less destructive if I made a logic error.
            // User Intention: "Update every image reference... Fix all incorrect... paths"
            // If I verify the old paths don't exist, I should probably leave it empty or flagged.
            // But let's leave old path if we fail, so we don't wipe data accidentally.
        }
    });

    console.log(`\nSummary:`);
    console.log(`Total Products: ${products.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Missing/No Images found: ${missingImagesCount}`);

    // Overwrite file
    fs.writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(products, null, 2));
    console.log('products.json updated.');
}

function getImagesInDir(dir) {
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir);
    const images = files
        .filter(f => /\.(png|jpg|jpeg|webp|avif|svg)$/i.test(f))
        .map(f => path.join(dir, f));

    // Sort logic to preserve order 1, 2, 10...
    return images.sort((a, b) => {
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });
}

main();
