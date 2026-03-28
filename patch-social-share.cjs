// patch-social-share.cjs
const fs = require('fs');
let content = fs.readFileSync('pages/ProductDetail.tsx', 'utf8');

// ── 1. Inject ShareButtons component sebelum ProductDetail component ─────────
const SHARE_COMPONENT = `
// ─── Social Share Component ───────────────────────────────────────────────────
interface ShareButtonsProps {
  productName: string;
  productImage: string;
  productUrl: string;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({ productName, productImage, productUrl }) => {
  const [copied, setCopied] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const encodedUrl   = encodeURIComponent(productUrl);
  const encodedTitle = encodeURIComponent(productName + ' | Trivgoo');
  const encodedImg   = encodeURIComponent(productImage);

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      color: 'bg-green-500 hover:bg-green-600',
      url: \`https://wa.me/?text=\${encodedTitle}%20\${encodedUrl}\`,
    },
    {
      name: 'Facebook',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      color: 'bg-blue-600 hover:bg-blue-700',
      url: \`https://www.facebook.com/sharer/sharer.php?u=\${encodedUrl}&picture=\${encodedImg}&title=\${encodedTitle}\`,
    },
    {
      name: 'Instagram',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:opacity-90',
      url: \`https://www.instagram.com/?url=\${encodedUrl}\`,
    },
    {
      name: 'TikTok',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.19 8.19 0 004.84 1.56V6.79a4.85 4.85 0 01-1.07-.1z"/>
        </svg>
      ),
      color: 'bg-black hover:bg-gray-800',
      url: \`https://www.tiktok.com/share?url=\${encodedUrl}\`,
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(productUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(o => !o)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors group"
        title="Bagikan produk ini"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span className="text-sm font-medium">Bagikan</span>
      </button>

      {showDropdown && (
        <div className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50 w-52 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Bagikan ke</p>
          <div className="space-y-1">
            {shareLinks.map(link => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowDropdown(false)}
                className={\`flex items-center gap-3 px-3 py-2.5 rounded-xl text-white text-sm font-semibold transition-all \${link.color}\`}
              >
                {link.icon}
                {link.name}
              </a>
            ))}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              {copied ? (
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2 text-green-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
              {copied ? 'Link disalin!' : 'Salin Link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

`;

// Inject sebelum const ProductDetail
const OLD_PRODUCT_DETAIL = `const ProductDetail: React.FC = () => {`;
if (content.includes(OLD_PRODUCT_DETAIL)) {
  content = content.replace(OLD_PRODUCT_DETAIL, SHARE_COMPONENT + OLD_PRODUCT_DETAIL);
  console.log('✅ ShareButtons component added');
} else {
  console.log('⚠️  ProductDetail component not found');
}

// ── 2. Inject <ShareButtons /> ke dalam JSX setelah rating badges ─────────────
// Cari baris: {isLoggedIn && ...Simpan ke wishlist...}
// Dan tambahkan ShareButtons setelahnya
const OLD_WISHLIST_END = `{isLoggedIn && (<><span className="text-gray-300">·</span><button onClick={() => toggleWishlist(product)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"><Heart className={\`w-4 h-4 \${isSaved ? 'text-red-500 fill-red-500' : ''}\`} />{isSaved ? 'Tersimpan' : 'Simpan ke wishlist'}</button></>)}`;

const NEW_WISHLIST_END = `{isLoggedIn && (<><span className="text-gray-300">·</span><button onClick={() => toggleWishlist(product)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"><Heart className={\`w-4 h-4 \${isSaved ? 'text-red-500 fill-red-500' : ''}\`} />{isSaved ? 'Tersimpan' : 'Simpan ke wishlist'}</button></>)}
                <span className="text-gray-300">·</span>
                <ShareButtons
                  productName={product.name}
                  productImage={allImages[0] || product.image_url || product.image || ''}
                  productUrl={window.location.href}
                />`;

if (content.includes(OLD_WISHLIST_END)) {
  content = content.replace(OLD_WISHLIST_END, NEW_WISHLIST_END);
  console.log('✅ ShareButtons injected in tour/stay product header');
} else {
  console.log('⚠️  Wishlist button pattern not found');
}

// ── 3. Inject ShareButtons di Car product header juga ─────────────────────────
// Cari area di bagian car di dekat heart/wishlist button
const OLD_CAR_WISHLIST = `{isLoggedIn && (<button onClick={() => toggleWishlist(product)} className={\`shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 active:scale-90 \${isSaved ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}\`}><Heart className={\`w-5 h-5 \${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400'}\`} /></button>)}`;

const NEW_CAR_WISHLIST = `<div className="flex items-center gap-3">
          {isLoggedIn && (<button onClick={() => toggleWishlist(product)} className={\`shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 active:scale-90 \${isSaved ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}\`}><Heart className={\`w-5 h-5 \${isSaved ? 'text-red-500 fill-red-500' : 'text-gray-400'}\`} /></button>)}
          <ShareButtons
            productName={product.name}
            productImage={getImageUrl(product.image_url || product.image)}
            productUrl={window.location.href}
          />
        </div>`;

if (content.includes(OLD_CAR_WISHLIST)) {
  content = content.replace(OLD_CAR_WISHLIST, NEW_CAR_WISHLIST);
  console.log('✅ ShareButtons injected in car product header');
} else {
  console.log('⚠️  Car wishlist pattern not found');
}

fs.writeFileSync('pages/ProductDetail.tsx', content, 'utf8');
console.log('\n✅ ProductDetail.tsx updated with social share!');
