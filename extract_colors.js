const p = require('./src/data/products.json');
const colors = new Set();
p.forEach(x => { if (x.color) colors.add(x.color); });
console.log(JSON.stringify([...colors].sort(), null, 2));
