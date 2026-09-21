/**
 * Utilitas Tanggal & Waktu Terstandarisasi WIB (Asia/Jakarta)
 */

export const TIMEZONE_WIB = 'Asia/Jakarta';

/**
 * Mengembalikan string tanggal format 'YYYY-MM-DD' sesuai zona waktu WIB.
 */
export function getWIBDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE_WIB,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Mengembalikan string waktu format 'HH:mm' sesuai zona waktu WIB.
 */
export function getWIBTimeString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: TIMEZONE_WIB,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Mengembalikan nama hari dalam Bahasa Indonesia sesuai zona waktu WIB (Senin, Selasa, dst.).
 */
export function getWIBDayName(date: Date = new Date()): string {
  const dayName = new Intl.DateTimeFormat('id-ID', {
    timeZone: TIMEZONE_WIB,
    weekday: 'long',
  }).format(date);

  // Capitalize first letter
  return dayName.charAt(0).toUpperCase() + dayName.slice(1);
}

/**
 * Memformat string ISO timestamp menjadi 'HH:mm WIB'
 */
export function formatTimeWIB(isoString?: string | null): string {
  if (!isoString) return '--:-- WIB';
  const date = new Date(isoString);
  const time = new Intl.DateTimeFormat('id-ID', {
    timeZone: TIMEZONE_WIB,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
  return `${time} WIB`;
}

/**
 * Memformat tanggal menjadi format panjang Bahasa Indonesia: 'Senin, 21 September 2026'
 */
export function formatDateIndo(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: TIMEZONE_WIB,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
