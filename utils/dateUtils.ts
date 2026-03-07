/** Converts "HH:MM" 24-hr string to "H:MM AM/PM". Pass-through for already-formatted or TBD values. */
export const formatTime = (t: string): string => {
  if (!t || t === 'TBD') return t;
  if (/AM|PM/i.test(t)) return t;
  const [hStr, mStr = '00'] = t.split(':');
  let h = parseInt(hStr, 10);
  const meridiem = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${meridiem}`;
};

/** Returns tomorrow's date as a "YYYY-MM-DD" string using local time (avoids UTC offset bugs). */
export const getMinDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
