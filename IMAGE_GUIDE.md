# Product Images Guide for Scrunch & Create

## How to Add Your Product Images

### Step 1: Prepare Your Images

**Recommended Image Specifications:**
- **Format**: JPG or PNG
- **Size**: 800x800 pixels (square format works best)
- **Quality**: High resolution (at least 72 DPI for web)
- **File Size**: Keep under 500KB per image for fast loading

### Step 2: Organize Your Images

Place your product images in the `public/images/products/` folder with the following naming convention:

```
public/images/products/
├── blush-pink-scrunchie-1.jpg
├── blush-pink-scrunchie-2.jpg
├── blush-pink-scrunchie-3.jpg
├── lavender-bow-1.jpg
├── lavender-bow-2.jpg
├── lavender-bow-3.jpg
├── mint-green-scrunchie-1.jpg
├── mint-green-scrunchie-2.jpg
├── mint-green-scrunchie-3.jpg
├── beige-pearl-bow-1.jpg
├── beige-pearl-bow-2.jpg
├── beige-pearl-bow-3.jpg
├── pastel-combo-1.jpg
├── pastel-combo-2.jpg
├── pastel-combo-3.jpg
├── premium-silk-1.jpg
├── premium-silk-2.jpg
├── premium-silk-3.jpg
├── soft-pink-velvet-1.jpg
├── soft-pink-velvet-2.jpg
├── soft-pink-velvet-3.jpg
├── sage-bow-set-1.jpg
├── sage-bow-set-2.jpg
├── sage-bow-set-3.jpg
├── cream-lace-1.jpg
├── cream-lace-2.jpg
├── cream-lace-3.jpg
├── light-lavender-combo-1.jpg
├── light-lavender-combo-2.jpg
└── light-lavender-combo-3.jpg
```

### Step 3: Image Naming Convention

Use this format for naming your images:
- `product-name-color-number.jpg`
- Example: `blush-pink-scrunchie-1.jpg`

**Tips for Good Product Photos:**
1. **Lighting**: Use natural light or soft, even lighting
2. **Background**: Clean, neutral background (white, beige, or pastel)
3. **Angles**: Show multiple angles of each product
4. **Details**: Include close-ups to show texture and quality
5. **Consistency**: Keep the same style and lighting across all photos

### Step 4: Update Product Data (Optional)

If you want to use different image names, update the `src/data/products.js` file:

```javascript
images: [
  "/images/products/your-actual-image-name-1.jpg",
  "/images/products/your-actual-image-name-2.jpg",
  "/images/products/your-actual-image-name-3.jpg"
]
```

### Step 5: Test Your Images

1. Add your images to the `public/images/products/` folder
2. Refresh your browser at `http://localhost:5173/`
3. Check that images load correctly on:
   - Homepage featured products
   - Shop page product grid
   - Product detail pages

## Alternative Methods

### Method 2: Using Image URLs (for Production)

For production, you might want to use a CDN or image hosting service:

```javascript
images: [
  "https://your-cdn.com/images/blush-pink-scrunchie-1.jpg",
  "https://your-cdn.com/images/blush-pink-scrunchie-2.jpg",
  "https://your-cdn.com/images/blush-pink-scrunchie-3.jpg"
]
```

### Method 3: Using Imported Images (for Build Optimization)

For better build optimization, you can import images directly:

```javascript
import blushPink1 from '/images/products/blush-pink-scrunchie-1.jpg'
import blushPink2 from '/images/products/blush-pink-scrunchie-2.jpg'

// Then use in product data:
images: [blushPink1, blushPink2]
```

## Image Optimization Tips

1. **Compress Images**: Use tools like TinyPNG or ImageOptim
2. **WebP Format**: Consider using WebP for better compression
3. **Lazy Loading**: The app already includes lazy loading for images
4. **Responsive Images**: Consider adding different sizes for mobile/desktop

## Troubleshooting

**Images Not Loading?**
- Check file paths are correct
- Ensure images are in the `public/images/products/` folder
- Verify file names match exactly (case-sensitive)
- Check browser console for 404 errors

**Images Too Large/Slow?**
- Compress your images
- Reduce image dimensions
- Consider using a CDN for production

## Quick Start

1. Take photos of your products
2. Resize them to 800x800 pixels
3. Save them as JPG files
4. Place them in `public/images/products/` with the names listed above
5. Refresh your browser to see the changes!

Your images will automatically appear in the product listings once you add them to the correct folder.
