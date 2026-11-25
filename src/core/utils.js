const ZONE_OFFSETS = {
  WIB: '+07:00',
  WITA: '+08:00',
  WIT: '+09:00'
};

export function parseEventTimestamp(dateStr, zone = 'WIB') {
  if (!dateStr) return NaN;
  const trimmed = String(dateStr).trim();
  const hasOffset = /(?:Z|[+-]\d{2}:\d{2})$/.test(trimmed);
  if (hasOffset) return new Date(trimmed).getTime();

  const offset = ZONE_OFFSETS[zone] || '+07:00';
  // Normalize YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss
  const normalized = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)
    ? `${trimmed}:00${offset}`
    : `${trimmed}${offset}`;
  return new Date(normalized).getTime();
}

export function formatIndonesianDate(dateStr) {
  if (!dateStr) return 'Tanggal segera diumumkan';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'Tanggal segera diumumkan';
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
    .format(d)
    .toUpperCase();
}

export function computeCountdownParts(targetMs, nowMs = Date.now()) {
  if (!Number.isFinite(targetMs)) {
    return { status: 'invalid', days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const diff = targetMs - nowMs;
  if (diff <= 0) {
    return { status: 'reached', days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    status: 'counting',
    days: Math.floor(diff / 86400000),
    hours: Math.floor(diff / 3600000) % 24,
    minutes: Math.floor(diff / 60000) % 60,
    seconds: Math.floor(diff / 1000) % 60
  };
}

export function uid(prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

let toastTimer;
export function showToast(message) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, 2800);
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
