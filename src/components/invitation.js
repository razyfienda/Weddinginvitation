import { createPlaceholder } from '../core/defaults.js';
import { escapeHtml, safeHexColor, safeText, safeUrl } from '../core/sanitize.js';
import {
  computeCountdownParts,
  copyToClipboard,
  formatIndonesianDate,
  parseEventTimestamp,
  showToast,
  uid
} from '../core/utils.js';
import { isRemoteEnabled, repository } from '../services/repository.js';

export function initInvitation({ store, music, lightbox }) {
  const el = {
    cover: document.getElementById('cover'),
    coverMan: document.getElementById('coverMan'),
    coverWoman: document.getElementById('coverWoman'),
    coverDate: document.getElementById('coverDate'),
    openingMessage: document.getElementById('openingMessage'),
    guestGreeting: document.getElementById('guestGreeting'),
    openBtn: document.getElementById('openInvitation'),
    nav: document.getElementById('mainNav'),
    navBrand: document.getElementById('navBrand'),
    main: document.getElementById('invitation'),
    coupleProfiles: document.getElementById('coupleProfiles'),
    coupleDescription: document.getElementById('coupleDescription'),
    countdown: document.getElementById('countdown'),
    eventCards: document.getElementById('eventCards'),
    timeline: document.getElementById('timeline'),
    galleryGrid: document.getElementById('galleryGrid'),
    locationDetails: document.getElementById('locationDetails'),
    mapBox: document.getElementById('mapBox'),
    mapsLink: document.getElementById('mapsLink'),
    rsvpModeInfo: document.getElementById('rsvpModeInfo'),
    rsvpForm: document.getElementById('rsvpForm'),
    rsvpName: document.getElementById('rsvpName'),
    rsvpStatus: document.getElementById('rsvpStatus'),
    rsvpCount: document.getElementById('rsvpCount'),
    rsvpResult: document.getElementById('rsvpResult'),
    guestForm: document.getElementById('guestForm'),
    guestName: document.getElementById('guestName'),
    guestMessage: document.getElementById('guestMessage'),
    guestMessages: document.getElementById('guestMessages'),
    giftDetails: document.getElementById('giftDetails'),
    footer: document.getElementById('mainFooter'),
    footerNames: document.getElementById('footerNames')
  };

  let countdownInterval = null;
  let lastMapQuery = '';

  const searchParams = new URLSearchParams(window.location.search);
  const guestFromUrl = safeText(searchParams.get('to'), 60);
  if (guestFromUrl) {
    el.guestGreeting.textContent = `Kepada Yth. ${guestFromUrl}`;
    el.guestGreeting.classList.remove('hidden');
    el.rsvpName.value = guestFromUrl;
    el.guestName.value = guestFromUrl;
  }

  el.rsvpModeInfo.textContent = isRemoteEnabled
    ? 'Konfirmasi kehadiran Anda akan langsung tersimpan ke sistem panitia.'
    : 'Konfirmasi kehadiran tersimpan di browser perangkat ini dan dapat diekspor di Studio Undangan.';

  function revealInvitation(scrollToMain = true) {
    el.nav.classList.remove('hidden');
    el.main.classList.remove('hidden');
    el.footer?.classList.remove('hidden');
    if (scrollToMain) {
      el.main.scrollIntoView({ behavior: 'smooth' });
    }
    music.playIfConfigured();
  }

  el.openBtn.addEventListener('click', () => revealInvitation(true));

  if (searchParams.get('autostart') === '1') {
    revealInvitation(false);
  }

  function updateCountdown(targetDate, zone) {
    clearInterval(countdownInterval);

    const tick = () => {
      const targetMs = parseEventTimestamp(targetDate, zone);
      const parts = computeCountdownParts(targetMs, Date.now());

      if (parts.status === 'invalid') {
        el.countdown.innerHTML = '<p>Tanggal acara belum diatur.</p>';
        return;
      }
      if (parts.status === 'reached') {
        el.countdown.innerHTML = '<p><strong>Hari bahagia telah tiba!</strong></p>';
        clearInterval(countdownInterval);
        return;
      }

      const items = [
        [parts.days, 'Hari'],
        [parts.hours, 'Jam'],
        [parts.minutes, 'Menit'],
        [parts.seconds, 'Detik']
      ];
      el.countdown.innerHTML = items
        .map(
          ([val, label]) =>
            `<div class="countdown-item"><strong>${val}</strong><span>${label}</span></div>`
        )
        .join('');
    };

    tick();
    countdownInterval = setInterval(tick, 1000);
  }

  function renderEntries(data) {
    el.rsvpResult.innerHTML = data.rsvps.length
      ? `<h3>Daftar Konfirmasi (${data.rsvps.length})</h3>` +
        data.rsvps
          .slice()
          .reverse()
          .map(
            (r) => `<div class="guest-note">
              <strong>${escapeHtml(r.namaAlias)}</strong>
              <div class="guest-note-meta">${escapeHtml(r.statusKehadiran)} · ${Number(r.jumlahTamu)} tamu</div>
            </div>`
          )
          .join('')
      : '<p>Belum ada konfirmasi kehadiran.</p>';

    el.guestMessages.innerHTML = data.guestbook.length
      ? `<h3>Ucapan &amp; Doa (${data.guestbook.length})</h3>` +
        data.guestbook
          .slice()
          .reverse()
          .map(
            (g) => `<div class="guest-note">
              <strong>${escapeHtml(g.namaAlias)}</strong>
              <p>${escapeHtml(g.ucapan)}</p>
            </div>`
          )
          .join('')
      : '<p>Belum ada ucapan. Jadilah yang pertama memberikan doa restu.</p>';
  }

  function bindImageFallbacks(container) {
    container.querySelectorAll('img').forEach((img) => {
      img.addEventListener(
        'error',
        () => {
          const fallback = createPlaceholder(img.dataset.fallbackLabel || 'Foto');
          if (img.src !== fallback) {
            img.src = fallback;
          }
        },
        { once: true }
      );
    });
  }

  function render(data) {
    const { wedding, config, events, stories, gallery, gifts } = data;
    const akad = events[0];
    const resepsi = events.find((e) => e.id === 'resepsi') || akad;

    document.body.className = `theme-${config.tema || 'classic'}`;
    document.documentElement.style.setProperty('--gold', safeHexColor(config.warnaUtama));
    document.title = `${wedding.namaPria} & ${wedding.namaWanita} — Digital Wedding Invitation`;

    el.coverMan.textContent = wedding.namaPria;
    el.coverWoman.textContent = wedding.namaWanita;
    el.navBrand.textContent = `${wedding.namaPria} & ${wedding.namaWanita}`;
    el.footerNames.textContent = `${wedding.namaPria} & ${wedding.namaWanita}`;
    el.coverDate.textContent = formatIndonesianDate(akad?.tanggal);
    el.openingMessage.textContent = config.pesanPembuka;
    el.coupleDescription.textContent = wedding.deskripsi;

    const coverUrl = safeUrl(config.coverImage);
    el.cover.style.backgroundImage = coverUrl
      ? `linear-gradient(rgba(248, 245, 239, 0.82), rgba(248, 245, 239, 0.92)), url("${coverUrl}")`
      : '';

    // Couple profiles
    el.coupleProfiles.innerHTML = `
      <article class="person">
        <div class="person-frame">
          <img
            src="${escapeHtml(safeUrl(wedding.fotoPria) || createPlaceholder(wedding.namaPria))}"
            alt="Foto ${escapeHtml(wedding.namaPria)}"
            data-fallback-label="${escapeHtml(wedding.namaPria)}"
            referrerpolicy="no-referrer"
            loading="lazy"
          />
        </div>
        <h3>${escapeHtml(wedding.namaPria)}</h3>
        <p>${escapeHtml(wedding.keteranganPria)}</p>
      </article>
      <article class="person">
        <div class="person-frame">
          <img
            src="${escapeHtml(safeUrl(wedding.fotoWanita) || createPlaceholder(wedding.namaWanita))}"
            alt="Foto ${escapeHtml(wedding.namaWanita)}"
            data-fallback-label="${escapeHtml(wedding.namaWanita)}"
            referrerpolicy="no-referrer"
            loading="lazy"
          />
        </div>
        <h3>${escapeHtml(wedding.namaWanita)}</h3>
        <p>${escapeHtml(wedding.keteranganWanita)}</p>
      </article>
    `;
    bindImageFallbacks(el.coupleProfiles);

    // Events & countdown
    el.eventCards.innerHTML = events
      .map(
        (ev) => `<article class="panel">
          <div class="eyebrow">${escapeHtml(ev.namaAcara)}</div>
          <h3>${formatIndonesianDate(ev.tanggal)}</h3>
          <p>${escapeHtml(ev.waktu)} · ${escapeHtml(ev.zonaWaktu)}</p>
          <p><strong>${escapeHtml(ev.lokasi)}</strong><br />${escapeHtml(ev.alamat)}</p>
        </article>`
      )
      .join('');
    updateCountdown(akad?.tanggal, akad?.zonaWaktu);

    // Story timeline
    el.timeline.innerHTML = stories.length
      ? stories
          .map(
            (s) => `<article class="story">
              <time>${escapeHtml(s.tanggal)}</time>
              <div>
                <h3>${escapeHtml(s.judul)}</h3>
                <p>${escapeHtml(s.deskripsi)}</p>
              </div>
            </article>`
          )
          .join('')
      : '<p>Belum ada momen cerita yang ditambahkan.</p>';

    // Gallery
    el.galleryGrid.innerHTML = gallery.length
      ? gallery
          .map(
            (g, index) => `<button
              type="button"
              class="gallery-item"
              data-gallery-index="${index}"
              aria-label="Perbesar foto: ${escapeHtml(g.caption || `Foto ${index + 1}`)}"
            >
              <img
                loading="lazy"
                referrerpolicy="no-referrer"
                data-fallback-label="${escapeHtml(g.caption || 'Foto')}"
                src="${escapeHtml(safeUrl(g.imageUrl) || createPlaceholder(g.caption || 'Foto'))}"
                alt="${escapeHtml(g.caption || `Momen ${index + 1}`)}"
              />
              <span class="gallery-caption">${escapeHtml(g.caption)}</span>
            </button>`
          )
          .join('')
      : '<p>Belum ada foto di galeri.</p>';
    bindImageFallbacks(el.galleryGrid);

    // Location & map
    const mapQuery = resepsi?.alamat || resepsi?.lokasi || '';
    el.locationDetails.innerHTML = `<h3 class="script">${escapeHtml(resepsi?.lokasi || 'Lokasi Acara')}</h3><p>${escapeHtml(resepsi?.alamat || '')}</p>`;
    el.mapsLink.href = safeUrl(resepsi?.mapsUrl) || 'https://www.google.com/maps';
    if (!mapQuery) {
      lastMapQuery = '';
      el.mapBox.innerHTML = '<div class="map-fallback">Alamat lokasi belum diisi.</div>';
    } else if (mapQuery !== lastMapQuery) {
      lastMapQuery = mapQuery;
      el.mapBox.innerHTML = `<iframe title="Peta lokasi acara" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed"></iframe>`;
    }

    // Gifts
    el.giftDetails.innerHTML = gifts.length
      ? gifts
          .map(
            (gift) => `<article class="panel">
              <div class="eyebrow">${escapeHtml(gift.bank)}</div>
              <h3>${escapeHtml(gift.atasNama)}</h3>
              <p class="account-number">${escapeHtml(gift.nomorRekening)}</p>
              <button type="button" class="btn small outline copy-gift" data-account="${escapeHtml(gift.nomorRekening)}" aria-label="Salin nomor rekening ${escapeHtml(gift.bank)} ${escapeHtml(gift.atasNama)}">
                Salin Nomor
              </button>
            </article>`
          )
          .join('')
      : `<article class="panel"><div class="eyebrow">Doa Restu</div><h3>Kehadiran Anda</h3><p>Doa restu dan kehadiran Anda adalah hadiah terbaik bagi kami.</p></article>`;

    renderEntries(data);
    music.syncSource(config.musikUrl);
  }

  el.galleryGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-gallery-index]');
    if (!btn) return;
    const item = store.getState().gallery[Number(btn.dataset.galleryIndex)];
    if (item) lightbox.open(item.imageUrl, item.caption, btn);
  });

  el.giftDetails.addEventListener('click', async (e) => {
    const btn = e.target.closest('.copy-gift');
    if (!btn) return;
    const ok = await copyToClipboard(btn.dataset.account || '');
    showToast(ok ? 'Nomor rekening berhasil disalin.' : 'Gagal menyalin nomor rekening.');
  });

  el.rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nama = safeText(el.rsvpName.value, 60);
    const jumlah = Number(el.rsvpCount.value);
    if (!nama || !Number.isInteger(jumlah) || jumlah < 1 || jumlah > 10) {
      showToast('Periksa nama dan jumlah tamu (1–10).');
      return;
    }

    const entry = {
      id: uid('rsvp'),
      namaAlias: nama,
      statusKehadiran: el.rsvpStatus.value,
      jumlahTamu: jumlah,
      createdAt: new Date().toISOString()
    };

    try {
      const next = await repository.addRsvp(entry, store.getState());
      store.setState(next);
      el.rsvpForm.reset();
      showToast('Konfirmasi kehadiran berhasil disimpan.');
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan RSVP.');
    }
  });

  el.guestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nama = safeText(el.guestName.value, 60);
    const ucapan = safeText(el.guestMessage.value, 500);
    if (!nama || !ucapan) {
      showToast('Nama dan ucapan wajib diisi.');
      return;
    }

    const entry = {
      id: uid('msg'),
      namaAlias: nama,
      ucapan,
      createdAt: new Date().toISOString()
    };

    try {
      const next = await repository.addGuestbook(entry, store.getState());
      store.setState(next);
      el.guestForm.reset();
      showToast('Terima kasih! Ucapan Anda telah ditambahkan.');
    } catch (err) {
      showToast(err.message || 'Gagal mengirim ucapan.');
    }
  });

  store.subscribe(render);
  render(store.getState());
}
