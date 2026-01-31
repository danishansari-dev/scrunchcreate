/**
 * Centralized Pricing Configuration
 * Single source of truth for all product prices
 * 
 * Rules are evaluated in order - first match wins
 * More specific rules should come before general ones
 */

// Pricing rules - evaluated in order, first match wins
export const PRICING_RULES = [
    // ============================================
    // SPECIFIC OVERRIDES (most specific first)
    // ============================================

    // Gift Hampers
    { match: { category: 'GiftHamper', type: 'Satin hamper' }, price: 199, description: 'Magenta Pink Gift Hamper' },
    { match: { category: 'GiftHamper' }, price: 699, description: 'Royal Valentine Gift Hamper' },

    // Hair Bow - Mini bow pack
    { match: { category: 'HairBow', type: 'Satin', color: 'mini' }, price: 359, description: 'Satin mini bow pack of 6' },

    // Scrunchie Combo packs (specific colors first)
    { match: { category: 'Scrunchie', type: 'Combo', color: 'Tulip' }, price: 349, description: 'Satin tulip pack of 6' },
    { match: { category: 'Scrunchie', type: 'Combo', color: 'tulip-sheer' }, price: 599, description: 'Premium tulip pack of 12' },

    // ============================================
    // TYPE-LEVEL RULES
    // ============================================

    // Scrunchies
    { match: { category: 'Scrunchie', type: 'Combo' }, price: 99, description: 'Combo of 3 satin scrunchies' },
    { match: { category: 'Scrunchie', type: 'Satin_mini' }, price: 399, description: 'Premium satin scrunchies pack of 14' },

    // Hair Bows by type
    { match: { category: 'HairBow', type: 'JimmyChoo' }, price: 99, description: 'Trendy Jimmy Choo hair bow clip with pearls' },
    { match: { category: 'HairBow', type: 'Satin' }, price: 79, description: 'Satin three-layered hair bow clip' },
    { match: { category: 'HairBow', type: 'Sheer_Satin' }, price: 79, description: 'Sheer satin hair bow' },
    { match: { category: 'HairBow', type: 'Velvet' }, price: 79, description: 'Velvet hair bow' },
    { match: { category: 'HairBow', type: 'Scarf' }, price: 79, description: 'Scarf hair bow' },
    { match: { category: 'HairBow', type: 'Satin Tulip Bows' }, price: 79, description: 'Satin tulip bow' },
    { match: { category: 'HairBow', type: 'Satin princes Bow' }, price: 79, description: 'Satin princess bow' },
    { match: { category: 'HairBow', type: 'Classic' }, price: 79, description: 'Classic hair bow' },
    { match: { category: 'HairBow', type: 'Combo' }, price: 79, description: 'Combo hair bow' },

    // ============================================
    // CATEGORY-LEVEL DEFAULTS
    // ============================================

    // Single scrunchies (Classic, Tulip, Tulip-Sheer with color)
    { match: { category: 'Scrunchie' }, price: 35, description: 'Single satin scrunchie' },

    // Hair bows default
    { match: { category: 'HairBow' }, price: 79, description: 'Hair bow' },

    // Flower Jewellery - enquiry only
    { match: { category: 'FlowerJewellery' }, price: 0, description: 'Enquiry only' },

    // Earrings
    { match: { category: 'Earring' }, price: 99, description: 'Earring' },

    // Paraandi
    { match: { category: 'Paraandi' }, price: 199, description: 'Paraandi' },
];

// Default price when no rule matches (null = flag for review)
export const DEFAULT_PRICE = null;

/**
 * Get price for a product based on its attributes
 * @param {Object} product - Product object with category, type, color
 * @returns {number|null} - Price or null if no rule matches
 */
export function getProductPrice(product) {
    const { category, type, color } = product;

    for (const rule of PRICING_RULES) {
        const { match, price } = rule;

        // Check if all specified match criteria are satisfied
        let isMatch = true;

        if (match.category && match.category !== category) {
            isMatch = false;
        }
        if (match.type && match.type !== type) {
            isMatch = false;
        }
        if (match.color && match.color !== color) {
            isMatch = false;
        }

        if (isMatch) {
            return price;
        }
    }

    return DEFAULT_PRICE;
}

/**
 * Get pricing rule description for a product (useful for debugging)
 * @param {Object} product - Product object
 * @returns {string|null} - Description of the matched rule
 */
export function getPricingDescription(product) {
    const { category, type, color } = product;

    for (const rule of PRICING_RULES) {
        const { match, description } = rule;

        let isMatch = true;

        if (match.category && match.category !== category) {
            isMatch = false;
        }
        if (match.type && match.type !== type) {
            isMatch = false;
        }
        if (match.color && match.color !== color) {
            isMatch = false;
        }

        if (isMatch) {
            return description || null;
        }
    }

    return null;
}
