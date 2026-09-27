import { CurrencyCode } from '../types';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  CAD: 'CA$',
  AUD: 'AU$'
};

/**
 * Format currency amount with proper commas and symbol.
 * In INR mode, uses Indian numbering format (Lakhs & Crores).
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'INR', compact = false): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  
  if (compact) {
    if (currency === 'INR') {
      if (Math.abs(amount) >= 10000000) {
        const val = parseFloat((amount / 10000000).toFixed(2));
        return `${symbol}${val}\u00A0Cr`;
      } else if (Math.abs(amount) >= 100000) {
        const val = parseFloat((amount / 100000).toFixed(2));
        return `${symbol}${val}\u00A0L`;
      } else if (Math.abs(amount) >= 1000) {
        const val = parseFloat((amount / 1000).toFixed(1));
        return `${symbol}${val}\u00A0K`;
      }
    } else {
      if (Math.abs(amount) >= 1000000) {
        const val = parseFloat((amount / 1000000).toFixed(2));
        return `${symbol}${val}M`;
      } else if (Math.abs(amount) >= 1000) {
        const val = parseFloat((amount / 1000).toFixed(1));
        return `${symbol}${val}k`;
      }
    }
  }

  if (currency === 'INR') {
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  }

  return `${symbol}${amount.toLocaleString('en-US')}`;
}

/**
 * Format compact date string (e.g. 15 Aug 2026)
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Client-side lightweight image compressor for mobile camera photos
 * Converts heavy 8MB camera shots down to ~120KB while preserving sharp receipt text
 */
export function compressReceiptImage(file: File, maxWidth = 1200, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Web Audio API gentle sound for deduction and interaction feedback
 */
export function playDeductSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch {
    // Ignore audio permission or context restrictions gracefully
  }
}

export function playSuccessSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Ignore
  }
}
