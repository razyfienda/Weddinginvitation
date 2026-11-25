import { safeUrl } from '../core/sanitize.js';
import { showToast } from '../core/utils.js';

export function initMusicController() {
  const audio = document.getElementById('bgMusic');
  const toggleBtn = document.getElementById('musicToggle');
  const mobileToggleBtn = document.getElementById('mobileMusicBtn');
  const volumeSlider = document.getElementById('volume');
  let currentUrl = '';

  audio.volume = Number(volumeSlider.value);

  function setPlayingUi(playing) {
    toggleBtn.textContent = playing ? 'Jeda Musik' : 'Putar Musik';
    toggleBtn.setAttribute('aria-pressed', String(playing));
    mobileToggleBtn?.setAttribute('aria-pressed', String(playing));
  }

  function syncSource(url) {
    const clean = safeUrl(url);
    if (clean === currentUrl) return;
    currentUrl = clean;
    if (!clean) {
      audio.pause();
      audio.removeAttribute('src');
      setPlayingUi(false);
      return;
    }
    audio.src = clean;
    audio.load();
  }

  async function playIfConfigured() {
    if (!currentUrl || !audio.paused) return;
    try {
      await audio.play();
      setPlayingUi(true);
    } catch {
      // Browser blocked autoplay before sufficient user gesture
    }
  }

  async function togglePlayback() {
    if (!currentUrl) {
      showToast('Atur URL musik di panel Kelola Undangan terlebih dahulu.');
      return;
    }
    if (audio.paused) {
      try {
        await audio.play();
        setPlayingUi(true);
      } catch {
        showToast('Musik tidak dapat diputar. Periksa format atau URL audio.');
      }
    } else {
      audio.pause();
      setPlayingUi(false);
    }
  }

  toggleBtn.addEventListener('click', togglePlayback);
  mobileToggleBtn?.addEventListener('click', togglePlayback);

  volumeSlider.addEventListener('input', (e) => {
    audio.volume = Number(e.target.value);
  });

  return { syncSource, playIfConfigured };
}
