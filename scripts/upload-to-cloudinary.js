import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
require('dotenv').config(); // Loads root .env implicitly
const cloudinary = require('cloudinary').v2;

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error("❌ Missing Cloudinary environment variables in root .env");
  process.exit(1);
}

// Uses cloudinary v2 SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const MAP_FILE = path.resolve(process.cwd(), 'scripts', 'cloudinary-url-map.json');
const IMAGES_DIR = path.resolve(process.cwd(), 'public', 'assets', 'products');

// Recursively finds ALL .webp files in public/assets/products/
function getAllWebpFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllWebpFiles(fullPath, arrayOfFiles);
    } else {
      if (file.toLowerCase().endsWith('.webp')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function uploadImages() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('❌ Directory not found:', IMAGES_DIR);
    process.exit(1);
  }

  const files = getAllWebpFiles(IMAGES_DIR);
  console.log(`📸 Found ${files.length} .webp image(s) in public/assets/products/`);

  let urlMap = {};
  if (fs.existsSync(MAP_FILE)) {
    try {
      urlMap = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
      console.log(`📂 Loaded existing map with ${Object.keys(urlMap).length} entries (will skip these).`);
    } catch (e) {
      console.error('⚠️ Error parsing map file:', e.message);
    }
  }

  const publicDir = path.resolve(process.cwd(), 'public');
  let totalUploaded = 0;

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    
    // Generate relative path like /assets/products/hairbow/satin/black/img.webp
    const relativePath = '/' + path.relative(publicDir, filePath).replace(/\\/g, '/');
    
    if (urlMap[relativePath]) {
      continue;
    }

    console.log(`Uploading [${i + 1}/${files.length}]: ${path.basename(filePath)}`);
    
    try {
      const parts = relativePath.split('/').filter(Boolean); // ['assets', 'products', 'hairbow', ...]
      const folderParts = [...parts];
      // Replace 'assets' with 'scrunchcreate'
      folderParts[0] = 'scrunchcreate';
      folderParts.pop(); // Remove the filename to get just the folder path
      
      const folderPath = folderParts.join('/'); // scrunchcreate/products/hairbow/...
      
      const result = await cloudinary.uploader.upload(filePath, {
        folder: folderPath,
        use_filename: true,
        unique_filename: false,
        overwrite: true
      });

      urlMap[relativePath] = result.secure_url;
      totalUploaded++;

      // Save output to scripts/cloudinary-url-map.json continuously
      fs.writeFileSync(MAP_FILE, JSON.stringify(urlMap, null, 2), 'utf8');

    } catch (err) {
      console.error(`❌ Failed to upload ${relativePath}:`, err.message);
    }
  }

  // Logs final count
  console.log(`\nDone! ${totalUploaded} images uploaded`);
}

uploadImages().catch(err => {
  console.error("❌ Upload process failed:", err.message);
  process.exit(1);
});
