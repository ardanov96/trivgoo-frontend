import React, { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

import { useAuth }    from '../AuthContext';
import { useCart }    from '../components/CartContext';
import http           from '../services/http';
import { useLangNavigate } from '../src/hooks/useLangNavigate';

import { ADMIN_FEE }          from './checkout/constants';
import { useContactForm }     from './checkout/hooks/useContactForm';
import { useVoucher }         from './checkout/hooks/useVoucher';

import { ProductCard }        from './checkout/components/ProductCard';
import { ContactFormSection } from './checkout/components/ContactFormSection';
import { VoucherPicker }      from './checkout/components/VoucherPicker';
import { PriceSummary }       from './checkout/components/PriceSummary';
import { PayButton, RentalInfoBanner } from './checkout/components/PayButton';

const CheckoutSummary: React.FC = () => {
  const navigate           = useNavigate();
  const location           = useLocation();
  const { t }              = useTranslation();
  const { langNavigate }   = useLangNavigate();
  const { user }           = useAuth();
  const { removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const isSubmitting = useRef(false);

  const bookingData = location.state;

  // ── Guard 1: missing booking data ──────────────────────────────────────
  React.useEffect(() => {
    if (!bookingData || !bookingData.productName) langNavigate('/explore', { replace: true });
  }, [bookingData]);

  // ── Guard 2: must be logged in ─────────────────────────────────────────
  React.useEffect(() => {
    if (!user) {
      langNavigate('/login', {
        replace: true,
        state: { from: location.pathname + location.search },
      });
    }
  }, [user, location]);

  if (!bookingData || !bookingData.productName || !user) return null;

  const {
    productId,
    productName               = 'Trivgoo Booking',
    location: productLocation = '-',
    date                      = '',
    pax                       = 1,
    pricePerPax               = 0,
    basePricePerPax           = 0,
    totalPrice                = 0,
    image                     = '',
    duration                  = 1,
    guestCount,
    unitLabel                 = t('checkout.ticket', 'Ticket'),
    priceUnitLabel            = t('common.person', 'person'),
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
    pickupType,
    dropoffType,
    pickupAddress,
    dropoffAddress,
    pickupDeliveryKm,
    dropoffDeliveryKm,
    startTime,
    endTime,
    pickupFee                      = 0,
    dropoffFee                     = 0,
    needsManualPickupConfirmation  = false,
    needsManualDropoffConfirmation = false,
    availableVouchers              = [],
  } = bookingData;

  const isCarBooking = vehicleType === 'car';

  const contact = useContactForm(user.email || '');
  const voucher = useVoucher();

  const baseTotal  = Number(totalPrice);
  const finalTotal = Math.max(0, baseTotal - voucher.appliedDiscount) + ADMIN_FEE;

  // Blokir pembayaran jika masih ada biaya antar/jemput yang menunggu konfirmasi agen
  const hasPendingManualQuote = isCarBooking && (needsManualPickupConfirmation || needsManualDropoffConfirmation);

  const normalizedQuantity = isCarBooking ? 1 : (pax || 1);
  const normalizedDuration = Math.max(1, Number(duration || 1));

  // ── Resolved add-ons (single source of truth) ─────────────────────────
  const resolvedAddOns = {
    withDriver:       Boolean(addOns?.withDriver       ?? withDriver ?? false),
    premiumInsurance: Boolean(addOns?.premiumInsurance ?? false),
    childSeat:        Boolean(addOns?.childSeat        ?? false),
  };

  const handlePayment = async () => {
    if (!user) {
      langNavigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    if (isSubmitting.current) return;

    if (hasPendingManualQuote) {
      Swal.fire(
        t('checkout.manual_quote_title', 'Menunggu Konfirmasi Biaya'),
        t(
          'checkout.manual_quote_desc',
          'Biaya antar atau pengembalian untuk rental mobil ini masih menunggu konfirmasi agen. Mohon tunggu harga final sebelum melanjutkan pembayaran.'
        ),
        'info'
      );
      return;
    }

    if (!contact.validate()) {
      Swal.fire(
        t('checkout.incomplete_title', 'Please Complete Your Data'),
        t('checkout.incomplete_desc', 'Make sure all contact details are filled in correctly.'),
        'warning'
      );
      return;
    }

    isSubmitting.current = true;
    setLoading(true);

    try {
      const orderId = `TRV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const startDateStr = date
        ? date.includes(' - ') ? date.split(' - ')[0] : date
        : new Date().toISOString().split('T')[0];

      // ✅ pricing_context sebagai JSON STRING — wajib untuk safeJsonParse() di backend
      const pricingContextStr = JSON.stringify({
        vehicleType:  vehicleType || null,
        duration:     normalizedDuration,
        pax:          normalizedQuantity,
        pickupFee:    Number(pickupFee  || 0),
        dropoffFee:   Number(dropoffFee || 0),
        addOns:       resolvedAddOns,
        voucherCode:  voucher.appliedVoucher?.code || null,
      });

      const res = await http.post('/payment/create-payment', {
        // ── Core fields ───────────────────────────────────────────────
        id:           orderId,
        amount:       finalTotal,
        name:         contact.form.name,
        email:        contact.form.email,
        product_name: productName,
        quantity:     normalizedQuantity,
        user_id:      user.id,
        product_id:   productId || null,
        admin_fee:    ADMIN_FEE,
        date:         startDateStr,
        start_time:   startTime || null,
        end_time:     endTime   || null,

        // ── pricing_context sebagai JSON string ───────────────────────
        // backend: safeJsonParse() membaca ini, normalizePricingContext() memprosesnya
        pricing_context: pricingContextStr,

        // ── Top-level car extras — dibutuhkan hasExplicitCarExtras ────
        // backend mengecek KEDUA sumber: rawContext DAN payload top-level
        pickup_fee:       Number(pickupFee  || 0),
        dropoff_fee:      Number(dropoffFee || 0),
        pickupFee:        Number(pickupFee  || 0),
        dropoffFee:       Number(dropoffFee || 0),
        withDriver:       resolvedAddOns.withDriver,
        premiumInsurance: resolvedAddOns.premiumInsurance,
        childSeat:        resolvedAddOns.childSeat,
        vehicle_type:     vehicleType || null,
        duration:         normalizedDuration,

        // ── Voucher fields ────────────────────────────────────────────
        original_amount: baseTotal,
        ...(voucher.appliedVoucher ? {
          voucher_code:    voucher.appliedVoucher.code,
          voucher_id:      voucher.appliedVoucher.id,
          discount_amount: voucher.appliedDiscount,
        } : {}),
      });

      const { payment_url } = res.data?.data || {};
      if (!payment_url) throw new Error(t('checkout.no_payment_url', 'Payment URL not detected.'));

      // ✅ Bersihkan cart setelah payment URL didapat
      if (productId) {
        removeFromCart(productId);
        try {
          const raw = window.localStorage.getItem('triv_cart_v1');
          if (raw) {
            const parsed = JSON.parse(raw);
            window.localStorage.setItem(
              'triv_cart_v1',
              JSON.stringify(parsed.filter((i: any) => i.product.id !== productId))
            );
          }
        } catch { /* silent */ }
      }

      window.location.href = payment_url;

    } catch (error: any) {
      setLoading(false);
      isSubmitting.current = false;

      const msg = error.response?.data?.message
        || error.message
        || t('checkout.payment_failed', 'Failed to process payment');

      const isCapacityError = msg.includes('Kapasitas Penuh') || msg.includes('stok item');

      Swal.fire({
        title:             isCapacityError ? t('checkout.full_title', 'Fully Booked!') : t('common.error', 'Error'),
        text:              isCapacityError
          ? t('checkout.full_desc', 'Sorry, tickets/units for this date just ran out. Please choose another date.')
          : msg,
        icon:              isCapacityError ? 'warning' : 'error',
        confirmButtonText: t('common.ok', 'OK'),
        confirmButtonColor: isCapacityError ? '#f97316' : '#ef4444',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">

      {/* Sticky header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">
            {t('checkout.title', 'Order Review')}
          </h1>
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

        {/* Banner peringatan jika biaya antar/jemput belum dikonfirmasi */}
        {hasPendingManualQuote && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">⚠️</span>
            <span>
              Biaya antar atau pengembalian masih menunggu konfirmasi agen.
              Pembayaran akan dibuka setelah harga final dikonfirmasi.
            </span>
          </div>
        )}

        <PayButton
          loading={loading}
          disabled={hasPendingManualQuote}
          appliedDiscount={voucher.appliedDiscount}
          onClick={handlePayment}
        />
      </div>
    </div>
  );
};

export default CheckoutSummary;