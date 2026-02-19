import React, { useState } from 'react';
import { X, ShoppingCart, MapPin, Trash2, ArrowRight, ShoppingBag, CreditCard } from 'lucide-react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from './ToastContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, cartCount } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Navigate to product page to fill in booking details
  const handleGoToProduct = (productId: number) => {
    onClose();
    navigate(`/product/${productId}`);
  };

  // Reserve Now — goes directly to checkout-summary with product data
  const handleReserveNow = (productId: number) => {
    const item = cartItems.find((i) => i.product.id === productId);
    if (!item) return;

    if (!user) {
      showToast('Please login to continue.', 'info');
      onClose();
      navigate('/login');
      return;
    }

    const activeFlashSale =
      (item.product as any).flashSale?.status === 'approved'
        ? (item.product as any).flashSale
        : null;
    const effectivePrice = activeFlashSale ? activeFlashSale.salePrice : item.product.price;
    const heroImage = (item.product as any).image_url || item.product.image;

    setProcessingId(productId);

    onClose();
    navigate('/checkout-summary', {
      state: {
        productName: item.product.name,
        location: item.product.location,
        date: '',           // user belum pilih tanggal — akan diisi di ProductDetail
        pax: item.quantity,
        pricePerPax: effectivePrice,
        totalPrice: effectivePrice * item.quantity,
        image: heroImage,
        currency: item.product.currency,
        duration: 1,
        guestCount: item.quantity,
        unitLabel: 'Ticket',
        priceUnitLabel: 'person',
        contactDetails: {
          name: user?.name || '',
          email: user?.email || '',
          phone: '',
        },
      },
    });

    setProcessingId(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[90] shadow-2xl flex flex-col transition-transform duration-400 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">Keranjang</h2>
              <p className="text-xs text-gray-400 font-medium">{cartCount} paket ditambahkan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-9 h-9 text-gray-300" />
              </div>
              <h3 className="text-gray-700 font-bold text-lg mb-1">Keranjang Kosong</h3>
              <p className="text-gray-400 text-sm max-w-[200px]">
                Tambahkan paket wisata yang kamu minati ke keranjang
              </p>
              <button
                onClick={() => { onClose(); navigate('/explore'); }}
                className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                Jelajahi Paket
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const heroImage = (item.product as any).image_url || item.product.image;
              const activeFlashSale =
                (item.product as any).flashSale?.status === 'approved'
                  ? (item.product as any).flashSale
                  : null;
              const effectivePrice = activeFlashSale
                ? activeFlashSale.salePrice
                : item.product.price;
              const isProcessing = processingId === item.product.id;

              return (
                <div
                  key={item.product.id}
                  className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-primary-200 transition-colors"
                >
                  {/* Product Image + Info */}
                  <div className="flex gap-3 p-3">
                    <img
                      src={heroImage}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-xl flex-shrink-0 cursor-pointer"
                      onClick={() => handleGoToProduct(item.product.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug mb-1 cursor-pointer hover:text-primary-600 transition-colors"
                        onClick={() => handleGoToProduct(item.product.id)}
                      >
                        {item.product.name}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500 mb-2">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{item.product.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeFlashSale && (
                          <span className="text-xs text-gray-400 line-through">
                            {item.product.currency} {item.product.price.toLocaleString()}
                          </span>
                        )}
                        <span className="text-sm font-bold text-primary-600">
                          {item.product.currency} {effectivePrice.toLocaleString()}
                        </span>
                        {activeFlashSale && (
                          <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">
                            -{activeFlashSale.discountPercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Hapus | Detail | Reserve Now */}
                  <div className="grid grid-cols-3 border-t border-gray-100 divide-x divide-gray-100">
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-1 rounded-bl-2xl"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                    <button
                      onClick={() => handleGoToProduct(item.product.id)}
                      className="py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
                    >
                      Detail
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleReserveNow(item.product.id)}
                      disabled={isProcessing}
                      className="py-2.5 text-xs font-bold text-white bg-gray-900 hover:bg-primary-600 transition-colors flex items-center justify-center gap-1 rounded-br-2xl disabled:opacity-60"
                    >
                      {isProcessing ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-3.5 h-3.5" />
                          Pesan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer — only when cart has items */}
        {cartItems.length > 0 && (
          <div className="px-6 py-5 border-t border-gray-100 bg-white space-y-3">
            <p className="text-xs text-gray-400 text-center">
              Klik <span className="font-bold text-gray-600">"Detail"</span> untuk pilih tanggal &amp; tamu,
              atau <span className="font-bold text-gray-900">"Pesan"</span> untuk langsung checkout.
            </p>

            {/* Lanjut Pilih Paket → /explore */}
            <button
              onClick={() => { onClose(); navigate('/explore'); }}
              className="w-full py-3 rounded-xl font-bold text-sm bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Lanjut Pilih Paket
            </button>

            {/* Reserve Now — checkout item pertama di keranjang (atau bisa diloop) */}
            <button
              onClick={() => handleReserveNow(cartItems[0].product.id)}
              disabled={processingId !== null}
              className="w-full py-3 rounded-xl font-bold text-sm bg-gray-900 text-white hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20 disabled:opacity-60"
            >
              {processingId !== null ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Reserve Now
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
