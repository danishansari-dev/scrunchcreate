
/**
 * Official Pricing Configuration
 * Central source of truth for product pricing.
 * 
 * Each product has:
 * - offerPrice: The selling price
 * - originalPrice: MRP (calculated with markup)
 * - discountPercent: Auto-calculated discount percentage
 * 
 * Updated: 2026-02-24
 * ---
 * Regular Scrunchie (single): ₹40
 * Combo of 2 scrunchies: ₹65
 * Combo of 3 scrunchies: ₹99
 * Combo of 6 scrunchies: ₹199
 * Combo of 12 scrunchies: ₹399
 * 
 * Tulip Scrunchie (single): ₹69
 * Tulip combo of 3: ₹199
 * Tulip combo of 6: ₹399
 * Tulip combo of 12: ₹799
 * Tulip combo of 24: ₹1599
 * 
 * Printed Scrunchie (single): ₹40
 * Combo of 5 printed scrunchies: ₹197
 * 
 * Printed Mini Bow (single): ₹59
 * 
 * Gift Hamper: ₹199
 * Satin Hamper Gift Hamper: ₹699
 * 
 * Delivery charge: ₹65
 */

// Offer price table (selling prices)
const OFFER_PRICE_TABLE = {
    scrunchie: {
        default: 40,
        types: {
            classic: 40,
            tulip: 69,
            'tulip-sheer': 79,
            'satin-mini': 30,
            'satin-printed': 40,
            combo: 99
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
            'satin-mini': 49,
            'printed-mini': 59,
            combo: 399
        }
    },
    gifthamper: {
        default: 199,
        types: {
            'satin-hamper': 699,
            'glimmer-grace': 189
        }
    },
    flowerjewellery: {
        default: 399,
        types: {
            rose: 399,
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

// MRP markup percentages by category (how much higher MRP is than offer price)
const MRP_MARKUP = {
    scrunchie: 0.20,      // 20% markup
    hairbow: 0.20,        // 20% markup
    gifthamper: 0.15,     // 15% markup
    flowerjewellery: 0.15,// 15% markup
    earring: 0.25,        // 25% markup
    paraandi: 0.15        // 15% markup
};

/**
 * Round price to nearest "nice" number (ending in 9 or 99)
 */
function roundToNicePrice(price) {
    if (price < 100) {
        // Round to nearest X9
        return Math.ceil(price / 10) * 10 - 1;
    } else if (price < 500) {
        // Round to nearest X9
        return Math.ceil(price / 10) * 10 - 1;
    } else {
        // Round to nearest X99
        return Math.ceil(price / 100) * 100 - 1;
    }
}

/**
 * Calculate offer price for a product based on its metadata.
 * @param {Object} product - Product object from JSON
 * @returns {number} Offer price in INR
 */
function calculateOfferPrice(product) {
    if (!product) return 0;

    const category = (product.category || '').toLowerCase().replace(/\s+/g, '');
    const type = (product.type || '').toLowerCase();
    const name = (product.name || '').toLowerCase();

    const catConfig = OFFER_PRICE_TABLE[category];

    if (!catConfig) {
        console.warn(`[Pricing] Unknown category: ${category} for product ${product.id}`);
        return 99; // Default fallback instead of 0
    }

    // --- SCRUNCHIE ---
    if (category === 'scrunchie') {
        if (type === 'combo' || name.includes('combo') || name.includes('pack')) {
            if (name.includes('tulip') && name.includes('sheer')) return 599;
            if (name.includes('tulip')) return 199;
            if (type === 'satin-mini' || name.includes('mini')) return 399;
            if (type === 'satin-printed' || name.includes('printed')) return 197;
            return 99;
        }

        if (type === 'satin-printed') {
            return 40;
        }

        if (type === 'satin-mini' || type === 'satin_mini') {
            if (name.includes('pack') || name.includes('set') || name.includes('14')) return 399;
            return 30;
        }

        if (catConfig.types && catConfig.types[type]) {
            return catConfig.types[type];
        }

        return catConfig.default;
    }

    // --- HAIRBOW ---
    if (category === 'hairbow') {
        if (type === 'printed-mini' || type === 'printed_mini') {
            return 59;
        }
        if (OFFER_PRICE_TABLE.hairbow.types[type]) {
            return OFFER_PRICE_TABLE.hairbow.types[type];
        }
        if (name.includes('scarf')) return 99;
        return catConfig.default;
    }

    // --- GIFT HAMPER ---
    if (category === 'gifthamper') {
        if (type === 'satin-hamper') return 699;
        if (name.includes('glimmer') || name.includes('grace')) return 189;
        return 199;
    }

    // --- OTHERS ---
    if (typeof catConfig === 'object' && catConfig.default) {
        if (catConfig.types && catConfig.types[type]) {
            return catConfig.types[type];
        }
        return catConfig.default;
    }

    if (typeof catConfig === 'number') return catConfig;

    return 99; // Default fallback
}

/**
 * Calculate pricing for a product.
 * @param {Object} product - Product object from JSON
 * @returns {{ offerPrice: number, originalPrice: number, discountPercent: number }}
 */
export function getProductPrice(product) {
    if (!product) {
        return { offerPrice: 0, originalPrice: 0, discountPercent: 0 };
    }

    const category = (product.category || '').toLowerCase().replace(/\s+/g, '');
    const offerPrice = calculateOfferPrice(product);

    // Ensure we never return 0 for offer price
    const safeOfferPrice = offerPrice > 0 ? offerPrice : 99;

    // Calculate MRP using markup
    const markup = MRP_MARKUP[category] || 0.20;
    const rawMrp = safeOfferPrice / (1 - markup);
    const originalPrice = roundToNicePrice(rawMrp);

    // Calculate discount percentage
    const discountPercent = originalPrice > safeOfferPrice
        ? Math.round(((originalPrice - safeOfferPrice) / originalPrice) * 100)
        : 0;

    return {
        offerPrice: safeOfferPrice,
        originalPrice,
        discountPercent
    };
}
