
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'debug_output.txt');
const log = (msg) => fs.appendFileSync(logFile, msg + '\n');

try {
    const ASSETS_ROOT = path.join(__dirname, 'public/assets/products');
    log(`Assets root: ${ASSETS_ROOT}`);
    log(`Exists: ${fs.existsSync(ASSETS_ROOT)}`);

    const specificPath = path.join(ASSETS_ROOT, 'flowerjewellery', 'rose', 'yellow');
    log(`Specific path: ${specificPath}`);
    log(`Exists: ${fs.existsSync(specificPath)}`);

    if (fs.existsSync(specificPath)) {
        const files = fs.readdirSync(specificPath);
        log(`Files: ${files.join(', ')}`);
    } else {
        // Try casing variants
        const parent = path.join(ASSETS_ROOT, 'flowerjewellery', 'rose');
        log(`Parent path: ${parent}`);
        if (fs.existsSync(parent)) {
            log(`Parent Files: ${fs.readdirSync(parent).join(', ')}`);
        }
    }

} catch (e) {
    log(`Error: ${e.message}`);
}
