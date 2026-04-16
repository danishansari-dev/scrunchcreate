
import { getProductPrice } from './src/utils/pricing.js';
import fs from 'fs';

const productsRaw = fs.readFileSync('./src/data/products.json', 'utf-8');
const products = JSON.parse(productsRaw);

const tests = [
    { id: 'classic-scrunchie-yellow', expected: 35 },
    { id: 'combo-scrunchie', expected: 99 },
    { id: 'satin-hairbow-black', expected: 79 },
    { id: 'jimmychoo-hairbow-peach-pink', expected: 99 },
    { id: 'gifthamper', expected: 699 },
    { id: 'satin-hamper-gifthamper-black', expected: 199 },
    { id: 'rose-flowerjewellery-yellow', expected: 399 }
];

console.log('--- Verifying Pricing Logic ---');
let passed = 0;
tests.forEach(t => {
    const p = products.find(x => x.id === t.id);
    if (!p) {
        console.log(`❌ ${t.id} NOT FOUND`);
        return;
    }
    const price = getProductPrice(p);
    if (price === t.expected) {
        console.log(`✅ ${t.id}: ${price}`);
        passed++;
    } else {
        console.log(`❌ ${t.id}: Expected ${t.expected}, Got ${price}`);
        console.log(`   Data: Category=${p.category}, Type=${p.type}, Name=${p.name}`);
    }
});

if (passed === tests.length) {
    console.log('ALL TESTS PASSED');
} else {
    console.log(`${tests.length - passed} TESTS FAILED`);
}
