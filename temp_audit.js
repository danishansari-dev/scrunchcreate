const fs = require('fs');
const products = JSON.parse(fs.readFileSync('./src/data/products.json', 'utf-8'));

let totalProducts = products.length;
let categories = new Set();
let types = new Set();
let variantsInfo = { total: 0, withColor: 0, withSize: 0 };
let colors = new Set();
let allImages = 0;
let hasStock = false;
let stockFields = new Set();

products.forEach(p => {
    if (p.category) categories.add(p.category);
    if (p.type) types.add(p.type);
    if (p.inStock !== undefined || p.stock !== undefined || p.quantity !== undefined) {
        hasStock = true;
        if (p.inStock !== undefined) stockFields.add('inStock');
        if (p.stock !== undefined) stockFields.add('stock');
        if (p.quantity !== undefined) stockFields.add('quantity');
    }

    if (p.variants) {
        variantsInfo.total += p.variants.length;
        p.variants.forEach(v => {
            if (v.color) {
                colors.add(v.color);
                variantsInfo.withColor++;
            }
            if (v.size) variantsInfo.withSize++;
            if (v.images) {
                allImages += v.images.length;
            }
            if (v.inStock !== undefined || v.stock !== undefined || v.quantity !== undefined) {
                hasStock = true;
            }
        });
    } else if (p.images) {
        allImages += p.images.length;
    }
});

const report = {
    totalProducts,
    categories: Array.from(categories),
    types: Array.from(types),
    totalVariants: variantsInfo.total,
    allImages,
    totalColors: colors.size,
    sampleProduct: products[0],
    stock: {
        hasStock,
        fieldsUsed: Array.from(stockFields)
    }
};

fs.writeFileSync('./audit_data.json', JSON.stringify(report, null, 2));
console.log("Audit complete.");
