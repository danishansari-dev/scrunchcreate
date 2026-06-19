/**
 * Why this file exists:
 * Provides pincode → city/state auto-fill and delivery date estimation.
 * Uses a static mapping of common Indian pincodes. In production, this
 * would call the India Post API or a geocoding service.
 */

// Curated mapping of common Indian pincodes — covers major metro areas
const PINCODE_MAP = {
  // Delhi NCR
  '110001': { city: 'New Delhi', state: 'Delhi', deliveryDays: 3 },
  '110002': { city: 'New Delhi', state: 'Delhi', deliveryDays: 3 },
  '110003': { city: 'New Delhi', state: 'Delhi', deliveryDays: 3 },
  '110005': { city: 'New Delhi', state: 'Delhi', deliveryDays: 3 },
  '110010': { city: 'New Delhi', state: 'Delhi', deliveryDays: 3 },
  '110016': { city: 'New Delhi', state: 'Delhi', deliveryDays: 3 },
  '110020': { city: 'New Delhi', state: 'Delhi', deliveryDays: 3 },
  '110025': { city: 'New Delhi', state: 'Delhi', deliveryDays: 3 },
  '110030': { city: 'New Delhi', state: 'Delhi', deliveryDays: 3 },
  '110044': { city: 'New Delhi', state: 'Delhi', deliveryDays: 3 },
  '110048': { city: 'New Delhi', state: 'Delhi', deliveryDays: 3 },
  '110051': { city: 'New Delhi', state: 'Delhi', deliveryDays: 3 },
  '110085': { city: 'New Delhi', state: 'Delhi', deliveryDays: 3 },
  '110092': { city: 'New Delhi', state: 'Delhi', deliveryDays: 3 },
  '201301': { city: 'Noida', state: 'Uttar Pradesh', deliveryDays: 3 },
  '201304': { city: 'Greater Noida', state: 'Uttar Pradesh', deliveryDays: 4 },
  '122001': { city: 'Gurugram', state: 'Haryana', deliveryDays: 3 },
  '122002': { city: 'Gurugram', state: 'Haryana', deliveryDays: 3 },
  '201001': { city: 'Ghaziabad', state: 'Uttar Pradesh', deliveryDays: 4 },
  '121001': { city: 'Faridabad', state: 'Haryana', deliveryDays: 4 },

  // Mumbai
  '400001': { city: 'Mumbai', state: 'Maharashtra', deliveryDays: 4 },
  '400002': { city: 'Mumbai', state: 'Maharashtra', deliveryDays: 4 },
  '400050': { city: 'Mumbai', state: 'Maharashtra', deliveryDays: 4 },
  '400053': { city: 'Mumbai', state: 'Maharashtra', deliveryDays: 4 },
  '400069': { city: 'Mumbai', state: 'Maharashtra', deliveryDays: 4 },
  '400076': { city: 'Mumbai', state: 'Maharashtra', deliveryDays: 4 },
  '400080': { city: 'Mumbai', state: 'Maharashtra', deliveryDays: 4 },
  '400092': { city: 'Mumbai', state: 'Maharashtra', deliveryDays: 4 },
  '400101': { city: 'Mumbai', state: 'Maharashtra', deliveryDays: 4 },
  '411001': { city: 'Pune', state: 'Maharashtra', deliveryDays: 5 },
  '411014': { city: 'Pune', state: 'Maharashtra', deliveryDays: 5 },

  // Bangalore
  '560001': { city: 'Bengaluru', state: 'Karnataka', deliveryDays: 5 },
  '560002': { city: 'Bengaluru', state: 'Karnataka', deliveryDays: 5 },
  '560034': { city: 'Bengaluru', state: 'Karnataka', deliveryDays: 5 },
  '560037': { city: 'Bengaluru', state: 'Karnataka', deliveryDays: 5 },
  '560076': { city: 'Bengaluru', state: 'Karnataka', deliveryDays: 5 },
  '560100': { city: 'Bengaluru', state: 'Karnataka', deliveryDays: 5 },

  // Hyderabad
  '500001': { city: 'Hyderabad', state: 'Telangana', deliveryDays: 5 },
  '500003': { city: 'Hyderabad', state: 'Telangana', deliveryDays: 5 },
  '500032': { city: 'Hyderabad', state: 'Telangana', deliveryDays: 5 },
  '500081': { city: 'Hyderabad', state: 'Telangana', deliveryDays: 5 },

  // Chennai
  '600001': { city: 'Chennai', state: 'Tamil Nadu', deliveryDays: 5 },
  '600006': { city: 'Chennai', state: 'Tamil Nadu', deliveryDays: 5 },
  '600017': { city: 'Chennai', state: 'Tamil Nadu', deliveryDays: 5 },
  '600028': { city: 'Chennai', state: 'Tamil Nadu', deliveryDays: 5 },

  // Kolkata
  '700001': { city: 'Kolkata', state: 'West Bengal', deliveryDays: 5 },
  '700007': { city: 'Kolkata', state: 'West Bengal', deliveryDays: 5 },
  '700020': { city: 'Kolkata', state: 'West Bengal', deliveryDays: 5 },
  '700091': { city: 'Kolkata', state: 'West Bengal', deliveryDays: 5 },

  // Ahmedabad
  '380001': { city: 'Ahmedabad', state: 'Gujarat', deliveryDays: 5 },
  '380006': { city: 'Ahmedabad', state: 'Gujarat', deliveryDays: 5 },
  '380015': { city: 'Ahmedabad', state: 'Gujarat', deliveryDays: 5 },

  // Jaipur
  '302001': { city: 'Jaipur', state: 'Rajasthan', deliveryDays: 4 },
  '302015': { city: 'Jaipur', state: 'Rajasthan', deliveryDays: 4 },
  '302020': { city: 'Jaipur', state: 'Rajasthan', deliveryDays: 4 },

  // Lucknow
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh', deliveryDays: 4 },
  '226010': { city: 'Lucknow', state: 'Uttar Pradesh', deliveryDays: 4 },
  '226016': { city: 'Lucknow', state: 'Uttar Pradesh', deliveryDays: 4 },

  // Chandigarh
  '160001': { city: 'Chandigarh', state: 'Chandigarh', deliveryDays: 4 },
  '160017': { city: 'Chandigarh', state: 'Chandigarh', deliveryDays: 4 },

  // Others
  '226003': { city: 'Lucknow', state: 'Uttar Pradesh', deliveryDays: 4 },
  '208001': { city: 'Kanpur', state: 'Uttar Pradesh', deliveryDays: 5 },
  '452001': { city: 'Indore', state: 'Madhya Pradesh', deliveryDays: 5 },
  '462001': { city: 'Bhopal', state: 'Madhya Pradesh', deliveryDays: 5 },
  '440001': { city: 'Nagpur', state: 'Maharashtra', deliveryDays: 5 },
  '395001': { city: 'Surat', state: 'Gujarat', deliveryDays: 5 },
  '360001': { city: 'Rajkot', state: 'Gujarat', deliveryDays: 6 },
  '390001': { city: 'Vadodara', state: 'Gujarat', deliveryDays: 5 },
  '682001': { city: 'Kochi', state: 'Kerala', deliveryDays: 6 },
  '695001': { city: 'Thiruvananthapuram', state: 'Kerala', deliveryDays: 6 },
}

