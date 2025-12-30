import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  Lock,
  ShieldCheck,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../components/ToastContext';
import { mockService } from '../services/mockService';
import { BookingStatus, Product } from '../types';

interface LocationState {
  product: Product;
  quantity: number; // For tours this is guests, for others it's units
  guestCount?: number; // Actual number of people
  duration?: number; // Days or Nights
  totalPrice: number;
  date: string;
  currency: string;
  contactDetails?: {
    name: string;
    email: string;
    phone: string;
  };
  bookingId?: number; // Optional: If present, we are paying for an existing booking
}

const Payment: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  // State
  const [state] = useState<LocationState | null>(location.state as LocationState);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState('');
  const [redirectSeconds, setRedirectSeconds] = useState(5);

  // Generate a random VA number when bank changes
  useEffect(() => {
    if (selectedBank) {
      const prefix = selectedBank === 'BCA' ? '8800' : selectedBank === 'MANDIRI' ? '9001' : '1122';
      const random = Math.floor(Math.random() * 1000000000)
        .toString()
        .padStart(9, '0');
      setVirtualAccount(`${prefix}${random}`);
    }
  }, [selectedBank]);

  // Timer Logic for Payment Deadline
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  // Redirect Logic after Payment
  useEffect(() => {
    if (isPaid && redirectSeconds > 0) {
      const timer = setInterval(() => {
        setRedirectSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (isPaid && redirectSeconds === 0) {
      navigate('/my-bookings');
    }
  }, [isPaid, redirectSeconds, navigate]);

  // Format Time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(virtualAccount);
    showToast('Virtual Account number copied!');
  };

  const handlePaymentSimulation = async () => {
    if (!state || !user) return;
    setIsProcessing(true);

    // Simulate Network Delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Logic: Check if we are updating an existing booking or creating a new one
    if (state.bookingId) {
      // Update existing booking
      await mockService.updateBookingStatus(state.bookingId, BookingStatus.CONFIRMED);
    } else {
      // Save to Mock DB (New Booking)
      await mockService.createBooking({
        userId: user.id,
        productId: state.product.id,
        productName: state.product.name,
        productImage: state.product.image,
        quantity: state.quantity,
        totalPrice: state.totalPrice,
        date: state.date,
        contactDetails: state.contactDetails,
        // In real life, this might be 'CONFIRMED' after payment callback
      });
    }

    setIsPaid(true);
    setIsProcessing(false);
    showToast('Payment confirmed successfully!');
    // Ensure the user sees the success message by scrolling to the top
    window.scrollTo(0, 0);
  };

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Invalid Session</h2>
          <p className="text-gray-500 mb-6">Missing booking details.</p>
          <button
            onClick={() => navigate('/')}
            className="text-primary-600 font-bold hover:underline"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (isPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl text-center max-w-md w-full animate-in zoom-in duration-300">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 border border-green-100">
            <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-green-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4">
            Payment Successful!
          </h2>
          <p className="text-gray-500 mb-6 leading-relaxed text-sm md:text-base">
            Your booking has been confirmed. You will be redirected to your bookings in{' '}
            <span className="font-bold text-gray-900">{redirectSeconds}</span> seconds.
          </p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-6">
            <div className="bg-green-500 h-full rounded-full animate-[progress_2s_ease-in-out_infinite] w-full origin-left"></div>
          </div>
          <button
            onClick={() => navigate('/my-bookings')}
            className="text-primary-600 font-bold hover:underline text-sm"
          >
            Go to Bookings Now
          </button>
        </div>
      </div>
    );
  }

  const isTour = state.product.category_id === 1 || state.product.category_id === 3; // Basic assumption based on mock IDs

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-500 text-sm mt-1">Complete your secure booking</p>
          </div>
          <div className="self-start md:self-auto flex items-center text-green-700 bg-green-50 px-3 py-2 rounded-lg text-xs md:text-sm font-bold border border-green-100">
            <Lock className="w-3.5 h-3.5 mr-2" /> 256-bit SSL Encrypted
          </div>
        </div>

        {/* Main Grid: Flex col on mobile (Summary first), Grid on desktop */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-12">
          {/* Order Summary (Shown first on mobile) */}
          <div className="order-1 lg:order-2 lg:col-span-4">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 p-0 sticky top-24 overflow-hidden">
              <div className="p-5 md:p-6 bg-gray-900 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-lg font-bold">Order Summary</h2>
                  <p className="text-gray-400 text-xs mt-1 font-mono">
                    ID: #TRIV-{Math.floor(Math.random() * 10000)}
                  </p>
                </div>
                <div className="absolute right-0 top-0 w-20 h-20 bg-white/10 rounded-bl-full -mr-4 -mt-4"></div>
              </div>

              <div className="p-5 md:p-6">
                <div className="flex gap-4 mb-5">
                  <img
                    src={state.product.image}
                    alt="Product"
                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl shadow-md flex-shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-2 text-sm mb-1.5">
                      {state.product.name}
                    </h3>
                    <div className="flex items-center text-[10px] md:text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg w-fit">
                      <Clock className="w-3 h-3 mr-1" /> {state.date}
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 border-t border-gray-50 pt-5 mb-5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Base Price</span>
                    <span className="font-medium">
                      {state.currency} {state.product.price}
                    </span>
                  </div>

                  {/* Display logic for Duration and Units */}
                  {state.duration && state.duration > 1 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Duration</span>
                      <span className="font-medium">
                        {state.duration} {isTour ? 'Days' : 'Nights/Days'}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Quantity</span>
                    <span className="font-medium">
                      {state.quantity} {isTour ? 'Pax' : 'Unit(s)'}
                      {!isTour && state.guestCount && (
                        <span className="text-xs text-gray-400 ml-1">
                          ({state.guestCount} guests)
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm text-green-600 font-bold bg-green-50 px-2 py-1 -mx-2 rounded">
                    <span>Promo Code</span>
                    <span>- {state.currency} 0</span>
                  </div>
                </div>

                {/* Contact Details Display */}
                {state.contactDetails && (
                  <div className="border-t border-gray-50 pt-4 mb-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                      Booked For
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {state.contactDetails.name}
                        </p>
                        <p className="text-xs text-gray-500">{state.contactDetails.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-dashed border-gray-200 pt-4 mb-5">
                  <span className="font-bold text-gray-900">Total Payment</span>
                  <span className="text-xl md:text-2xl font-bold text-primary-600">
                    {state.currency} {state.totalPrice}
                  </span>
                </div>

                <div className="bg-blue-50 rounded-xl p-3 md:p-4 flex items-start gap-3 border border-blue-100">
                  <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-blue-800 mb-0.5">Payment Protection</p>
                    <p className="text-[10px] text-blue-700 leading-snug">
                      Your transaction is secured by Trivgoo Guarantee. Money back if service is not
                      as described.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods (Shown second on mobile) */}
          <div className="order-2 lg:order-1 lg:col-span-8 space-y-4 md:space-y-6">
            {/* Timer Card */}
            <div className="bg-gradient-to-r from-orange-50 to-white border border-orange-100 p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 text-orange-900 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 w-1 h-full bg-orange-400"></div>
              <div className="flex items-center z-10">
                <div className="bg-orange-100 p-2 rounded-xl mr-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <span className="font-bold block text-sm">Payment Deadline</span>
                  <span className="text-xs opacity-70 font-medium">
                    Please complete within 15 minutes
                  </span>
                </div>
              </div>
              <span className="text-xl md:text-2xl font-mono font-bold bg-white/50 px-3 py-1 rounded-lg border border-orange-100 self-start sm:self-auto">
                {formatTime(timeLeft)}
              </span>
            </div>

            {/* Payment Method Selection */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 md:p-8 border-b border-gray-100">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Select Bank Transfer</h2>
                <p className="text-gray-500 text-xs md:text-sm mt-1">
                  Choose your preferred bank for the Virtual Account.
                </p>
              </div>
              <div className="p-4 md:p-8 space-y-3 md:space-y-4">
                {[
                  { code: 'BCA', name: 'BCA Virtual Account', color: 'bg-[#005DAA]' },
                  {
                    code: 'MANDIRI',
                    name: 'Mandiri Virtual Account',
                    color: 'bg-[#FFB700] text-black',
                  },
                  { code: 'BNI', name: 'BNI Virtual Account', color: 'bg-[#F15A23]' },
                ].map((bank) => (
                  <div
                    key={bank.code}
                    onClick={() => setSelectedBank(bank.code)}
                    className={`relative border rounded-2xl p-4 md:p-5 cursor-pointer transition-all duration-300 flex items-center justify-between group ${
                      selectedBank === bank.code
                        ? 'border-primary-500 bg-primary-50/20 ring-1 ring-primary-500 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-12 h-9 md:w-16 md:h-10 ${
                          bank.color
                        } rounded-lg mr-3 md:mr-5 flex items-center justify-center text-white font-bold text-[10px] md:text-xs shadow-sm flex-shrink-0 ${
                          bank.code === 'MANDIRI' ? 'text-blue-900' : ''
                        }`}
                      >
                        {bank.code}
                      </div>
                      <div>
                        <span className="font-bold text-gray-800 block text-sm md:text-base">
                          {bank.name}
                        </span>
                        <span className="text-[10px] md:text-xs text-gray-400">
                          Automatic Verification
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                        selectedBank === bank.code
                          ? 'border-primary-500 bg-primary-500 text-white'
                          : 'border-gray-300 group-hover:border-gray-400'
                      }`}
                    >
                      {selectedBank === bank.code && (
                        <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Virtual Account Details (Shown when bank selected) */}
            {selectedBank && (
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-primary-100 overflow-hidden animate-in fade-in slide-in-from-top-4 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600"></div>
                <div className="p-5 md:p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                        Virtual Account Number
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl md:text-3xl font-mono font-bold text-gray-900 tracking-wider">
                          {virtualAccount}
                        </span>
                        <button
                          onClick={handleCopy}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-primary-600 transition-colors"
                          title="Copy"
                        >
                          <Copy className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500">Total Amount</span>
                      <span className="font-bold text-gray-900">
                        {state.currency} {state.totalPrice}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Bank</span>
                      <span className="font-bold text-gray-900">{selectedBank}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handlePaymentSimulation}
                      disabled={isProcessing}
                      className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-all disabled:opacity-70 flex justify-center items-center"
                    >
                      {isProcessing ? 'Verifying Payment...' : 'I Have Transferred'}
                    </button>
                    <button
                      onClick={() => setSelectedBank(null)}
                      disabled={isProcessing}
                      className="w-full py-3 bg-white text-gray-600 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      Change Method
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!selectedBank && (
              <div className="text-center p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Select a payment method to proceed.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
