/**
 * Utility untuk menangani URL gambar
 * Memastikan semua gambar menggunakan domain yang benar dan path yang tepat
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  console.log('[getImageUrl] Input:', imagePath);
  
  // Default fallback
  if (!imagePath) {
    console.log('[getImageUrl] Using fallback (empty)');
    return 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80';
  }

  // CASE 1: Hapus /api/v1 dari URL (ini yang paling penting!)
  if (imagePath.includes('/api/v1/')) {
    const fixed = imagePath.replace(/\/api\/v1\//g, '/');
    console.log('[getImageUrl] Removed /api/v1:', fixed);
    return getImageUrl(fixed); // Rekursif untuk proses lebih lanjut
  }

  // CASE 2: URL dengan localhost:4000
  if (imagePath.includes('localhost:4000')) {
    const fixed = imagePath.replace(/https?:\/\/localhost:4000\/?/g, 'https://trivgoo.com/');
    console.log('[getImageUrl] Fixed localhost:', fixed);
    return fixed;
  }

  // CASE 3: URL dengan double slash (//)
  if (imagePath.includes('//') && !imagePath.startsWith('http')) {
    const fixed = `https://trivgoo.com${imagePath}`;
    console.log('[getImageUrl] Fixed double slash:', fixed);
    return fixed;
  }

  // CASE 4: URL lengkap dengan http/https
  if (imagePath.startsWith('http')) {
    // Tapi tetap cek apakah mengandung /api/v1
    if (imagePath.includes('/api/v1/')) {
      return getImageUrl(imagePath.replace(/\/api\/v1\//g, '/'));
    }
    console.log('[getImageUrl] Keeping original URL:', imagePath);
    return imagePath;
  }

  // CASE 5: Path relatif dengan leading slash
  if (imagePath.startsWith('/')) {
    const fixed = `https://trivgoo.com${imagePath}`;
    console.log('[getImageUrl] Fixed relative with slash:', fixed);
    return fixed;
  }

  // CASE 6: Path relatif tanpa leading slash
  const fixed = `https://trivgoo.com/${imagePath}`;
  console.log('[getImageUrl] Fixed relative without slash:', fixed);
  return fixed;
};

// Fallback image untuk error
export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=800&q=80';