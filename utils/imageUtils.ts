/**
 * Utility untuk menangani URL gambar
 * Memastikan semua gambar menggunakan domain yang benar
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  // Default fallback
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80';
  }

  // Jika sudah URL lengkap (http:// atau https://)
  if (imagePath.startsWith('http')) {
    // Ganti localhost dengan domain production
    if (imagePath.includes('localhost:4000')) {
      return imagePath.replace('http://localhost:4000', 'https://trivgoo.com');
    }
    return imagePath;
  }

  // Jika path relatif (dimulai dengan /)
  if (imagePath.startsWith('/')) {
    return `https://trivgoo.com${imagePath}`;
  }

  // Jika path relatif tanpa / di depan
  return `https://trivgoo.com/${imagePath}`;
};

// Fallback image untuk error
export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80';