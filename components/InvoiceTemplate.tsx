import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Booking, BookingStatus } from '../types';

interface InvoiceTemplateProps {
  booking: Booking;
  user: any;
}

const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceTemplateProps>(({ booking, user }, ref) => {
  const { t } = useTranslation();

  if (!booking) return null;

  const invoiceNumber = (booking as any).externalId || `INV-${booking.id}`;
  const bookingDate   = new Date((booking as any).createdAt || new Date()).toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const contactName   = (booking as any).contactDetails?.name || user?.name || t('invoice.default_customer');
  const paymentMethod = (booking as any).paymentGateway
    ? String((booking as any).paymentGateway).toUpperCase()
    : t('invoice.default_payment_method');
  const isPaid = booking.paymentStatus === 'PAID'
    || booking.status === BookingStatus.COMPLETED
    || booking.status === BookingStatus.CONFIRMED;

  return (
    // Fixed width 800px is roughly A4 width, min-h-[1131px] for standard A4 ratio
    <div className="absolute top-[-9999px] left-[-9999px]">
      <div
        ref={ref}
        className="bg-white text-gray-900 w-[800px] min-h-[1131px] mx-auto p-12 text-sm relative"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        {/* ── Header ── */}
        <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
          <div>
            <img src="/logo-trivgoo.png" alt="TrivGoo" className="h-[60px] w-auto mb-4 object-contain origin-left" />
            <p className="text-gray-500 font-medium tracking-wide">{t('invoice.company_name')}</p>
            <p className="text-gray-400 mt-1">{t('invoice.company_contact')}</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-light text-primary-600 mb-2">{t('invoice.title')}</h2>
            <p className="text-gray-600 font-mono font-bold">{invoiceNumber}</p>
            <p className="text-gray-400 mt-1">{bookingDate}</p>
          </div>
        </div>

        {/* ── Customer & Payment Info ── */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
              {t('invoice.billed_to')}
            </p>
            <h3 className="text-lg font-bold text-gray-900">{contactName}</h3>
            <p className="text-gray-500">{user?.email}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
              {t('invoice.payment_details')}
            </p>
            <p className="text-gray-900 font-medium">{paymentMethod}</p>
            {isPaid ? (
              <p className="text-green-600 font-bold text-xs uppercase mt-1 px-2 py-1 bg-green-50 inline-block rounded">
                {t('invoice.status_paid')}
              </p>
            ) : (
              <p className="text-orange-500 font-bold text-xs uppercase mt-1 px-2 py-1 bg-orange-50 inline-block rounded">
                {t('invoice.status_unpaid')}
              </p>
            )}
          </div>
        </div>

        {/* ── Order Details Table ── */}
        <table className="w-full mb-10">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="py-3 text-left   text-xs text-gray-500 font-bold uppercase tracking-wider">{t('invoice.col_description')}</th>
              <th className="py-3 text-center text-xs text-gray-500 font-bold uppercase tracking-wider">{t('invoice.col_date')}</th>
              <th className="py-3 text-center text-xs text-gray-500 font-bold uppercase tracking-wider">{t('invoice.col_qty')}</th>
              <th className="py-3 text-right  text-xs text-gray-500 font-bold uppercase tracking-wider">{t('invoice.col_amount')}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-5">
                <p className="font-bold text-gray-900 text-base">{booking.productName}</p>
                <p className="text-gray-500 text-xs mt-1">{t('invoice.product_type_label')}</p>
              </td>
              <td className="py-5 text-center text-gray-700">{booking.date}</td>
              <td className="py-5 text-center text-gray-700">{booking.quantity}</td>
              <td className="py-5 text-right font-bold text-gray-900">
                Rp {Number(booking.totalPrice).toLocaleString('id-ID')}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Totals ── */}
        <div className="flex justify-end mb-16">
          <div className="w-1/2">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">{t('invoice.subtotal')}</span>
              <span className="font-medium">Rp {Number(booking.totalPrice).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">{t('invoice.taxes_fees')}</span>
              <span className="font-medium">Rp 0</span>
            </div>
            <div className="flex justify-between py-4 bg-gray-50 px-4 mt-2 rounded-lg">
              <span className="font-bold text-gray-900 text-lg">{t('invoice.total')}</span>
              <span className="font-bold text-primary-600 text-lg">
                Rp {Number(booking.totalPrice).toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>

        {/* ── Footer / Terms ── */}
        <div className="border-t-2 border-gray-100 pt-8 mt-auto text-gray-400 text-xs">
          <p className="font-bold text-gray-500 mb-1 uppercase tracking-wider">
            {t('invoice.terms_title')}
          </p>
          <p>{t('invoice.terms_1')}</p>
          <p>{t('invoice.terms_2')}</p>
          <p>{t('invoice.terms_3')}</p>
        </div>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';

export default InvoiceTemplate;
