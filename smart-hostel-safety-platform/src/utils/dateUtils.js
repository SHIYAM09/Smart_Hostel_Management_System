/**
 * Utility functions to handle Indian Standard Time (IST / Asia/Kolkata)
 * and ensure single-source date and time strings across the UI and DB sync.
 */

export const getIndianDateStr = (dateInput = new Date()) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

export const getIndianTimeStr = (dateInput = new Date()) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) {
    return new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
  }
  return d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
};

export const getIndianDateTimeStr = (dateInput = new Date()) => {
  return `${getIndianDateStr(dateInput)} ${getIndianTimeStr(dateInput)}`;
};
