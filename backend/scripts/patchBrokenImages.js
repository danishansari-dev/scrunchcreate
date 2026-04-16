/*
 * One-time image URL sanitizer.
 * Last run: 2026-04-08
 * Fixed: 10 stale scrunchcreate.com URLs across 4 products.
 * Safe to re-run after seeding — idempotent, no data loss.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

// Adjusting the import based on the standard backend file tree structure
const Product = require('../src/models/Product.js');

async function patchBrokenImages() {
  let scanned = 0;
  let patched = 0;
  let totalRemoved = 0;

  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in backend/.env');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ Connected: ${mongoose.connection.host}`);
    console.log('🔍 Scanning products for stale image URLs...\n');

    // Retrieve all products without projection as we need to update/save them
    const products = await Product.find({});

    for (const product of products) {
      scanned++;

      // Safety check (in case images array doesn't exist or is not an array)
      if (!product.images || !Array.isArray(product.images)) continue;

      const originalCount = product.images.length;

      // Retain exclusively valid Cloudinary URLs
      const validImages = product.images.filter((url) => {
        return url && url.startsWith('https://res.cloudinary.com');
      });

      const removedCount = originalCount - validImages.length;

      // If we found and stripped faulty URLs
      if (removedCount > 0) {
        product.images = validImages;
        await product.save();
        
        console.log(`🔧 Patched "${product.name}": removed ${removedCount} stale image(s).`);
        patched++;
        totalRemoved += removedCount;
      }
    }

    // Final Summary Log
    console.log('\n=====================================');
    console.log('🏁 Patch complete!');
    console.log(`   Total products scanned: ${scanned}`);
    console.log(`   Total products patched: ${patched}`);
    console.log(`   Total broken URLs removed: ${totalRemoved}`);
    console.log('=====================================');

  } catch (error) {
    console.error('\n❌ Patch failed with error:', error.message);
    process.exitCode = 1;
  } finally {
    // Ensuring the connection is always cleanly closed regardless of error or success
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB.');
    }
  }
}

patchBrokenImages();
