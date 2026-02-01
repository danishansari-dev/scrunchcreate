
const fs = require('fs');
const path = require('path');

const products = require('./src/data/products.json');

const summary = {};

products.forEach(p => {
    const key = `${p.category} | ${p.type}`;
    if (!summary[key]) {
        summary[key] = { count: 0, examples: [] };
    }
    summary[key].count++;
    if (summary[key].examples.length < 3) {
        summary[key].examples.push(p.name);
    }
});

console.log(JSON.stringify(summary, null, 2));
