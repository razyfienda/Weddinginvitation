export function createPlaceholder(label, color = '#e4dccb') {
  const safeLabel = String(label ?? 'Foto').replace(/[<>]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="850" viewBox="0 0 700 850">
    <rect width="700" height="850" fill="${color}"/>
    <circle cx="350" cy="290" r="125" fill="#ffffff55"/>
    <path d="M120 850 Q140 520 350 520 Q560 520 580 850" fill="#ffffff55"/>
    <text x="350" y="760" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#4f4d44">${safeLabel}</text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_DATA = {
  wedding: {
    id: 'wedding-demo',
    namaPria: 'Arka',
    keteranganPria: 'Putra pertama dari Bapak Hendra & Ibu Sari',
    namaWanita: 'Naira',
    keteranganWanita: 'Putri kedua dari Bapak Darmawan & Ibu Ratna',
    fotoPria: '/src/assets/images/groom_portrait_1795590624873.jpg',
    fotoWanita: '/src/assets/images/bride_portrait_1795590625624.jpg',
    deskripsi:
      'Dua perjalanan yang berbeda akhirnya bertemu, tumbuh, dan memilih untuk berjalan bersama dalam ikatan suci pernikahan.'
  },
  events: [
    {
      id: 'akad',
      namaAcara: 'Akad Nikah',
      tanggal: '2027-06-20T08:00',
      waktu: '08.00 WIB',
      zonaWaktu: 'WIB',
      lokasi: 'Pendopo Taman Senja',
      alamat: 'Jl. Kebahagiaan No. 10, Bandung, Jawa Barat',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pendopo+Taman+Senja+Bandung'
    },
    {
      id: 'resepsi',
      namaAcara: 'Resepsi Pernikahan',
      tanggal: '2027-06-20T11:00',
      waktu: '11.00–14.00 WIB',
      zonaWaktu: 'WIB',
      lokasi: 'Pendopo Taman Senja',
      alamat: 'Jl. Kebahagiaan No. 10, Bandung, Jawa Barat',
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pendopo+Taman+Senja+Bandung'
    }
  ],
  gallery: [
    {
      id: 'p1',
      imageUrl: '/src/assets/images/gallery_prewedding_garden_1795590625734.jpg',
      caption: 'Langkah Pertama di Taman'
    },
    {
      id: 'p2',
      imageUrl: '/src/assets/images/wedding_cover_hero_1795590624188.jpg',
      caption: 'Pendopo Taman Senja'
    },
    {
      id: 'p3',
      imageUrl: '/src/assets/images/gallery_rings_detail_1795590625536.jpg',
      caption: 'Janji yang Terikat'
    },
    {
      id: 'p4',
      imageUrl: '/src/assets/images/groom_portrait_1795590624873.jpg',
      caption: 'Arka Pratama'
    },
    {
      id: 'p5',
      imageUrl: '/src/assets/images/bride_portrait_1795590625624.jpg',
      caption: 'Naira Putri'
    },
    {
      id: 'p6',
      imageUrl: createPlaceholder('Momen Bahagia', '#d6ddcf'),
      caption: 'Menuju Hari Istimewa'
    }
  ],
  stories: [
    {
      id: 's1',
      tanggal: '2021',
      judul: 'Pertama Bertemu',
      deskripsi: 'Sebuah pertemuan sederhana menjadi awal cerita yang tidak pernah kami duga.'
    },
    {
      id: 's2',
      tanggal: '2023',
      judul: 'Mulai Melangkah',
      deskripsi: 'Kami belajar saling mengenal, mendukung, dan tumbuh bersama.'
    },
    {
      id: 's3',
      tanggal: '2026',
      judul: 'Satu Tujuan',
      deskripsi: 'Dengan keyakinan dan doa keluarga, kami memutuskan melangkah ke jenjang pernikahan.'
    }
  ],
  gifts: [
    {
      id: 'g1',
      bank: 'BCA',
      atasNama: 'Arka Pratama',
      nomorRekening: '1234 5678 9012'
    },
    {
      id: 'g2',
      bank: 'Mandiri',
      atasNama: 'Naira Putri',
      nomorRekening: '9876 5432 1098'
    }
  ],
  config: {
    tema: 'classic',
    warnaUtama: '#88682e',
    musikUrl: '',
    coverImage: '/src/assets/images/wedding_cover_hero_1795590624188.jpg',
    pesanPembuka:
      'Dengan penuh rasa syukur, kami ingin berbagi kebahagiaan bersama keluarga dan sahabat.'
  },
  rsvps: [],
  guestbook: []
};

export function cloneDefaults() {
  return structuredClone(DEFAULT_DATA);
}
