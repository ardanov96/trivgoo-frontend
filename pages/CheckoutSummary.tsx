import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

import { useAuth }    from '../AuthContext';
import { useCart }    from '../components/CartContext';
import http           from '../services/http';

import { ADMIN_FEE }          from './checkout/constants';
import { useContactForm }     from './checkout/hooks/useContactForm';
import { useVoucher }         from './checkout/hooks/useVoucher';

import { ProductCard }        from './checkout/components/ProductCard';
import { ContactFormSection } from './checkout/components/ContactFormSection';
import { VoucherPicker }      from './checkout/components/VoucherPicker';
import { PriceSummary }       from './checkout/components/PriceSummary';
import { PayButton, RentalInfoBanner } from './checkout/components/PayButton';

// ─────────────────────────────────────────────────────────────────────────────

const CheckoutSummary: React.FC = () => {
  const navigate           = useNavigate();
  const location           = useLocation();
  const { user }           = useAuth();
  const { removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const isSubmitting = useRef(false);

  const bookingData = location.state;

  // ── Guard 1: missing booking data ────────────────────────────────────────
  React.useEffect(() => {
    if (!bookingData || !bookingData.productName) navigate('/explore', { replace: true });
  }, [bookingData, navigate]);

  // ── Guard 2: must be logged in ───────────────────────────────────────────
  React.useEffect(() => {
    if (!user) {
      navigate('/login', {
        replace: true,
        state: { from: location.pathname + location.search },
      });
    }
  }, [user, navigate, location]);

  if (!bookingData || !bookingData.productName || !user) return null;

  // ── Destructure booking data ──────────────────────────────────────────────
  const {
    productId,
    productName           = 'Trivgoo Booking',
    location: productLocation = '-',
    date                  = '',
    pax                   = 1,
    pricePerPax           = 0,
    basePricePerPax       = 0,
    totalPrice            = 0,
    image                 = '',
    duration              = 1,
    guestCount,
    unitLabel             = 'Tiket',
    priceUnitLabel        = 'orang',
    vehicleType,
    transmission,
    seats,
    luggage,
    year,
    fuelPolicy,
    withDriver,
    addOns,
    pickupTime,
    returnTime,
    startTime,
    endTime,
    pickupFee                     = 0,
    dropoffFee                    = 0,
    needsManualPickupConfirmation = false,
    needsManualDropoffConfirmation= false,
    availableVouchers             = [],
  } = bookingData;

  const isCarBooking = vehicleType === 'car';

  // ── Sub-hooks ─────────────────────────────────────────────────────────────
  const contact = useContactForm(user.email || '');
  const voucher = useVoucher();

  // ── Price calculation ─────────────────────────────────────────────────────
  const baseTotal  = Number(totalPrice);
  const finalTotal = Math.max(0, baseTotal - voucher.appliedDiscount) + ADMIN_FEE;

  // ── Handle payment ────────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    if (isSubmitting.current) return;
    if (!contact.validate()) {
      Swal.fire('Mohon Lengkapi Data', 'Pastikan semua data pemesan sudah diisi dengan benar.', 'warning');
      return;
    }

    isSubmitting.current = true;
    setLoading(true);

    try {
      const orderId = `TRV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const startDateStr = date
        ? date.includes(' - ') ? date.split(' - ')[0] : date
        : new Date().toISOString().split('T')[0];

      const res = await http.post('/payment/create-payment', {
        id:           orderId,
        amount:       finalTotal,
        name:         contact.form.name,
        email:        contact.form.email,
        product_name: productName,
        quantity:     pax || 1,
        user_id:      user.id,
        product_id:   productId || null,
        admin_fee:    ADMIN_FEE,
        date:         startDateStr,
        start_time:   startTime || null,
        end_time:     endTime || null,
        ...(voucher.appliedVoucher ? {
          voucher_code:    voucher.appliedVoucher.code,
          voucher_id:      voucher.appliedVoucher.id,
          discount_amount: voucher.appliedDiscount,
          original_amount: baseTotal,
        } : {}),
      });

      const { payment_url } = res.data?.data || {};
      if (!payment_url) throw new Error('Payment URL tidak terdeteksi.');

      // Clear cart
      if (productId) {
        removeFromCart(productId);
        try {
          const raw = window.localStorage.getItem('triv_cart_v1');
          if (raw) {
            const parsed = JSON.parse(raw);
            window.localStorage.setItem('triv_cart_v1', JSON.stringify(parsed.filter((i: any) => i.product.id !== productId)));
          }
        } catch { /* silent */ }
      }

      window.location.href = payment_url;
    } catch (error: any) {
      setLoading(false);
      isSubmitting.current = false;

      const msg             = error.response?.data?.message || error.message || 'Gagal memproses pembayaran';
      const isCapacityError = msg.includes('Kapasitas Penuh');

      Swal.fire({
        title:              isCapacityError ? 'Sudah Penuh!' : 'Error',
        text:               isCapacityError
          ? 'Maaf, stok unit/tiket untuk tanggal ini baru saja habis. Silakan pilih tanggal lain.'
          : msg,
        icon:               isCapacityError ? 'warning' : 'error',
        confirmButtonText:  'Mengerti',
        confirmButtonColor: isCapacityError ? '#f97316' : '#ef4444',
      });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-12">

      {/* Sticky header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Review Pesanan</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-4">

        <ProductCard
          productName={productName}
          productLocation={productLocation}
          image={image}
          vehicleType={vehicleType}
          transmission={transmission}
          isCarBooking={isCarBooking}
          date={date}
          duration={duration}
          pax={pax}
          guestCount={guestCount}
          priceUnitLabel={priceUnitLabel}
          seats={seats}
          luggage={luggage}
          year={year}
          fuelPolicy={fuelPolicy}
          withDriver={withDriver}
          pickupTime={pickupTime}
          returnTime={returnTime}
        />

        <ContactFormSection
          form={contact.form}
          errors={contact.errors}
          setField={contact.setField}
        />

        <VoucherPicker
          availableVouchers={availableVouchers}
          amount={baseTotal}
          appliedVoucher={voucher.appliedVoucher}
          onApply={(v, amount) => voucher.apply(v, amount)}
          onRemove={voucher.remove}
        />

        <PriceSummary
          isCarBooking={isCarBooking}
          basePricePerPax={basePricePerPax}
          pricePerPax={pricePerPax}
          duration={duration}
          guestCount={guestCount}
          pax={pax}
          unitLabel={unitLabel}
          priceUnitLabel={priceUnitLabel}
          baseTotal={baseTotal}
          appliedVoucher={voucher.appliedVoucher}
          appliedDiscount={voucher.appliedDiscount}
          finalTotal={finalTotal}
          addOns={addOns}
          pickupFee={pickupFee}
          dropoffFee={dropoffFee}
          needsManualPickupConfirmation={needsManualPickupConfirmation}
          needsManualDropoffConfirmation={needsManualDropoffConfirmation}
        />

        {isCarBooking && <RentalInfoBanner />}

        <PayButton
          loading={loading}
          appliedDiscount={voucher.appliedDiscount}
          onClick={handlePayment}
        />

      </div>
    </div>
  );
};

export default CheckoutSummary;
