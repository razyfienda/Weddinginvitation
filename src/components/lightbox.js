import { createPlaceholder } from '../core/defaults.js';
import { safeUrl } from '../core/sanitize.js';

export function initLightbox() {
  const modal = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  let lastTrigger = null;

  function open(url, text, triggerEl) {
    const valid = safeUrl(url) || createPlaceholder(text || 'Foto Galeri');
    lastTrigger = triggerEl || document.activeElement;
    img.src = valid;
    img.alt = text || 'Foto galeri';
    caption.textContent = text || '';
    modal.hidden = false;
    closeBtn.focus();
  }

  function close() {
    if (modal.hidden) return;
    modal.hidden = true;
    img.removeAttribute('src');
    lastTrigger?.focus?.();
  }

  img.addEventListener('error', () => {
    const fallback = createPlaceholder(caption.textContent || 'Foto Galeri');
    if (img.src !== fallback) {
      img.src = fallback;
    }
  });

  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) close();
  });

  return { open, close };
}
