
/**
 * Official Pricing Configuration
 * Central source of truth for product pricing.
 */

const PRICING_TABLE = {
    // Category level defaults or specific maps
    scrunchie: {
        default: 35, // Fallback
        types: {
            classic: 35,
            tulip: 69,
            'tulip-sheer': 79,
            'satin-mini': 30, // Single
            // Combos/Packs handled by logic
            combo: 99 // Default combo (Classic Pack of 3)
        }
    },
    hairbow: {
        default: 79,
        types: {
            jimmychoo: 99,
            satin: 79,
            'sheer-satin': 79,
            velvet: 79,
            scarf: 99,
            'satin-princes': 79,
            'satin-tulip': 89,
            combo: 399 // Fallback for hairbow combo? Or maybe 79*3? 
            // Table didn't specify HairBow Combo explicitly except FlowerJewellery Combo.
            // But let's look at logic.
        }
    },
    gifthamper: {
        default: 699, // Royal Valentine / Default
        types: {
            'satin-hamper': 199,
            'glimmer-grace': 189
        }
    },
    flowerjewellery: {
        default: 399,
        types: {
            rose: 399, // Assumption based on "Combo" price or set
            combo: 399
        }
    },
    earring: {
        default: 99
    },
    paraandi: {
        default: 399
    }
};

/**
 * Calculate price for a product based on its metadata.
 * @param {Object} product - Product object from JSON
 * @returns {number} Price in INR
 */
export function getProductPrice(product) {
    if (!product) return 0;

    const category = (product.category || '').toLowerCase().replace(/\s+/g, '');
    const type = (product.type || '').toLowerCase();
    const name = (product.name || '').toLowerCase();

    // 1. Direct Category Match
    const catConfig = PRICING_TABLE[category];

    if (!catConfig) {
        console.warn(`[Pricing] Unknown category: ${category} for product ${product.id}`);
        return 0; // Or generic fallback?
    }

    // 2. Specialized Logic by Category

    // --- SCRUNCHIE ---
    if (category === 'scrunchie') {
        // Handle Combos / Packs
        if (type === 'combo' || name.includes('combo') || name.includes('pack')) {
            if (name.includes('tulip') && name.includes('sheer')) return 599; // Tulip-Sheer Combo
            if (name.includes('tulip')) return 349; // Tulip Combo
            if (type === 'satin-mini' || name.includes('mini')) return 399; // Satin Mini Pack (Pack of 14) implies combo if price is high?
            // Wait, "Satin Mini" single is 30. "Satin Mini" Pack is 399.
            // How to distinguish? logic below.
            return 99; // Default Classic Pack of 3
        }

        // Handle Satin Mini specifics
        if (type === 'satin-mini' || type === 'satin_mini') {
            if (name.includes('pack') || name.includes('set') || name.includes('14')) return 399;
            return 30; // Single
        }

        // Regular Types
        if (catConfig.types && catConfig.types[type]) {
            return catConfig.types[type];
        }

        return catConfig.default;
    }

    // --- HAIRBOW ---
    if (category === 'hairbow') {
        // Check specific types from table
        if (PRICING_TABLE.hairbow.types[type]) {
            return PRICING_TABLE.hairbow.types[type];
        }
        // Specific check for Scarf if type misses but name has it
        if (name.includes('scarf')) return 99;

        return catConfig.default;
    }

    // --- GIFT HAMPER ---
    if (category === 'gifthamper') {
        if (type === 'satin-hamper') return 199;
        if (name.includes('glimmer') || name.includes('grace')) return 189;
        return 699; // Default / Royal Valentine
    }

    // --- OTHERS ---
    if (typeof catConfig === 'object' && catConfig.default) {
        if (catConfig.types && catConfig.types[type]) {
            return catConfig.types[type];
        }
        return catConfig.default;
    }

    // Simple number config (if simplified)
    if (typeof catConfig === 'number') return catConfig;

    return 0;
}
