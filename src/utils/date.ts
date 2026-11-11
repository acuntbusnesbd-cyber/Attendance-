import { Language } from '../types';

const bnNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(num: number | string): string {
  return String(num).replace(/[0-9]/g, (digit) => bnNumbers[Number(digit)] || digit);
}

export function formatDisplayNumber(num: number | string, lang: Language): string {
  if (lang === 'bn') {
    return toBengaliNumber(num);
  }
  return String(num);
}

const bnMonths = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

export function formatDate(dateString: string, lang: Language): string {
  if (!dateString) return '';
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);

      const dateObj = new Date(year, month, day);

      if (lang === 'bn') {
        const dayBn = toBengaliNumber(day);
        const monthBn = bnMonths[month] || '';
        const yearBn = toBengaliNumber(year);
        return `${dayBn} ${monthBn}, ${yearBn}`;
      } else {
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      }
    }
  } catch {
    // fallback
  }
  return dateString;
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
