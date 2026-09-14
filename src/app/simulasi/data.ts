/**
 * Paket simulasi gratis: soal contoh yang bisa dikerjakan siapa saja tanpa akun.
 * Isinya sengaja ditulis di berkas ini, bukan di basis data — tidak ada attempt,
 * tidak ada jawaban tersimpan, dan halamannya tidak perlu menyentuh database
 * sama sekali. Simulasi berbayar yang sesungguhnya hidup di katalog /tes.
 */

export type Soal = {
  /** Nama subtes seperti yang dipakai di katalog. */
  subtes: string;
  /** Versi pendek nama subtes, dipakai sebagai label sumbu radar hasil. */
  singkat: string;
  prompt: string;
  opsi: string[];
  /** Indeks jawaban benar di dalam `opsi`. */
  kunci: number;
  pembahasan: string;
};

export type Paket = {
  slug: string;
  nama: string;
  ringkas: string;
  durasiDetik: number;
  soal: Soal[];
};

const campuran: Soal[] = [
  {
    subtes: "Numerik",
    singkat: "Numerik",
    prompt:
      "Sebuah nasabah menabung Rp8.000.000 dengan bunga tunggal 6% per tahun. Berapa saldonya setelah 9 bulan?",
    opsi: ["Rp8.240.000", "Rp8.360.000", "Rp8.480.000", "Rp8.720.000"],
    kunci: 1,
    pembahasan:
      "Bunga setahun 6% × 8.000.000 = 480.000. Untuk 9 bulan: 9/12 × 480.000 = 360.000. Saldo = 8.000.000 + 360.000 = Rp8.360.000.",
  },
  {
    subtes: "Verbal",
    singkat: "Verbal",
    prompt: "SANKSI : PELANGGARAN = ... : ...",
    opsi: [
      "Hadiah : Prestasi",
      "Denda : Pajak",
      "Nilai : Ujian",
      "Obat : Dokter",
    ],
    kunci: 0,
    pembahasan:
      "Sanksi adalah konsekuensi yang diberikan atas pelanggaran. Pola yang sama ada pada hadiah sebagai konsekuensi atas prestasi. Pilihan lain bukan hubungan konsekuensi.",
  },
  {
    subtes: "Logika & Figural",
    singkat: "Logika",
    prompt:
      "Semua teller wajib mengikuti pelatihan APU-PPT. Sebagian peserta pelatihan APU-PPT berasal dari kantor pusat. Kesimpulan yang pasti benar:",
    opsi: [
      "Semua teller berasal dari kantor pusat.",
      "Sebagian teller berasal dari kantor pusat.",
      "Semua teller mengikuti pelatihan APU-PPT.",
      "Tidak ada teller di kantor pusat.",
    ],
    kunci: 2,
    pembahasan:
      "Hanya premis pertama yang bisa disimpulkan ulang secara pasti. Kata 'sebagian' pada premis kedua tidak memberi kepastian apa pun tentang asal kantor para teller.",
  },
  {
    subtes: "Ketelitian",
    singkat: "Ketelitian",
    prompt: "Pasangan nomor rekening berikut mana yang TIDAK identik?",
    opsi: [
      "8820-4471-9036  |  8820-4471-9036",
      "1907-3358-2214  |  1907-3358-2214",
      "5043-6619-7782  |  5043-6691-7782",
      "3376-9028-4415  |  3376-9028-4415",
    ],
    kunci: 2,
    pembahasan:
      "Pada pilihan C blok tengah berbeda: 6619 pada kolom kiri menjadi 6691 pada kolom kanan. Pasangan lainnya sama persis digit per digit.",
  },
  {
    subtes: "Bahasa Inggris",
    singkat: "Inggris",
    prompt:
      "The bank ____ its new mobile app three months ago, and customer complaints have dropped since then.",
    opsi: ["has launched", "launched", "launches", "was launching"],
    kunci: 1,
    pembahasan:
      "Keterangan waktu 'three months ago' menunjuk titik waktu lampau yang selesai, jadi yang dipakai simple past: launched. Present perfect tidak dipakai bersama keterangan waktu lampau yang spesifik.",
  },
  {
    subtes: "Numerik",
    singkat: "Numerik",
    prompt:
      "Sebuah cabang menyalurkan kredit Rp450 juta pada Januari dan Rp540 juta pada Februari. Berapa persen kenaikannya?",
    opsi: ["16%", "18%", "20%", "24%"],
    kunci: 2,
    pembahasan:
      "Kenaikannya 540 − 450 = 90 juta. Dibandingkan angka Januari: 90/450 = 0,2 alias 20%. Pembaginya selalu angka periode awal, bukan periode akhir.",
  },
  {
    subtes: "Verbal",
    singkat: "Verbal",
    prompt: 'Kata yang paling berlawanan makna dengan "likuid" adalah?',
    opsi: ["Lancar", "Beku", "Tunai", "Encer"],
    kunci: 1,
    pembahasan:
      "Dalam konteks keuangan, likuid berarti mudah dicairkan. Lawannya beku: dana yang tidak bisa ditarik atau dipakai. Lancar dan tunai justru searti, encer hanya makna harfiahnya.",
  },
  {
    subtes: "Logika & Figural",
    singkat: "Logika",
    prompt: "Lanjutan deret 3, 6, 11, 18, 27, ... adalah?",
    opsi: ["34", "36", "38", "40"],
    kunci: 2,
    pembahasan:
      "Selisih antarsuku naik sebagai bilangan ganjil: 3, 5, 7, 9. Selisih berikutnya 11, jadi 27 + 11 = 38.",
  },
  {
    subtes: "Ketelitian",
    singkat: "Ketelitian",
    prompt: "Mana pasangan nama dan NIK yang penulisannya TIDAK sama persis?",
    opsi: [
      "RAHMAWATI DEWI · 3174026109910004",
      "BAGUS PRASETYO · 3275011204880012",
      "SITI NURHALIZA · 3671054503950007",
      "ANDI SAPUTRA · 7371060810920031",
    ],
    kunci: 1,
    pembahasan:
      "Pada pilihan B nama tertulis BAGUS PRASETYO sementara pasangan datanya BAGUS PRASTEYO — huruf T dan E tertukar. Sisanya sama persis.",
  },
  {
    subtes: "Bahasa Inggris",
    singkat: "Inggris",
    prompt:
      "Please make sure the report is submitted ____ Friday, otherwise the audit team cannot review it.",
    opsi: ["until", "since", "by", "during"],
    kunci: 2,
    pembahasan:
      "'By' menandai batas waktu paling lambat sebuah pekerjaan selesai. 'Until' dipakai untuk keadaan yang berlangsung sampai satu titik, bukan tenggat penyerahan.",
  },
];

