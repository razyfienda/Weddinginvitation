export function safeText(value, max = 500) {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

export function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

export function safeUrl(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  // Allow safe data:image payloads for SVG/raster placeholders
  if (/^data:image\/(png|jpeg|jpg|webp|svg\+xml);/i.test(raw)) {
    return raw;
  }

  // Block explicit dangerous schemes before relative URL resolution
  if (/^(javascript|vbscript|data):/i.test(raw)) {
    return '';
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  try {
    const parsed = new URL(raw, origin);
    if (['http:', 'https:'].includes(parsed.protocol)) {
      return raw;
    }
  } catch {
    return '';
  }
  return '';
}

export function safeHexColor(value, fallback = '#88682e') {
  return /^#[0-9a-f]{6}$/i.test(String(value ?? '').trim()) ? value.trim() : fallback;
}
