/**
 * Color Normalization Utility
 * Single source of truth for canonical color names.
 * Maps raw color values to normalized, display-friendly forms.
 */

// Canonical colors - these are the only colors that should appear in filters
export const CANONICAL_COLORS = [
    'black',
    'white',
    'cream',
    'beige',
    'grey',
    'brown',
    'red',
    'wine',
    'maroon',
    'burgundy',
    'pink',
    'hot-pink',
    'baby-pink',
    'blush',
    'rose',
    'peach',
    'peach-cream',
    'coral',
    'orange',
    'yellow',
    'light-yellow',
    'mustard',
    'gold',
    'green',
    'olive',
    'metallic-olive',
    'olive-green',
    'mint',
    'light-mint',
    'sage',
    'teal',
    'turquoise',
    'blue',
    'navy',
    'sky-blue',
    'petrol-blue',
    'royal-blue',
    'purple',
    'lavender',
    'lilac',
    'magenta',
    'pistachio',
    'chocolate',
    'silver',
    'multi'
];

// Map of raw color values to their canonical form
// Keys are lowercase with hyphens, values are canonical colors
const COLOR_ALIASES = {
    // Misspellings
    'metalic-olive': 'metallic-olive',
    'mettalic-olive': 'metallic-olive',
    'metallic olive': 'metallic-olive',

    // Variant spellings
    'gray': 'grey',
    'lite-yellow': 'light-yellow',
    'lt-yellow': 'light-yellow',
    'lt-mint': 'light-mint',
    'lite-mint': 'light-mint',

    // Compound to canonical
    'peach-pink': 'peach',
    'hot pink': 'hot-pink',
    'baby pink': 'baby-pink',
    'sky blue': 'sky-blue',
    'petrol blue': 'petrol-blue',
    'petrol': 'petrol-blue',
    'royal blue': 'royal-blue',
    'light yellow': 'light-yellow',
    'light mint': 'light-mint',

    // Common aliases
    'offwhite': 'cream',
    'off-white': 'cream',
    'ivory': 'cream',
    'tan': 'beige',
    'khaki': 'beige',
    'scarlet': 'red',
    'crimson': 'maroon',
    'fuchsia': 'magenta',
    'violet': 'purple',
    'cyan': 'teal',
    'aqua': 'turquoise',
    'nude': 'beige',
    'champagne': 'cream',
    'caramel': 'brown',
    'coffee': 'brown',
    'espresso': 'brown',
    'cocoa': 'chocolate',
    'forest': 'green',
    'emerald': 'green',
    'jade': 'green',
    'chartreuse': 'green',
    'lemon': 'yellow',
    'sunshine': 'yellow',
    'amber': 'orange',
    'tangerine': 'orange',
    'salmon': 'coral',
    'dusty-rose': 'rose',
    'mauve': 'rose',
    'plum': 'purple',
    'grape': 'purple',
    'indigo': 'navy',
    'cobalt': 'blue',
    'sapphire': 'blue',
    'cerulean': 'sky-blue',
    'pewter': 'grey',
    'charcoal': 'grey',
    'slate': 'grey',
    'ash': 'grey',

    // Satin Tulip special case (type, not color)
    'satin-tulip': 'combo',

    // Specific colors
    'navy-blue': 'navy',
    'dark-green': 'green',
    'bottle-green': 'green',
    'light-blue': 'sky-blue',
    'dark-blue': 'navy',
    'light-pink': 'baby-pink',
    'dark-pink': 'hot-pink',
    'light-pink': 'baby-pink',
    'dark-pink': 'hot-pink',
    'light-purple': 'lilac',
    'dark-purple': 'purple',

    // Additional requested fixes
    'golden': 'gold',
    'mint-green': 'mint',
    'golden-brown': 'brown'
};

/**
 * Normalize a raw color value to its canonical form.
 * @param {string} rawColor - The raw color value from product data
 * @returns {string|null} The canonical color, or null if input is empty
 */
export function normalizeColor(rawColor) {
    if (!rawColor) return null;

    // Convert to lowercase and replace spaces/underscores with hyphens
    const normalized = rawColor
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    // Check if it's an alias
    if (COLOR_ALIASES[normalized]) {
        return COLOR_ALIASES[normalized];
    }

    // Check if it's already a canonical color
    if (CANONICAL_COLORS.includes(normalized)) {
        return normalized;
    }

    // If not recognized, return the normalized form anyway
    // (allows for new colors without breaking)
    return normalized;
}

/**
 * Get display name for a canonical color.
 * Converts 'light-yellow' to 'Light Yellow'
 * @param {string} canonicalColor 
 * @returns {string}
 */
export function getColorDisplayName(canonicalColor) {
    if (!canonicalColor) return '';
    return canonicalColor
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Extract unique canonical colors from a list of products.
 * Use this to build filter options.
 * @param {Array} products - Array of product objects
 * @returns {Array} Sorted array of unique canonical colors
 */
export function extractCanonicalColors(products) {
    const colorSet = new Set();

    products.forEach(product => {
        const normalized = normalizeColor(product.color);
        if (normalized) {
            colorSet.add(normalized);
        }
    });

    return Array.from(colorSet).sort();
}

// Map of canonical colors to CSS Hex/Gradient values
export const COLOR_HEX_MAP = {
    'black': '#000000',
    'white': '#FFFFFF',
    'cream': '#FFFDD0',
    'beige': '#F5F5DC',
    'grey': '#808080',
    'brown': '#8B4513',
    'red': '#FF0000',
    'wine': '#722F37',
    'maroon': '#800000',
    'burgundy': '#800020',
    'pink': '#FFC0CB',
    'hot-pink': '#FF69B4',
    'baby-pink': '#F4C2C2',
    'blush': '#DE5D83',
    'rose': '#F33A6A',
    'peach': '#FFDAB9',
    'peach-cream': '#FFEFDB',
    'coral': '#FF7F50',
    'orange': '#FFA500',
    'yellow': '#FFFF00',
    'light-yellow': '#FFFFE0',
    'mustard': '#FFDB58',
    'gold': '#FFD700',
    'green': '#008000',
    'olive': '#808000',
    'metallic-olive': '#556B2F',
    'olive-green': '#556B2F',
    'mint': '#98FF98',
    'light-mint': '#E0FFE0',
    'sage': '#9DC183',
    'teal': '#008080',
    'turquoise': '#40E0D0',
    'blue': '#0000FF',
    'navy': '#000080',
    'sky-blue': '#87CEEB',
    'petrol-blue': '#1F4E5F',
    'royal-blue': '#4169E1',
    'purple': '#800080',
    'lavender': '#E6E6FA',
    'lilac': '#C8A2C8',
    'magenta': '#FF00FF',
    'pistachio': '#93C572',
    'chocolate': '#D2691E',
    'silver': '#C0C0C0',
    'multi': 'linear-gradient(135deg, red, orange, yellow, green, blue, indigo, violet)',
    'combo': 'linear-gradient(135deg, #FFC0CB 50%, #87CEEB 50%)' // Example combo
};

/**
 * Get the CSS background value for a color
 * @param {string} rawColor 
 * @returns {string} CSS color or gradient
 */
export function getColorHex(rawColor) {
    const normalized = normalizeColor(rawColor);
    if (!normalized) return '#dddddd'; // Default grey

    // Return mapped hex if available
    if (COLOR_HEX_MAP[normalized]) {
        return COLOR_HEX_MAP[normalized];
    }

    // Fallback: try to use the normalized name itself
    // This allows standard colors like 'cyan' to work if they aren't in our map yet
    return normalized;
}
