import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';

export const formatRideDate = (dateStr: string): string => {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, dd MMM yyyy');
  } catch {
    return dateStr;
  }
};

export const formatRideDateTime = (dateStr: string, timeStr: string): string => {
  const formattedDate = formatRideDate(dateStr);
  return `${formattedDate} at ${timeStr}`;
};

export const isRideDatePast = (dateStr: string, timeStr: string): boolean => {
  try {
    const dateTime = new Date(`${dateStr}T${timeStr}:00`);
    return isPast(dateTime);
  } catch {
    return false;
  }
};

export const getRelativeTimestamp = (isoString: string): string => {
  try {
    const date = parseISO(isoString);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    }
    return format(date, 'dd MMM, h:mm a');
  } catch {
    return isoString;
  }
};
