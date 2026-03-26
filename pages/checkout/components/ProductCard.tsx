import { Award, Briefcase, Calendar, Clock, Fuel, MapPin, Users, UserCog } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getImageUrl } from '../../../utils/imageUtils';
import { formatDateDisplay, formatDateString, getTransmissionLabel } from '../constants';

interface Props {
  productName:      string;
  productLocation:  string;
  image:            string;
  vehicleType?:     string;
  transmission?:    string;
  isCarBooking:     boolean;
  date:             string;
  duration:         number;
  pax:              number;
  guestCount?:      number;
  priceUnitLabel:   string;
  seats?:           number;
  luggage?:         number;
  year?:            number;
  fuelPolicy?:      string;
  withDriver?:      boolean;
  pickupTime?:      string;
  returnTime?:      string;
}

export const ProductCard: React.FC<Props> = ({
  productName, productLocation, image, vehicleType, transmission,
  isCarBooking, date, duration, pax, guestCount, priceUnitLabel,
  seats, luggage, year, fuelPolicy, withDriver, pickupTime, returnTime,
}) => {
  const { t } = useTranslation(); // ✅ dipindah ke sini

  const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');

  const DateRangeWithTime = () => {
    if (!date || !date.includes(' - ')) return <span>{formatDateDisplay(date)}</span>;
    const [start, end] = date.split(' - ');
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">Ambil:</span>
          <span className="font-medium">{formatDateString(start)}</span>
          {pickupTime && <span className="text-sm text-gray-400">({pickupTime})</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">Kembali:</span>
          <span className="font-medium">{formatDateString(end)}</span>
          {returnTime && <span className="text-sm text-gray-400">({returnTime})</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="flex p-4 gap-4">
        <img src={getImageUrl(image)} alt={productName} className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
          onError={(e) => {
            if (image && !image.startsWith('http'))
              (e.currentTarget as HTMLImageElement).src = `${BASE_URL}/${image.replace(/^\//, '')}`;
          }}
        />
        <div className="flex-1">
          <h2 className="font-bold text-gray-800 leading-tight">{productName}</h2>
          <div className="flex items-center text-sm text-gray-500 mt-1.5">
            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />{productLocation}
          </div>
          {isCarBooking && (
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">Rental Mobil</span>
              {transmission && <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{getTransmissionLabel(transmission)}</span>}
            </div>
          )}
          {vehicleType === 'tour' && <span className="mt-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">Tour & Activity</span>}
          {vehicleType === 'stay' && <span className="mt-2 inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">Hotel & Vila</span>}
        </div>
      </div>

      <div className="bg-gray-50 p-4 border-t border-gray-100">
        {isCarBooking ? (
          <div className="space-y-3">
            {date && (
              <div className="flex items-start gap-3 text-sm">
                <Calendar className="w-4 h-4 mt-0.5 text-primary-500 flex-shrink-0" />
                <div className="flex-1 text-gray-600"><DateRangeWithTime /></div>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span className="text-gray-600">Durasi Sewa: <span className="font-semibold">{duration} Hari</span></span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200">
              {seats      && <div className="flex items-center gap-2 text-sm"><Users     className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{seats} Penumpang</span></div>}
              {luggage    && <div className="flex items-center gap-2 text-sm"><Briefcase className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{luggage} Koper</span></div>}
              {year       && <div className="flex items-center gap-2 text-sm"><Award     className="w-4 h-4 text-gray-400" /><span className="text-gray-600">Tahun {year}</span></div>}
              {fuelPolicy && <div className="flex items-center gap-2 text-sm"><Fuel      className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{fuelPolicy}</span></div>}
            </div>
            {withDriver !== undefined && (
              <div className="flex items-center gap-2 text-sm pt-2 border-t border-gray-200">
                <UserCog className="w-4 h-4 text-primary-500" />
                <span className="text-gray-600">{withDriver ? 'Dengan Sopir' : 'Tanpa Sopir (Lepas Kunci)'}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {date && (
              <div className="flex items-start gap-2 col-span-2">
                <Calendar className="w-4 h-4 mt-0.5 text-primary-500 flex-shrink-0" />
                <span className="text-gray-600">{formatDateDisplay(date)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span className="text-gray-600">{guestCount ?? pax} {vehicleType === 'stay' ? 'Tamu' : 'Orang'}</span>
            </div>
            {duration > 1 && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span className="text-gray-600">{duration} {priceUnitLabel === 'malam' ? 'Malam' : 'Hari'}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};