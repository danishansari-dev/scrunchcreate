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
    'coral',
    'orange',
    'yellow',
    'light-yellow',
    'mustard',
    'gold',
    'green',
    'olive',
    'metallic-olive',
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
    'multi',
    'combo'
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
    'satin-tulip': 'combo'
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
