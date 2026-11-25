import { createPlaceholder } from '../core/defaults.js';
import { escapeHtml, safeHexColor, safeText, safeUrl } from '../core/sanitize.js';
import { copyToClipboard, showToast, uid } from '../core/utils.js';
import { mergeWithDefaults, repository } from '../services/repository.js';

export function initAdmin({ store }) {
  const panel = document.getElementById('adminPanel');
  const openBtn = document.getElementById('adminOpen');
  const mobileOpenBtn = document.getElementById('mobileAdminBtn');
  const closeBtn = document.getElementById('adminClose');
  const $ = (id) => document.getElementById(id);

  let draftGallery = [];
  let draftStories = [];
  let draftGifts = [];
  let selectedTheme = 'classic';

  function open() {
    populate();
    panel.hidden = false;
    closeBtn.focus();
  }

  function close() {
    panel.hidden = true;
    openBtn.focus();
  }

  function populate() {
    const data = store.getState();
    const akad = data.events[0] || {};
    const resepsi = data.events.find((e) => e.id === 'resepsi') || akad;

    $('aMan').value = data.wedding.namaPria;
    $('aManOrigin').value = data.wedding.keteranganPria;
    $('aWoman').value = data.wedding.namaWanita;
    $('aWomanOrigin').value = data.wedding.keteranganWanita;
    $('aDescription').value = data.wedding.deskripsi;
    $('aOpening').value = data.config.pesanPembuka;
    $('aColor').value = safeHexColor(data.config.warnaUtama);
    $('aCover').value = data.config.coverImage || '';
    $('aMusic').value = data.config.musikUrl || '';
    $('aManPhoto').value = data.wedding.fotoPria;
    $('aWomanPhoto').value = data.wedding.fotoWanita;

    $('aDate').value = akad.tanggal || '';
    $('aZone').value = akad.zonaWaktu || 'WIB';
    $('aVenue').value = akad.lokasi || '';
    $('aAddress').value = akad.alamat || '';
    $('aMaps').value = akad.mapsUrl || '';
    $('aReceptionDate').value = resepsi.tanggal || '';
    $('aReceptionTime').value = resepsi.waktu || '';

    selectedTheme = data.config.tema || 'classic';
    document.querySelectorAll('.theme-chip').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.theme === selectedTheme);
    });

    draftGallery = structuredClone(data.gallery);
    draftStories = structuredClone(data.stories);
    draftGifts = structuredClone(data.gifts);

    renderGalleryEditor();
    renderStoryEditor();
    renderGiftEditor();
    updateShareUrl();
  }

  function renderGalleryEditor() {
    $('galleryEditor').innerHTML = draftGallery
      .map(
        (g, i) => `<div class="admin-row" data-index="${i}">
          <input aria-label="URL foto ${i + 1}" value="${escapeHtml(g.imageUrl)}" placeholder="URL atau path foto" />
          <input aria-label="Caption foto ${i + 1}" value="${escapeHtml(g.caption)}" placeholder="Caption" />
          <button class="btn small outline remove-photo" type="button" aria-label="Hapus foto ${i + 1}">Hapus</button>
        </div>`
      )
      .join('');
  }

  function renderStoryEditor() {
    $('storyEditor').innerHTML = draftStories
      .map(
        (s, i) => `<div class="panel story-admin-card" data-story="${i}">
          <div class="admin-grid">
            <div class="field"><label>Tahun/Tanggal</label><input value="${escapeHtml(s.tanggal)}" /></div>
            <div class="field"><label>Judul</label><input value="${escapeHtml(s.judul)}" /></div>
          </div>
          <div class="field"><label>Deskripsi</label><textarea>${escapeHtml(s.deskripsi)}</textarea></div>
          <button class="btn small outline remove-story" type="button" aria-label="Hapus momen ${i + 1}">Hapus Momen</button>
        </div>`
      )
      .join('');
  }

  function renderGiftEditor() {
    $('giftEditor').innerHTML = draftGifts
      .map(
        (g, i) => `<div class="admin-row-3" data-gift="${i}">
          <input aria-label="Nama Bank ${i + 1}" value="${escapeHtml(g.bank)}" placeholder="Nama Bank / E-Wallet" />
          <input aria-label="Atas Nama ${i + 1}" value="${escapeHtml(g.atasNama)}" placeholder="Atas Nama" />
          <input aria-label="Nomor Rekening ${i + 1}" value="${escapeHtml(g.nomorRekening)}" placeholder="Nomor Rekening" />
          <button class="btn small outline remove-gift" type="button" aria-label="Hapus rekening ${i + 1}">Hapus</button>
        </div>`
      )
      .join('');
  }

  function updateShareUrl() {
    const base = `${window.location.origin}${window.location.pathname}`;
    const name = safeText($('shareGuestName').value, 60);
    $('shareUrlOutput').value = name ? `${base}?to=${encodeURIComponent(name)}` : base;
  }

  openBtn.addEventListener('click', open);
  mobileOpenBtn?.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  panel.addEventListener('click', (e) => {
    if (e.target === panel) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) close();
  });

  document.querySelectorAll('.theme-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedTheme = btn.dataset.theme;
      document.querySelectorAll('.theme-chip').forEach((b) => b.classList.toggle('active', b === btn));
      document.body.classList.remove('theme-classic', 'theme-floral', 'theme-heritage');
      document.body.classList.add(`theme-${selectedTheme}`);
    });
  });

  $('addPhoto').addEventListener('click', () => {
    draftGallery.push({ id: uid('photo'), imageUrl: createPlaceholder('Foto Baru'), caption: 'Momen baru' });
    renderGalleryEditor();
  });

  $('galleryEditor').addEventListener('click', (e) => {
    if (!e.target.classList.contains('remove-photo')) return;
    draftGallery.splice(Number(e.target.closest('[data-index]').dataset.index), 1);
    renderGalleryEditor();
  });

  $('addStory').addEventListener('click', () => {
    draftStories.push({ id: uid('story'), tanggal: '2027', judul: 'Momen Baru', deskripsi: 'Tambahkan cerita Anda.' });
    renderStoryEditor();
  });

  $('storyEditor').addEventListener('click', (e) => {
    if (!e.target.classList.contains('remove-story')) return;
    draftStories.splice(Number(e.target.closest('[data-story]').dataset.story), 1);
    renderStoryEditor();
  });

  $('addGift').addEventListener('click', () => {
    draftGifts.push({ id: uid('gift'), bank: 'Bank', atasNama: 'Nama Penerima', nomorRekening: '0000 0000 0000' });
    renderGiftEditor();
  });

  $('giftEditor').addEventListener('click', (e) => {
    if (!e.target.classList.contains('remove-gift')) return;
    draftGifts.splice(Number(e.target.closest('[data-gift]').dataset.gift), 1);
    renderGiftEditor();
  });

  $('shareGuestName').addEventListener('input', updateShareUrl);
  $('copyShareUrl').addEventListener('click', async () => {
    const ok = await copyToClipboard($('shareUrlOutput').value);
    showToast(ok ? 'Link undangan tamu berhasil disalin.' : 'Gagal menyalin link.');
  });

  $('saveConfig').addEventListener('click', () => {
    const current = store.getState();
    const galleryRows = [...document.querySelectorAll('#galleryEditor [data-index]')];
    const storyRows = [...document.querySelectorAll('#storyEditor [data-story]')];
    const giftRows = [...document.querySelectorAll('#giftEditor [data-gift]')];

    const updatedGallery = galleryRows.map((row, i) => ({
      id: draftGallery[i]?.id || uid('photo'),
      imageUrl: safeUrl(row.children[0].value) || createPlaceholder('Foto'),
      caption: safeText(row.children[1].value, 80)
    }));

    const updatedStories = storyRows.map((row, i) => {
      const inputs = row.querySelectorAll('input');
      const textarea = row.querySelector('textarea');
      return {
        id: draftStories[i]?.id || uid('story'),
        tanggal: safeText(inputs[0].value, 30),
        judul: safeText(inputs[1].value, 80),
        deskripsi: safeText(textarea.value, 300)
      };
    });

    const updatedGifts = giftRows.map((row, i) => ({
      id: draftGifts[i]?.id || uid('gift'),
      bank: safeText(row.children[0].value, 40),
      atasNama: safeText(row.children[1].value, 60),
      nomorRekening: safeText(row.children[2].value, 40)
    }));

    const zone = $('aZone').value;
    const akadDate = $('aDate').value || current.events[0]?.tanggal;
    const venue = safeText($('aVenue').value, 100);
    const address = safeText($('aAddress').value, 250);
    const mapsUrl = safeUrl($('aMaps').value);

    const akadTime = akadDate
      ? `${new Date(akadDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} ${zone}`
      : `08.00 ${zone}`;

    const nextState = {
      ...current,
      wedding: {
        ...current.wedding,
        namaPria: safeText($('aMan').value, 60) || 'Mempelai Pria',
        keteranganPria: safeText($('aManOrigin').value, 120),
        namaWanita: safeText($('aWoman').value, 60) || 'Mempelai Wanita',
        keteranganWanita: safeText($('aWomanOrigin').value, 120),
        deskripsi: safeText($('aDescription').value, 500),
        fotoPria: safeUrl($('aManPhoto').value) || createPlaceholder('Foto Pria'),
        fotoWanita: safeUrl($('aWomanPhoto').value) || createPlaceholder('Foto Wanita')
      },
      events: [
        {
          id: 'akad',
          namaAcara: 'Akad Nikah',
          tanggal: akadDate,
          waktu: akadTime,
          zonaWaktu: zone,
          lokasi: venue,
          alamat: address,
          mapsUrl
        },
        {
          id: 'resepsi',
          namaAcara: 'Resepsi Pernikahan',
          tanggal: $('aReceptionDate').value || akadDate,
          waktu: safeText($('aReceptionTime').value, 60) || `11.00–14.00 ${zone}`,
          zonaWaktu: zone,
          lokasi: venue,
          alamat: address,
          mapsUrl
        }
      ],
      gallery: updatedGallery,
      stories: updatedStories,
      gifts: updatedGifts,
      config: {
        tema: selectedTheme,
        warnaUtama: safeHexColor($('aColor').value),
        coverImage: safeUrl($('aCover').value),
        musikUrl: safeUrl($('aMusic').value),
        pesanPembuka: safeText($('aOpening').value, 300)
      }
    };

    if (repository.saveLocal(nextState)) {
      store.setState(nextState);
      showToast('Konfigurasi disimpan dan diterapkan.');
      close();
    } else {
      showToast('Penyimpanan gagal. Periksa kapasitas LocalStorage browser.');
    }
  });

  $('exportJson').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(store.getState(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding-config.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('File wedding-config.json berhasil diunduh.');
  });

  $('importJson').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (!parsed.wedding || !parsed.config) throw new Error('Format JSON tidak valid.');
      const normalized = mergeWithDefaults(parsed);
      repository.saveLocal(normalized);
      store.setState(normalized);
      populate();
      showToast('Konfigurasi JSON berhasil dimuat.');
    } catch {
      showToast('File JSON tidak valid atau rusak.');
    } finally {
      e.target.value = '';
    }
  });

  $('resetDemo').addEventListener('click', () => {
    const fresh = repository.reset();
    store.setState(fresh);
    populate();
    showToast('Data default dipulihkan.');
  });
}
