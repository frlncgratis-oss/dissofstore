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
 * Plays a pleasant, charming two-tone chime via Web Audio API.
 * No external MP3/WAV files required, completely offline and reliable.
 */
export function playNotificationChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Note 1 (E6 - ~1318.5 Hz)
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

    // Note 2 (A6 - ~1760 Hz) - Higher sweeter note
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, now + 0.12);
    gain2.gain.setValueAtTime(0.25, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch (e) {
    console.warn('Audio chime could not play:', e);
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

/**
 * Compresses an image file from mobile gallery or file picker into an optimized base64 string.
 * This prevents localStorage quota overflow and ensures fast loading.
 */
export function compressImageFile(file: File, maxDim = 800, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih bukan gambar yang valid.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        // Clean white background for transparency conversion
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        reject(new Error('Gagal memproses file gambar.'));
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Gagal membaca file gambar dari perangkat.'));
    };
    reader.readAsDataURL(file);
  });
}
