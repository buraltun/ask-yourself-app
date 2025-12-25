import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export const getTodayDateString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const formatDisplayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'd MMMM yyyy, EEEE', { locale: tr });
};

export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, 'd MMM', { locale: tr });
};
