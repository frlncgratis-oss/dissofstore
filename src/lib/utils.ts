import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function cleanPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned || '6282284901234';
}

export function getStoredWhatsAppNumber(): string {
  try {
    const stored = localStorage.getItem('whatsapp_number');
    if (stored && stored.trim()) {
      return cleanPhone(stored.trim());
    }
    const settingsRaw = localStorage.getItem('site_settings');
    if (settingsRaw) {
      const parsed = JSON.parse(settingsRaw);
      if (parsed.whatsapp_number) {
        return cleanPhone(parsed.whatsapp_number);
      }
    }
  } catch (e) {
    console.warn('Could not retrieve stored whatsapp number:', e);
  }
  return '6282284901234';
}

export function setStoredWhatsAppNumber(num: string): void {
  try {
    const cleaned = cleanPhone(num);
    localStorage.setItem('whatsapp_number', cleaned);
    window.dispatchEvent(new Event('dissof_whatsapp_updated'));
  } catch (e) {
    console.warn('Could not store whatsapp number:', e);
  }
}

export function createWhatsAppLink(phoneNumber?: string, message: string = ''): string {
  const numberToUse = phoneNumber ? cleanPhone(phoneNumber) : getStoredWhatsAppNumber();
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${numberToUse}?text=${encoded}`;
}

/**
 * Plays a pleasant, charming 3-tone boutique chime via Web Audio API.
 * No external MP3/WAV files required, completely offline, zero-lag, and reliable.
 */
export function playNotificationChime(): void {
  try {
    // Vibrate device if supported on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([150, 60, 150]);
      } catch {
        // ignore vibrate restrictions
      }
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    
    // Note 1: E6 (~1318.5 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1318.51, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2: G6 (~1567.98 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1567.98, now + 0.1);
    gain2.gain.setValueAtTime(0.22, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.45);

    // Note 3: C7 (~2093.00 Hz) - Bright sweet finish
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(2093.00, now + 0.22);
    gain3.gain.setValueAtTime(0.25, now + 0.22);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.22);
    osc3.stop(now + 0.7);
  } catch (e) {
    console.warn('Audio chime could not play:', e);
  }
}

/**
 * Checks whether Browser Notifications are supported on current platform
 */
export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Requests browser push notification permission for the Admin
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!isBrowserNotificationSupported()) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Could not request notification permission:', err);
    return 'denied';
  }
}

/**
 * Sends a native browser system notification pop-up
 */
export function sendBrowserNotification(
  title: string, 
  options?: NotificationOptions & { onClick?: () => void }
): Notification | null {
  if (!isBrowserNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  try {
    const notif = new Notification(title, {
      icon: 'https://images.unsplash.com/photo-1611591475152-4735d38d0145?w=128&auto=format&fit=crop&q=80',
      badge: 'https://images.unsplash.com/photo-1611591475152-4735d38d0145?w=96&auto=format&fit=crop&q=80',
      ...options,
    });

    notif.onclick = () => {
      try {
        window.focus();
      } catch {}
      if (options?.onClick) {
        options.onClick();
      }
      notif.close();
    };

    return notif;
  } catch (err) {
    console.warn('Failed to display browser notification:', err);
    return null;
  }
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatFullDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isSameMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}

export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function getMonthName(monthIndex: number): string {
  return INDONESIAN_MONTHS[monthIndex] || `Bulan ${monthIndex + 1}`;
}


export const STORE_LOGO_KEY = 'store_logo';
export const STORE_HERO_BANNER_KEY = 'store_hero_banner';
export const STORE_BACKGROUND_KEY = 'store_background';

export const DEFAULT_BACKGROUND_COLOR = '#F9F7F2';

export interface StoreBackgroundData {
  type: 'color' | 'image';
  value: string;
  mode?: 'cover' | 'repeat' | 'fixed';
}

export const DEFAULT_BACKGROUND: StoreBackgroundData = {
  type: 'color',
  value: DEFAULT_BACKGROUND_COLOR,
  mode: 'cover'
};

export function getStoredBackground(): StoreBackgroundData {
  try {
    const val = localStorage.getItem(STORE_BACKGROUND_KEY);
    if (!val) return DEFAULT_BACKGROUND;
    
    // Check if it's stored as JSON
    if (val.startsWith('{')) {
      const parsed = JSON.parse(val);
      if (parsed && parsed.value) {
        return {
          type: parsed.type || (parsed.value.startsWith('#') || parsed.value.startsWith('rgb') ? 'color' : 'image'),
          value: parsed.value,
          mode: parsed.mode || 'cover'
        };
      }
    }

    // Direct color string or image string
    const isColor = val.startsWith('#') || val.startsWith('rgb') || val.startsWith('hsl');
    return {
      type: isColor ? 'color' : 'image',
      value: val,
      mode: 'cover'
    };
  } catch {
    return DEFAULT_BACKGROUND;
  }
}

export function setStoredBackground(bg: StoreBackgroundData): void {
  try {
    localStorage.setItem(STORE_BACKGROUND_KEY, JSON.stringify(bg));
    window.dispatchEvent(new CustomEvent('dissof_branding_updated', { detail: { type: 'background', value: bg } }));
  } catch (e) {
    console.warn('Error saving background to localStorage:', e);
  }
}

export function resetStoredBackground(): void {
  try {
    localStorage.setItem(STORE_BACKGROUND_KEY, JSON.stringify(DEFAULT_BACKGROUND));
    window.dispatchEvent(new CustomEvent('dissof_branding_updated', { detail: { type: 'background', value: DEFAULT_BACKGROUND } }));
  } catch (e) {
    console.warn('Error resetting background in localStorage:', e);
  }
}

export function getStoredLogo(): string | null {
  try {
    const val = localStorage.getItem(STORE_LOGO_KEY);
    return val && val.trim() ? val : null;
  } catch {
    return null;
  }
}

export function setStoredLogo(logoBase64OrUrl: string): void {
  try {
    if (logoBase64OrUrl && logoBase64OrUrl.trim()) {
      localStorage.setItem(STORE_LOGO_KEY, logoBase64OrUrl.trim());
    } else {
      localStorage.removeItem(STORE_LOGO_KEY);
    }
    window.dispatchEvent(new CustomEvent('dissof_branding_updated', { detail: { type: 'logo', value: logoBase64OrUrl } }));
  } catch (e) {
    console.warn('Error saving store logo to localStorage:', e);
  }
}

export function removeStoredLogo(): void {
  try {
    localStorage.removeItem(STORE_LOGO_KEY);
    window.dispatchEvent(new CustomEvent('dissof_branding_updated', { detail: { type: 'logo', value: null } }));
  } catch (e) {
    console.warn('Error removing store logo from localStorage:', e);
  }
}

export function getStoredHeroBanner(): string | null {
  try {
    const val = localStorage.getItem(STORE_HERO_BANNER_KEY);
    return val && val.trim() ? val : null;
  } catch {
    return null;
  }
}

export function setStoredHeroBanner(bannerBase64OrUrl: string): void {
  try {
    if (bannerBase64OrUrl && bannerBase64OrUrl.trim()) {
      localStorage.setItem(STORE_HERO_BANNER_KEY, bannerBase64OrUrl.trim());
    } else {
      localStorage.removeItem(STORE_HERO_BANNER_KEY);
    }
    window.dispatchEvent(new CustomEvent('dissof_branding_updated', { detail: { type: 'hero_banner', value: bannerBase64OrUrl } }));
  } catch (e) {
    console.warn('Error saving hero banner to localStorage:', e);
  }
}

export function removeStoredHeroBanner(): void {
  try {
    localStorage.removeItem(STORE_HERO_BANNER_KEY);
    window.dispatchEvent(new CustomEvent('dissof_branding_updated', { detail: { type: 'hero_banner', value: null } }));
  } catch (e) {
    console.warn('Error removing hero banner from localStorage:', e);
  }
}

export {
  hardCompressImage,
  getImageSizeInKB,
  safeLocalStorageSet,
  isQuotaExceededError,
  idbSaveItem,
  idbSaveAll,
  idbGetAll,
  idbDeleteItem
} from './storageFallback';

/**
 * Compresses an image file from mobile gallery or file picker into an ultra-light base64 string (<200KB).
 * Applies Hard Compression (max 800px width/height, JPEG 0.60 quality) with progressive size reduction
 * to prevent Firebase/LocalStorage "Quota Exceeded" errors.
 */
export async function compressImageFile(
  file: File,
  maxDim = 800,
  quality = 0.6,
  preserveAlpha = false
): Promise<string> {
  if (preserveAlpha && file.type === 'image/png') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const limit = Math.min(maxDim, 800);
          if (width > limit || height > limit) {
            if (width > height) {
              height = Math.round((height * limit) / width);
              width = limit;
            } else {
              width = Math.round((width * limit) / height);
              height = limit;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(e.target?.result as string);
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Gagal memproses gambar PNG.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Gagal membaca file PNG.'));
      reader.readAsDataURL(file);
    });
  }

  // Use hard compression engine for all regular images
  const { hardCompressImage: doHardCompress } = await import('./storageFallback');
  return doHardCompress(file, maxDim, quality, 195);
}

