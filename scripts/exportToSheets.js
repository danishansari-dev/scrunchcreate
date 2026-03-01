// Script to prepare JSON data for Google Sheets MCP Prompt
import fs from 'fs';
import path from 'path';

// 1. Prepare Products Data
const productsStr = fs.readFileSync('src/data/products.json', 'utf8');
const products = JSON.parse(productsStr);

const productsData = products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category || '',
    type: p.type || '',
    description: p.description || '',
    tags: (p.tags || []).join(', '),
    active: 'TRUE'
}));

fs.writeFileSync('prepared_products.json', JSON.stringify(productsData, null, 2));
console.log(`Saved ${productsData.length} products to prepared_products.json`);

// 2. Prepare Pricing Data
const pricingStr = fs.readFileSync('src/utils/pricing.js', 'utf8');
const offerPriceTableMatch = pricingStr.match(/const OFFER_PRICE_TABLE = (\{[\s\S]*?\});/);
const mrpMarkupMatch = pricingStr.match(/const MRP_MARKUP = (\{[\s\S]*?\});/);

let evalOfferPrice = {};
let evalMrpMarkup = {};

if (offerPriceTableMatch) {
    // using Function to evaluate the object literal safely
    evalOfferPrice = new Function('return ' + offerPriceTableMatch[1])();
}
if (mrpMarkupMatch) {
    evalMrpMarkup = new Function('return ' + mrpMarkupMatch[1])();
}

let pricingRows = [];
for (const [category, data] of Object.entries(evalOfferPrice)) {
    const markup = evalMrpMarkup[category] || 0.20;
    if (typeof data === 'number') {
        pricingRows.push({ category, type: 'default', offerPrice: data, mrpMarkup: markup });
    } else {
        if (data.default !== undefined) pricingRows.push({ category, type: 'default', offerPrice: data.default, mrpMarkup: markup });
        if (data.types) {
            for (const [type, price] of Object.entries(data.types)) {
                pricingRows.push({ category, type, offerPrice: price, mrpMarkup: markup });
            }
        }
    }
}

fs.writeFileSync('prepared_pricing.json', JSON.stringify(pricingRows, null, 2));
console.log(`Saved ${pricingRows.length} pricing rules to prepared_pricing.json`);

// 3. Prepare Config Data
const configRows = [
    { key: 'WHATSAPP_NUMBER', value: '919497817668' },
    { key: 'FREE_SHIPPING_THRESHOLD', value: '999' },
    { key: 'SHIPPING_CHARGE', value: '65' },
    { key: 'GIFT_WRAP_COST', value: '99' },
    { key: 'STORE_NAME', value: 'ScrunchCreate' },
    { key: 'INSTAGRAM_HANDLE', value: '@scrunchcreate' }
];

fs.writeFileSync('prepared_config.json', JSON.stringify(configRows, null, 2));
console.log(`Saved ${configRows.length} config rows to prepared_config.json`);
