import Hashids from 'hashids';

// Use a unique salt for your application to ensure unique hashes
// This should ideally be an environment variable in production
const SALT = import.meta.env.VITE_HASHIDS_SALT || 'TrivgooSuperSecretSalt2026';
const MIN_LENGTH = 6; // Output length (e.g., xK7bA2)

const hashids = new Hashids(SALT, MIN_LENGTH);

/**
 * Encodes a numeric ID into a short string hash.
 * @param id The numeric ID to encode
 * @returns The encoded hash string
 */
export const encodeId = (id: number | string): string => {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  if (isNaN(numericId)) return ''; // Handle invalid cases gracefully
  return hashids.encode(numericId);
};

/**
 * Decodes a string hash back into a numeric ID.
 * @param hash The encoded hash string
 * @returns The original numeric ID, or null if invalid
 */
export const decodeId = (hash: string): number | null => {
  if (!hash) return null;
  const decoded = hashids.decode(hash);
  if (decoded && decoded.length > 0) {
    return Number(decoded[0]);
  }
  // Fallback: If it fails to decode, it might be an old unhashed ID still lingering in cache.
  // Validate if it's purely a number and allow it as a fallback.
  const numericFallback = parseInt(hash, 10);
  if (!isNaN(numericFallback) && numericFallback.toString() === hash) {
    return numericFallback;
  }
  return null;
};
