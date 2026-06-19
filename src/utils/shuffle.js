/**
 * Why this file exists:
 * Reusable utility to shuffle arrays uniformly.
 * Avoids biased sort-based randomizations (e.g., sort(() => Math.random() - 0.5))
 * by implementing the Fisher-Yates (Knuth) shuffle algorithm.
 */

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * @danishansari-dev array - The array to shuffle
 * @returns A new shuffled array
 */
export function shuffle(array) {
  if (!Array.isArray(array)) return []
  
  // Tricky logic: Clone the array to avoid mutating the original input array
  const arr = [...array]
  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  
  return arr
}
