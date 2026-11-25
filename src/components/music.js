import { safeUrl } from '../core/sanitize.js';
import { showToast } from '../core/utils.js';

export function initMusicController() {
  const audio = document.getElementById('bgMusic');
  const toggleBtn = document.getElementById('musicToggle');
  const volumeSlider = document.getElementById('volume');
  let currentUrl = '';

  audio.volume = Number(volumeSlider.value);

  function syncSource(url) {
    const clean = safeUrl(url);
    if (clean === currentUrl) return;
    currentUrl = clean;
    if (!clean) {
      audio.pause();
      audio.removeAttribute('src');
      toggleBtn.textContent = 'Putar Musik';
      toggleBtn.setAttribute('aria-pressed', 'false');
      return;
    }
    audio.src = clean;
    audio.load();
  }

  async function playIfConfigured() {
    if (!currentUrl || !audio.paused) return;
    try {
      await audio.play();
      toggleBtn.textContent = 'Jeda Musik';
      toggleBtn.setAttribute('aria-pressed', 'true');
    } catch {
      // Browser blocked autoplay before sufficient user gesture
    }
  }

  toggleBtn.addEventListener('click', async () => {
    if (!currentUrl) {
      showToast('Atur URL musik di panel Kelola Undangan terlebih dahulu.');
      return;
    }
    if (audio.paused) {
      try {
        await audio.play();
        toggleBtn.textContent = 'Jeda Musik';
        toggleBtn.setAttribute('aria-pressed', 'true');
      } catch {
        showToast('Musik tidak dapat diputar. Periksa format atau URL audio.');
      }
    } else {
      audio.pause();
      toggleBtn.textContent = 'Putar Musik';
      toggleBtn.setAttribute('aria-pressed', 'false');
    }
  });

  volumeSlider.addEventListener('input', (e) => {
    audio.volume = Number(e.target.value);
  });

  return { syncSource, playIfConfigured };
}
