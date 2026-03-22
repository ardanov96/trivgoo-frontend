import React, { useState } from 'react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const getDaysInMonth     = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
const toDateString       = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const useCalendar = () => {
  const [searchDate, setSearchDate]         = useState('');
  const [isOpen, setIsOpen]                 = useState(false);
  const [pickerDate, setPickerDate]         = useState(new Date());

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth() - 1, 1));
  };
  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setPickerDate(new Date(pickerDate.getFullYear(), pickerDate.getMonth() + 1, 1));
  };
  const handleDateClick = (day: number) => {
    const d = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), day);
    setSearchDate(toDateString(d));
    setIsOpen(false);
  };
  const handleToday = () => {
    const d = new Date();
    setPickerDate(d);
    setSearchDate(toDateString(d));
    setIsOpen(false);
  };
  const handleClear = () => { setSearchDate(''); setIsOpen(false); };

  const renderCalendarGrid = (): React.ReactNode[] => {
    const y = pickerDate.getFullYear();
    const m = pickerDate.getMonth();
    const days: React.ReactNode[] = [];

    for (let i = 0; i < getFirstDayOfMonth(y, m); i++) {
      days.push(<div key={`e${i}`} className="h-8 w-8" />);
    }
    for (let day = 1; day <= getDaysInMonth(y, m); day++) {
      const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push(
        <button
          key={day}
          onClick={(e) => { e.preventDefault(); handleDateClick(day); }}
          className={`h-8 w-8 text-sm rounded-full flex items-center justify-center transition-colors ${
            searchDate === ds ? 'bg-primary-600 text-white font-bold' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }
    return days;
  };

  return {
    searchDate, isOpen, setIsOpen, pickerDate,
    monthLabel: `${MONTHS[pickerDate.getMonth()]} ${pickerDate.getFullYear()}`,
    handlePrevMonth, handleNextMonth, handleToday, handleClear, renderCalendarGrid,
  };
};
