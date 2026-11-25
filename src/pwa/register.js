import { registerSW } from 'virtual:pwa-register';
import { showToast } from '../core/utils.js';
import { getInstallActionMode, isIOSDevice, isStandaloneMode } from './install-state.js';

export function initPWA() {
  const installBtns = [
    document.getElementById('pwaInstallBtn'),
    document.getElementById('coverInstallBtn')
  ].filter(Boolean);
  const guideModal = document.getElementById('installGuideModal');
  const guideTitle = document.getElementById('installGuideTitle');
  const guideBody = document.getElementById('installGuideBody');
  const guideClose = document.getElementById('installGuideClose');
  const offlineIndicator = document.getElementById('offlineIndicator');

  let deferredPrompt = null;
  let isInstalled = isStandaloneMode({
    matchMediaStandalone: window.matchMedia?.('(display-mode: standalone)').matches,
    navigatorStandalone: window.navigator?.standalone === true
  });
  const isIOS = isIOSDevice(window.navigator?.userAgent || '');
  let lastTrigger = null;

  function syncInstallButtons() {
    const mode = getInstallActionMode({
      isInstalled,
      hasDeferredPrompt: Boolean(deferredPrompt),
      isIOS
    });

    installBtns.forEach((btn) => {
      if (mode === 'hidden') {
        btn.classList.add('hidden');
      } else {
        btn.classList.remove('hidden');
        btn.dataset.installMode = mode;
      }
    });
  }

  function openGuide(triggerEl) {
    if (!guideModal) return;
    lastTrigger = triggerEl || document.activeElement;
    if (isIOS) {
      guideTitle.textContent = 'Pasang di iPhone / iPad';
      guideBody.innerHTML =
        '1. Ketuk tombol <strong>Bagikan (Share)</strong> pada bilah Safari.<br />2. Gulir ke bawah lalu ketuk <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>.';
    } else {
      guideTitle.textContent = 'Pasang sebagai Aplikasi Mobile';
      guideBody.innerHTML =
        '1. Buka menu browser (ikon titik tiga <strong>⋮</strong> di Chrome/Edge).<br />2. Pilih <strong>Pasang aplikasi</strong> atau <strong>Tambahkan ke layar utama</strong> untuk akses layar penuh dan mode offline.';
    }
    guideModal.hidden = false;
    guideClose?.focus();
  }

  function closeGuide() {
    if (!guideModal || guideModal.hidden) return;
    guideModal.hidden = true;
    lastTrigger?.focus?.();
  }

  async function handleInstallClick(e) {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        isInstalled = true;
        deferredPrompt = null;
        syncInstallButtons();
        showToast('Aplikasi undangan berhasil dipasang.');
      }
      return;
    }
    openGuide(e.currentTarget);
  }

  installBtns.forEach((btn) => {
    btn.addEventListener('click', handleInstallClick);
  });

  guideClose?.addEventListener('click', closeGuide);
  guideModal?.addEventListener('click', (e) => {
    if (e.target === guideModal) closeGuide();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && guideModal && !guideModal.hidden) closeGuide();
  });

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    syncInstallButtons();
  });

  window.addEventListener('appinstalled', () => {
    isInstalled = true;
    deferredPrompt = null;
    syncInstallButtons();
    showToast('Aplikasi terpasang di perangkat Anda.');
  });

  function syncOnlineStatus() {
    if (!offlineIndicator) return;
    offlineIndicator.hidden = navigator.onLine !== false;
  }

  window.addEventListener('online', () => {
    syncOnlineStatus();
    showToast('Kembali online.');
  });
  window.addEventListener('offline', syncOnlineStatus);

  syncInstallButtons();
  syncOnlineStatus();

  try {
    registerSW({
      immediate: true,
      onOfflineReady() {
        // Ready for offline viewing
      }
    });
  } catch {
    // Graceful fallback if SW registration is unavailable in restricted contexts
  }
}
