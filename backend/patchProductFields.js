require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const mongoose = require('mongoose');
const Product = require('../backend/src/models/Product');

/**
 * Normalizes a string to be a valid CSS color if it is generic enough.
 * Provides a fallback.
 */
function normalizeColor(colorPart) {
  const c = colorPart.trim().toLowerCase();
  // We'll just use the raw color word as the hex which works for valid CSS words like 'black', 'pink', 'white'
  // Or we can map some. 'champagne' -> '#F7E7CE', 'peach' -> '#FFE5B4', etc.
  const colorMap = {
    'champagne': '#F7E7CE',
    'peach': '#FFE5B4',
    'maroon': '#800000',
    'mustard': '#FFDB58',
    'emerald': '#50C878',
    'sage' : '#9DC183',
    'blush': '#DE5D83',
    'dusty rose': '#DCAE96',
    'cream': '#FFFDD0',
    'ivory': '#FFFFF0',
    'wine': '#722F37',
    'navy': '#000080',
    'teal': '#008080',
    'lavender': '#E6E6FA',
    'olive': '#808000',
    'brown': '#964B00',
    'black': '#000000',
    'white': '#FFFFFF',
    'pink': '#FFC0CB',
    'blue': '#0000FF',
    'red': '#FF0000',
    'green': '#008000',
    'yellow': '#FFFF00',
    'purple': '#800080',
    'grey': '#808080',
    'gray': '#808080',
  };

  return colorMap[c] || c; // if not in map, just return the word, let CSS try to render it.
}

async function patchProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const products = await Product.find({}).sort({ createdAt: -1 });
    console.log(`Found ${products.length} products to patch.`);

    let updatedCount = 0;

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        
        let colors = [];
        let variants = [];

        // 1. Try to parse color from name (e.g. "Tulip Scrunchie - Black" or "Scrunchie — pink")
        const nameMatch = product.name.match(/[—\-]\s*([a-zA-Z\s]+)$/);
        if (nameMatch && nameMatch[1]) {
            const rawColor = nameMatch[1].trim();
            const colorCss = normalizeColor(rawColor);
            colors.push(rawColor);
            variants.push({
                id: 1,
                color: rawColor,
                colorHex: colorCss,
                image: product.images && product.images.length > 0 ? product.images[0] : ''
            });
        } else if (product.category === 'gifthamper') {
             // Let's just create a default variant for gift hampers so the frontend doesn't crash if it assumes variants exist
             variants.push({
                 id: 1,
                 color: 'Standard',
                 colorHex: '#ffffff',
                 image: product.images && product.images.length > 0 ? product.images[0] : ''
             });
        }

        // 2. Slug
        const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // 3. Pricing fields
        const originalPrice = Math.round(product.price * 1.2);
        const discountPercent = 16;

        // 4. Status flags
        // Mark first 8 as new arrival (since we sorted by createdAt: -1)
        const isNew = (i < 8);
        const isNewArrival = (i < 8);

        // Mark scrunchies and hairbows as featured (limit it to some or all? Let's just say all in these categories)
        const isFeatured = (product.category === 'scrunchie' || product.category === 'hairbow');

        // Apply changes
        product.colors = colors;
        product.variants = variants;
        product.slug = slug;
        product.originalPrice = originalPrice;
        product.discountPercent = discountPercent;
        product.isNew = isNew;
        product.isNewArrival = isNewArrival;
        product.isFeatured = isFeatured;

        await product.save();
        updatedCount++;
    }

    console.log(`Successfully updated ${updatedCount} products.`);
    
    // Test fetch one to verify
    const sample = await Product.findOne({ $expr: { $gt: [{ $size: "$variants" }, 0] } });
    console.log('\nSample patched product with variants:');
    if (sample) {
        console.log({
            name: sample.name,
            slug: sample.slug,
            price: sample.price,
            originalPrice: sample.originalPrice,
            variants: sample.variants,
            isNew: sample.isNew,
            isFeatured: sample.isFeatured
        });
    }

  } catch (error) {
    console.error('Error patching products:', error);
  } finally {
    mongoose.connection.close();
  }
}

patchProducts();