const numerik: Soal[] = [
  {
    subtes: "Numerik",
    singkat: "Deret",
    prompt: "Lanjutan deret 4, 9, 19, 39, 79, ... adalah?",
    opsi: ["139", "149", "159", "169"],
    kunci: 2,
    pembahasan:
      "Tiap suku dikali dua lalu ditambah satu: 4×2+1=9, 9×2+1=19, dan seterusnya. Maka 79×2+1 = 159.",
  },
  {
    subtes: "Numerik",
    singkat: "Persentase",
    prompt:
      "Harga paket layanan turun dari Rp250.000 menjadi Rp200.000. Berapa persen penurunannya?",
    opsi: ["15%", "20%", "25%", "30%"],
    kunci: 1,
    pembahasan:
      "Selisihnya 50.000 dan pembaginya harga awal: 50.000/250.000 = 0,2 alias 20%. Memakai harga akhir sebagai pembagi akan menghasilkan 25% — itu kesalahan yang paling sering muncul.",
  },
  {
    subtes: "Numerik",
    singkat: "Perbandingan",
    prompt:
      "Rasio nasabah tabungan dan deposito di satu cabang 7 : 3. Jika total nasabahnya 1.200, berapa nasabah deposito?",
    opsi: ["300", "360", "420", "480"],
    kunci: 1,
    pembahasan:
      "Jumlah bagian 7+3 = 10, jadi satu bagian bernilai 1.200/10 = 120. Nasabah deposito 3 bagian = 360.",
  },
  {
    subtes: "Numerik",
    singkat: "Bunga",
    prompt:
      "Deposito Rp20.000.000 berbunga 5% per tahun dibayar tiap enam bulan. Berapa bunga yang diterima pada pembayaran pertama?",
    opsi: ["Rp250.000", "Rp500.000", "Rp750.000", "Rp1.000.000"],
    kunci: 1,
    pembahasan:
      "Bunga setahun 5% × 20.000.000 = 1.000.000. Pembayaran pertama menutup setengah tahun: 1.000.000/2 = Rp500.000.",
  },
  {
    subtes: "Numerik",
    singkat: "Rata-rata",
    prompt:
      "Rata-rata transaksi harian satu teller selama 4 hari adalah 60. Berapa transaksi yang harus dilayani di hari kelima agar rata-ratanya menjadi 65?",
    opsi: ["75", "80", "85", "90"],
    kunci: 2,
    pembahasan:
      "Total empat hari 4×60 = 240. Agar rata-rata lima hari 65, totalnya harus 5×65 = 325. Selisihnya 325 − 240 = 85.",
  },
  {
    subtes: "Numerik",
    singkat: "Waktu kerja",
    prompt:
      "Dua petugas menyelesaikan verifikasi berkas dalam 6 jam. Berapa lama jika dikerjakan tiga petugas dengan kecepatan sama?",
    opsi: ["3 jam", "4 jam", "4,5 jam", "5 jam"],
    kunci: 1,
    pembahasan:
      "Total beban kerja 2 petugas × 6 jam = 12 jam-orang. Dibagi tiga petugas: 12/3 = 4 jam. Makin banyak petugas, makin singkat waktunya — berbanding terbalik.",
  },
];

/**
 * Urutannya menentukan urutan kartu di halaman simulasi gratis: paket pengenalan
 * lebih dulu, paket yang lebih sempit fokusnya menyusul.
 */
export const paketSimulasi: Paket[] = [
  {
    slug: "campuran-tes-bank",
    nama: "Campuran tes masuk bank",
    ringkas:
      "Satu soal contoh dari tiap subtes yang biasa muncul di seleksi bank, dua soal per subtes. Cocok untuk mengukur bagian mana yang paling perlu dikejar.",
    durasiDetik: 600,
    soal: campuran,
  },
  {
    slug: "numerik-intensif",
    nama: "Numerik intensif",
    ringkas:
      "Enam soal hitungan yang paling sering muncul: deret, persentase, perbandingan, bunga, rata-rata, dan waktu kerja.",
    durasiDetik: 360,
    soal: numerik,
  },
];

export function getPaket(slug: string) {
  return paketSimulasi.find((p) => p.slug === slug) ?? null;
}

/** Subtes yang diwakili sebuah paket, tanpa pengulangan, untuk label kartu. */
export function daftarSubtes(paket: Paket) {
  return [...new Set(paket.soal.map((s) => s.subtes))];
}