/**
 * Looks up city, state, and delivery days from a 6-digit Indian pincode
 * @param {string} pincode - 6-digit pincode string
 * @returns {{ found: boolean, city: string, state: string, deliveryDays: number }}
 */
export function lookupPincode(pincode) {
  if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
    return { found: false, city: '', state: '', deliveryDays: 7 }
  }

  const entry = PINCODE_MAP[pincode.trim()]
  if (entry) {
    return { found: true, ...entry }
  }

  // Fallback: estimate based on first 2 digits (state-level grouping)
  const prefix = pincode.substring(0, 2)
  const stateGuess = STATE_BY_PREFIX[prefix]
  if (stateGuess) {
    return { found: false, city: '', state: stateGuess, deliveryDays: 7 }
  }

  return { found: false, city: '', state: '', deliveryDays: 7 }
}

/**
 * Calculates an estimated delivery date from today
 * @param {number} deliveryDays - Number of business days for delivery
 * @returns {string} Formatted date string like "Thursday, Jun 26"
 */
export function getDeliveryDate(deliveryDays) {
  const date = new Date()
  let daysAdded = 0

  // Skip weekends (Sundays) when calculating delivery
  while (daysAdded < deliveryDays) {
    date.setDate(date.getDate() + 1)
    // Skip Sunday (0)
    if (date.getDay() !== 0) {
      daysAdded++
    }
  }

  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Tricky logic: First 2 digits of Indian pincodes roughly map to postal zones.
 * This lets us guess the state even for unlisted pincodes.
 */
const STATE_BY_PREFIX = {
  '11': 'Delhi',
  '12': 'Haryana',
  '13': 'Punjab',
  '14': 'Punjab',
  '15': 'Himachal Pradesh',
  '16': 'Chandigarh',
  '17': 'Himachal Pradesh',
  '18': 'Jammu & Kashmir',
  '19': 'Jammu & Kashmir',
  '20': 'Uttar Pradesh',
  '21': 'Uttar Pradesh',
  '22': 'Uttar Pradesh',
  '23': 'Uttar Pradesh',
  '24': 'Uttar Pradesh',
  '25': 'Uttar Pradesh',
  '26': 'Uttar Pradesh',
  '27': 'Uttar Pradesh',
  '28': 'Uttar Pradesh',
  '30': 'Rajasthan',
  '31': 'Rajasthan',
  '32': 'Rajasthan',
  '33': 'Rajasthan',
  '34': 'Rajasthan',
  '36': 'Gujarat',
  '37': 'Gujarat',
  '38': 'Gujarat',
  '39': 'Gujarat',
  '40': 'Maharashtra',
  '41': 'Maharashtra',
  '42': 'Maharashtra',
  '43': 'Maharashtra',
  '44': 'Maharashtra',
  '45': 'Madhya Pradesh',
  '46': 'Madhya Pradesh',
  '47': 'Madhya Pradesh',
  '48': 'Madhya Pradesh',
  '49': 'Chhattisgarh',
  '50': 'Telangana',
  '51': 'Andhra Pradesh',
  '52': 'Andhra Pradesh',
  '53': 'Andhra Pradesh',
  '56': 'Karnataka',
  '57': 'Karnataka',
  '58': 'Karnataka',
  '59': 'Karnataka',
  '60': 'Tamil Nadu',
  '61': 'Tamil Nadu',
  '62': 'Tamil Nadu',
  '63': 'Tamil Nadu',
  '64': 'Tamil Nadu',
  '67': 'Kerala',
  '68': 'Kerala',
  '69': 'Kerala',
  '70': 'West Bengal',
  '71': 'West Bengal',
  '73': 'West Bengal',
  '74': 'West Bengal',
  '75': 'Odisha',
  '76': 'Odisha',
  '77': 'Assam',
  '78': 'Assam',
  '79': 'Northeast India',
  '80': 'Bihar',
  '81': 'Bihar',
  '82': 'Bihar',
  '83': 'Jharkhand',
  '84': 'Bihar',
  '85': 'Bihar',
}
