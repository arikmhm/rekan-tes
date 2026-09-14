"use client";

import {
  ArrowLeft,
  ArrowRight,
  Award,
  CircleCheck,
  CircleDashed,
  CircleX,
  ClipboardList,
  Clock,
  Gauge,
  RotateCcw,
  TrendingUp,
  TriangleAlert,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Paket, Soal } from "../simulasi/data";

import { Donat, Kartu, menitDetik, Sebaran } from "./hasil-ui";

const hairline = "border-[#105C78]/20";

const HURUF = ["A", "B", "C", "D"];

/**
 * Satu sesi simulasi gratis, mengisi seluruh halaman. Semua state hidup di
 * memori peramban: tidak ada attempt, tidak ada jawaban terkirim, tidak ada
 * yang menyentuh basis data. Paketnya datang dari props, sehingga rute yang
 * sama melayani berapa pun jenis simulasi gratis.
 */
export function SesiSimulasi({ paket }: { paket: Paket }) {
  const soal = paket.soal;
  const DURASI = paket.durasiDetik;

  const [nomor, setNomor] = useState(0);
  const [jawaban, setJawaban] = useState<(number | null)[]>(() =>
    Array(soal.length).fill(null),
  );
  const [dikirim, setDikirim] = useState(false);
  const [sisa, setSisa] = useState(DURASI);
  const [waktuSoal, setWaktuSoal] = useState<number[]>(() =>
    Array(soal.length).fill(0),
  );

  // Penanda kapan soal yang sedang dibuka mulai dilihat. Dipakai untuk mengisi
  // waktuSoal setiap kali peserta berpindah — tanpa ini peta kecepatan di layar
  // hasil tidak punya bahan.
  const masuk = useRef(0);
  const dialogKirim = useRef<HTMLDialogElement>(null);

  // Jam mulai dipasang setelah sesi terpasang, bukan saat render: membaca jam
  // di badan komponen membuat hasil render bergantung pada waktu.
  useEffect(() => {
    masuk.current = Date.now();
  }, []);

  function catatWaktu() {
    const detik = Math.round((Date.now() - masuk.current) / 1000);
    masuk.current = Date.now();
    setWaktuSoal((w) => w.map((v, i) => (i === nomor ? v + detik : v)));
  }

  function pindah(i: number) {
    catatWaktu();
    setNomor(i);
  }

  function kirim() {
    catatWaktu();
    setDikirim(true);
  }

  // Waktu habis mengunci sesi sama seperti pengerjaan sungguhan, jadi statusnya
  // diturunkan dari sisa waktu — bukan disalin ke state lain lewat efek.
  const selesai = dikirim || sisa === 0;

  useEffect(() => {
    if (selesai) return;
    const tik = setInterval(() => setSisa((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(tik);
  }, [selesai]);

  function pilih(i: number) {
    setJawaban((j) => j.map((v, k) => (k === nomor ? i : v)));
  }

  function ulangi() {
    setJawaban(Array(soal.length).fill(null));
    setWaktuSoal(Array(soal.length).fill(0));
    masuk.current = Date.now();
    setNomor(0);
    setSisa(DURASI);
    setDikirim(false);
  }

  const benar = jawaban.filter((j, i) => j === soal[i].kunci).length;
  const kosong = jawaban.filter((j) => j === null).length;
  const s = soal[nomor];

  const terjawab = jawaban.filter((j) => j !== null).length;

  return (
    <div className="flex flex-1 flex-col">
      {/* Konfirmasi kirim memakai <dialog> bawaan peramban: modalitas, jebakan
          fokus, dan tombol Esc datang dari platform. Ditaruh di luar <main>
          supaya tidak ikut tersapu saat isi berganti ke layar hasil. */}
      <dialog
        ref={dialogKirim}
        aria-labelledby="judul-kirim"
        className={`m-auto w-[min(26rem,calc(100vw-2.5rem))] rounded-2xl border ${hairline} bg-white p-0 text-brand shadow-[0_24px_60px_rgba(16,92,120,0.22)] backdrop:bg-brand/40`}
      >
        <div className="p-6 sm:p-7">
          <h2
            id="judul-kirim"
            className="text-xl font-medium tracking-[-0.01em] text-brand"
          >
            Kirim jawaban sekarang?
          </h2>
          <p className="mt-2 text-sm leading-6 font-normal text-brand/70">
            Setelah dikirim, jawaban tidak bisa diubah lagi dan skor beserta
            pembahasannya langsung terbuka.
          </p>

          <dl
            className={`mt-5 flex flex-wrap gap-x-6 gap-y-2 border-y ${hairline} py-4 text-sm font-normal text-brand/70`}
          >
            <div className="flex items-center gap-2">
              <dt>Terjawab</dt>
              <dd className="font-medium text-brand">
                {terjawab} dari {soal.length}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt>Sisa waktu</dt>
              <dd className="font-mono font-medium text-brand tabular-nums">
                {menitDetik(sisa)}
              </dd>
            </div>
          </dl>

          {kosong > 0 && (
            <p className="mt-4 flex items-start gap-2 text-xs leading-5 font-normal text-brand/60">
              <TriangleAlert
                className="mt-0.5 size-4 shrink-0 text-brand-orange"
                aria-hidden
              />
              Masih ada {kosong} soal kosong. Soal kosong dihitung nol.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row-reverse">
            <button
              type="button"
              onClick={() => {
                dialogKirim.current?.close();
                kirim();
              }}
              className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-orange px-5 text-sm font-normal text-white transition-colors hover:bg-brand"
            >
              Ya, kirim
              <ArrowRight className="size-4" aria-hidden />
            </button>
            <form method="dialog" className="flex-1">
              <button
                type="submit"
                className={`h-11 w-full cursor-pointer rounded-lg border ${hairline} text-sm font-normal text-brand transition-colors hover:bg-brand hover:text-white`}
              >
                Periksa lagi
              </button>
            </form>
          </div>
        </div>
      </dialog>

      {/* Header menempel seperti aplikasi ujian sungguhan: identitas sesi dan
          sisa waktu tidak boleh ikut tergulir bersama soal. */}
      <header
        className={`sticky top-0 z-10 border-b ${hairline} bg-white/95 backdrop-blur`}
      >
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 text-sm font-semibold tracking-tight text-brand">
              Rekan Tes
            </span>
            {/* Judul sesi dilepas di layar sempit: berebut tempat dengan nama
                situs dan hitung mundur, dan ketiganya jadi terpotong semua. */}
            <span
              className="hidden h-4 w-px bg-brand/20 sm:block"
              aria-hidden
            />
            <p className="hidden truncate text-sm font-normal text-brand/70 sm:block">
              Simulasi gratis · {paket.nama}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              role="timer"
              aria-live="off"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 font-mono text-sm font-medium tabular-nums text-white"
            >
              <Clock className="size-4" aria-hidden />
              {menitDetik(sisa)}
            </span>
            <Link
              href={`/simulasi/${paket.slug}`}
              aria-label="Keluar dari simulasi"
              className={`grid size-9 shrink-0 place-items-center rounded-lg border ${hairline} text-brand transition-colors hover:bg-brand hover:text-white`}
            >
              <X className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-8 sm:py-8">
        {selesai ? (
          <Hasil
            soal={soal}
            durasi={DURASI}
            jawaban={jawaban}
            waktuSoal={waktuSoal}
            terpakai={DURASI - sisa}
            benar={benar}
            kosong={kosong}
            onUlangi={ulangi}
          />
        ) : (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div
              className={`flex-1 rounded-xl border ${hairline} bg-white p-5 sm:p-7`}
            >
              <p className="text-xs font-medium text-brand/60">
                Soal {nomor + 1} dari {soal.length} · {s.subtes}
              </p>
              <p className="mt-3 text-base leading-7 font-normal text-brand sm:text-lg sm:leading-8">
                {s.prompt}
              </p>

              <div className="mt-6 space-y-2.5">
                {s.opsi.map((teks, i) => {
                  const aktif = jawaban[nomor] === i;
                  return (
                    <button
                      key={teks}
                      type="button"
                      onClick={() => pilih(i)}
                      aria-pressed={aktif}
                      className={`flex w-full items-start gap-3 rounded-lg border p-3.5 text-left transition-colors ${
                        aktif
                          ? "border-brand bg-brand/5"
                          : `${hairline} bg-white hover:border-brand/40`
                      }`}
                    >
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium ${
                          aktif
                            ? "bg-brand text-white"
                            : "border border-brand/30 text-brand/50"
                        }`}
                      >
                        {HURUF[i]}
                      </span>
                      <span className="text-sm leading-6 font-normal text-brand">
                        {teks}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Kendali perpindahan menempel di bawah soalnya sendiri, sejalan
                  dengan arah baca: baca soal, pilih jawaban, lanjut. */}
              <div
                className={`mt-7 flex items-center justify-between border-t ${hairline} pt-5`}
              >
                <button
                  type="button"
                  onClick={() => pindah(nomor - 1)}
                  disabled={nomor === 0}
                  className={`inline-flex h-10 items-center gap-2 rounded-lg border ${hairline} px-4 text-sm font-normal text-brand transition-colors hover:bg-brand hover:text-white disabled:pointer-events-none disabled:opacity-40`}
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={() => pindah(nomor + 1)}
                  disabled={nomor === soal.length - 1}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-normal text-white transition-colors hover:bg-brand-orange disabled:pointer-events-none disabled:opacity-40"
                >
                  Berikutnya
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </div>
            </div>

            <Navigasi
              jawaban={jawaban}
              nomor={nomor}
              onPilihSoal={pindah}
              onKirim={() => dialogKirim.current?.showModal()}
            />
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Peta soal di sisi kanan: nomor mana yang sudah dijawab, mana yang dilewati,
 * dan mana yang sedang dibuka — plus jalan pintas melompat ke soal mana pun.
 * Statusnya tidak hanya dibedakan lewat warna, karena warna saja tak terbaca
 * pembaca layar maupun mata yang sulit membedakannya.
 */
function Navigasi({
  jawaban,
  nomor,
  onPilihSoal,
  onKirim,
}: {
  jawaban: (number | null)[];
  nomor: number;
  onPilihSoal: (i: number) => void;
  onKirim: () => void;
}) {
  const terjawab = jawaban.filter((j) => j !== null).length;

  return (
    <aside
      aria-label="Navigasi soal"
      className={`shrink-0 rounded-xl border ${hairline} bg-white p-5 lg:sticky lg:top-8 lg:w-72`}
    >
      <p className="text-xs font-medium text-brand/60">Navigasi soal</p>
      <p className="mt-1 text-sm font-medium text-brand">
        Soal {nomor + 1} dari {jawaban.length}
      </p>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {jawaban.map((j, i) => {
          const aktif = i === nomor;
          const dijawab = j !== null;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onPilihSoal(i)}
              aria-current={aktif ? "step" : undefined}
              aria-label={`Soal ${i + 1}, ${dijawab ? "sudah dijawab" : "belum dijawab"}`}
              className={`grid aspect-square place-items-center rounded-lg border text-sm font-medium transition-colors ${
                aktif
                  ? "border-brand-orange bg-brand-orange text-white"
                  : dijawab
                    ? "border-brand bg-brand text-white hover:bg-brand-dark"
                    : `${hairline} bg-white text-brand/50 hover:border-brand/40`
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs font-normal text-brand/60">
        <span className="font-medium text-brand">{terjawab}</span> dari{" "}
        {jawaban.length} soal terjawab
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand/12">
        <div
          className="h-full rounded-full bg-brand transition-[width]"
          style={{ width: `${(terjawab / jawaban.length) * 100}%` }}
        />
      </div>

      <ul className={`mt-4 space-y-1.5 border-t ${hairline} pt-4`}>
        {[
          ["bg-brand-orange", "Sedang dibuka"],
          ["bg-brand", "Sudah dijawab"],
          [`border ${hairline} bg-white`, "Belum dijawab"],
        ].map(([kelas, teks]) => (
          <li
            key={teks}
            className="flex items-center gap-2 text-xs font-normal text-brand/60"
          >
            <span
              className={`size-3 shrink-0 rounded-sm ${kelas}`}
              aria-hidden
            />
            {teks}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onKirim}
        className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-orange text-sm font-normal text-white transition-colors hover:bg-brand"
      >
        Kirim jawaban
        <ArrowRight className="size-4" aria-hidden />
      </button>
      <p className="mt-2 text-center text-xs font-normal text-brand/50">
        Soal kosong dihitung nol.
      </p>
    </aside>
  );
}

/**
 * Layar hasil: ringkasan di atas, lalu peta kecepatan yang menyetir panel
 * pembahasan di sebelahnya, dan hitungan benar-salah-kosong sebagai penutup.
 * Semua angkanya dihitung ulang dari jawaban dan waktu yang tercatat di sesi —
 * tidak ada yang disimpan ke mana pun.
 */
function Hasil({
  soal,
  durasi,
  jawaban,
  waktuSoal,
  terpakai,
  benar,
  kosong,
  onUlangi,
}: {
  soal: Soal[];
  durasi: number;
  jawaban: (number | null)[];
  waktuSoal: number[];
  terpakai: number;
  benar: number;
  kosong: number;
  onUlangi: () => void;
}) {
  const [dilihat, setDilihat] = useState(0);

  const salah = soal.length - benar - kosong;
  const akurasi = Math.round((benar / soal.length) * 100);
  const idealPerSoal = Math.round(durasi / soal.length);
  const rataPerSoal = Math.round(terpakai / soal.length);

  const perSubtes = ringkasSubtes(soal, jawaban);
  // Subtes dengan persentase terendah jadi bahan rekomendasi. Kalau seri, yang
  // pertama muncul di urutan soal yang dipilih — bukan hasil acak.
  const terlemah = perSubtes.reduce((a, b) => (b.persen < a.persen ? b : a));

  const s = soal[dilihat];
  const pilihan = jawaban[dilihat];

  return (
    <div className="space-y-4 pb-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Kartu judul="Skor akurasi" Ikon={Award} tanda="Sesi selesai">
          <div className="mt-6 flex flex-col items-center">
            <Donat persen={akurasi} angka={benar} dari={soal.length} />
          </div>

          <dl className={`mt-6 divide-y ${hairline} border-y ${hairline}`}>
            {[
              [CircleCheck, "Benar", benar, "text-brand"],
              [CircleX, "Salah", salah, "text-brand-orange"],
              [CircleDashed, "Kosong", kosong, "text-brand/40"],
            ].map(([Ikon, label, nilai, warna]) => {
              const Komponen = Ikon as typeof CircleCheck;

              return (
                <div
                  key={label as string}
                  className="flex items-center gap-3 py-3"
                >
                  <Komponen
                    className={`size-5 shrink-0 ${warna as string}`}
                    aria-hidden
                  />
                  <dt className="flex-1 text-sm font-normal text-brand/60">
                    {label as string}
                  </dt>
                  <dd className="text-lg font-medium text-brand">
                    {nilai as number}
                  </dd>
                </div>
              );
            })}
          </dl>

          <p
            className={`mt-6 rounded-xl px-4 py-3 text-center text-xs leading-5 font-normal ${
              akurasi >= 70
                ? "bg-mint text-brand-dark"
                : "bg-brand-orange/12 text-brand-orange"
            }`}
          >
            <span className="block font-medium">
              {akurasi >= 70 ? "Sudah kuat" : "Butuh latihan"}
            </span>
            {akurasi >= 70
              ? "Pertahankan ritmenya dan rapikan subtes yang masih tertinggal."
              : "Peluang berkembang masih lebar. Mulai dari pembahasan soal yang salah."}
          </p>
        </Kartu>

        <Kartu
          judul="Waktu & efisiensi"
          Ikon={Clock}
          tanda={`dari ${menitDetik(durasi)}`}
        >
          <p className="mt-6 text-center font-mono text-4xl font-medium tabular-nums text-brand">
            {menitDetik(terpakai)}
          </p>
          <p className="mt-2 text-center text-xs font-normal text-brand/60">
            Rata-rata {rataPerSoal} detik per soal · ideal {idealPerSoal} detik
          </p>
          <p className="mt-6 rounded-xl bg-cream px-4 py-3 text-xs leading-5 font-normal text-brand/70">
            <span className="block font-medium text-brand">
              {rataPerSoal < idealPerSoal / 2
                ? "Terburu-buru"
                : rataPerSoal > idealPerSoal
                  ? "Melebihi tempo"
                  : "Tempo terjaga"}
            </span>
            {rataPerSoal < idealPerSoal / 2
              ? "Jauh lebih cepat dari jatah waktunya. Periksa ulang sebelum berpindah soal."
              : rataPerSoal > idealPerSoal
                ? "Melewati jatah per soal. Lewati dulu yang berat, kembali kalau masih ada waktu."
                : "Kecepatanmu pas dengan jatah waktu tiap soal. Pertahankan."}
          </p>
        </Kartu>

        <Kartu judul="Analisis subtes" Ikon={TrendingUp} tanda="Saran">
          <Sebaran
            data={perSubtes.map((x) => ({
              subtes: x.singkat,
              nilai: x.persen,
            }))}
          />
          <p className="mt-4 rounded-xl bg-cream px-4 py-3 text-xs leading-5 font-normal text-brand/70">
            <span className="block font-medium text-brand">
              Fokus berikutnya
            </span>
            Nilai terendah ada di{" "}
            <strong className="font-medium">{terlemah.nama}</strong> (
            {terlemah.benar}/{terlemah.total} · {terlemah.persen}%). Ulangi sesi
            ini setelah membaca pembahasan subtes tersebut.
          </p>
        </Kartu>

        <Kartu judul="Peta kecepatan soal" Ikon={Gauge} kelas="lg:self-start">
          <p className="mt-4 text-xs leading-5 font-normal text-brand/60">
            Klik nomor soal untuk membuka pembahasannya. Warna menunjukkan
            ketepatan, angka di bawahnya lama pengerjaan.
          </p>

          <div className="mt-5 grid grid-cols-5 gap-2">
            {soal.map((q, i) => {
              const tepat = jawaban[i] === q.kunci;
              const cepat = waktuSoal[i] <= idealPerSoal;
              const status = laraSoal(jawaban[i], tepat, cepat);

              return (
                <button
                  key={q.prompt}
                  type="button"
                  onClick={() => setDilihat(i)}
                  aria-current={i === dilihat ? "true" : undefined}
                  aria-label={`Soal ${i + 1}, ${status.label}, ${waktuSoal[i]} detik`}
                  className={`rounded-lg border py-1.5 text-center transition-colors ${status.kelas} ${
                    i === dilihat
                      ? "ring-2 ring-brand-orange ring-offset-1"
                      : ""
                  }`}
                >
                  <span className="block text-sm font-medium">{i + 1}</span>
                  <span className="block font-mono text-[10px] opacity-70">
                    {waktuSoal[i]}s
                  </span>
                </button>
              );
            })}
          </div>

          <ul
            className={`mt-6 grid grid-cols-2 gap-2 border-t ${hairline} pt-5`}
          >
            {KETERANGAN.map(([kelas, teks]) => (
              <li
                key={teks}
                className="flex items-center gap-2 text-xs font-normal text-brand/60"
              >
                <span
                  className={`size-3 shrink-0 rounded-sm border ${kelas}`}
                  aria-hidden
                />
                {teks}
              </li>
            ))}
          </ul>
        </Kartu>

        <Kartu
          judul={`Pembahasan soal ${dilihat + 1}`}
          Ikon={ClipboardList}
          tanda={`${waktuSoal[dilihat]} detik · ideal ${idealPerSoal} detik`}
          kelas="lg:col-span-2"
        >
          <p className="mt-4 text-xs font-medium text-brand/60">
            {s.subtes} ·{" "}
            {pilihan === null
              ? "tidak dijawab"
              : pilihan === s.kunci
                ? "jawabanmu benar"
                : "jawabanmu salah"}
          </p>
          <div className={`mt-3 rounded-xl border ${hairline} bg-cream/60 p-5`}>
            <p className="text-base leading-7 font-normal text-brand">
              {s.prompt}
            </p>
          </div>

          <ul className="mt-4 space-y-2">
            {s.opsi.map((teks, k) => {
              const dipilih = k === pilihan;
              const kunci = k === s.kunci;

              return (
                <li
                  key={teks}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm ${
                    kunci
                      ? "border-brand/40 bg-mint/60"
                      : dipilih
                        ? "border-red-200 bg-red-50"
                        : hairline
                  }`}
                >
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-md text-xs font-medium ${
                      kunci
                        ? "bg-brand text-white"
                        : dipilih
                          ? "bg-red-100 text-red-700"
                          : "bg-cream text-brand/60"
                    }`}
                  >
                    {HURUF[k]}
                  </span>
                  <span className="flex-1 leading-6 font-normal text-brand">
                    {teks}
                  </span>
                  <span className="shrink-0 text-xs font-medium text-brand/60">
                    {kunci && "kunci"}
                    {dipilih && !kunci && "pilihanmu"}
                    {dipilih && kunci && " · pilihanmu"}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className={`mt-5 rounded-xl border ${hairline} bg-white p-5`}>
            <p className="text-xs font-medium text-brand/60">Pembahasan</p>
            <p className="mt-2 text-sm leading-7 font-normal text-brand">
              {s.pembahasan}
            </p>
          </div>
        </Kartu>
      </div>

      <div
        className={`flex flex-col gap-2.5 border-t ${hairline} pt-5 sm:flex-row`}
      >
        <Link
          href="/tes"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-normal text-white transition-colors hover:bg-brand-orange"
        >
          Lihat katalog simulasi
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={onUlangi}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border ${hairline} px-5 text-sm font-normal text-brand transition-colors hover:bg-brand hover:text-white`}
        >
          <RotateCcw className="size-4" aria-hidden />
          Ulangi sesi
        </button>
        <p className="text-xs leading-[2.75rem] font-normal text-brand/50 sm:ml-auto">
          Contoh tampilan hasil. Di simulasi berbayar skor dihitung berbobot dan
          riwayatnya tersimpan di akunmu.
        </p>
      </div>
    </div>
  );
}

/** Warna dan label satu kotak di peta kecepatan. */
function laraSoal(jawab: number | null, tepat: boolean, cepat: boolean) {
  if (jawab === null)
    return { label: "kosong", kelas: `${hairline} bg-white text-brand/40` };
  if (tepat && cepat)
    return {
      label: "benar & cepat",
      kelas: "border-brand bg-brand text-white",
    };
  if (tepat)
    return {
      label: "benar & lambat",
      kelas: "border-brand/30 bg-mint text-brand-dark",
    };
  if (cepat)
    return {
      label: "salah & cepat",
      kelas: "border-brand-orange bg-brand-orange text-white",
    };
  return {
    label: "salah & lambat",
    kelas: "border-brand-orange/40 bg-brand-orange/15 text-brand-orange",
  };
}

const KETERANGAN: [string, string][] = [
  ["border-brand bg-brand", "Benar & cepat"],
  ["border-brand/30 bg-mint", "Benar & lambat"],
  ["border-brand-orange bg-brand-orange", "Salah & cepat"],
  ["border-brand-orange/40 bg-brand-orange/15", "Salah & lambat"],
];

/** Benar dan total tiap subtes, dipakai radar sekaligus kalimat rekomendasi. */
function ringkasSubtes(soal: Soal[], jawaban: (number | null)[]) {
  const per = new Map<
    string,
    { nama: string; singkat: string; benar: number; total: number }
  >();

  soal.forEach((s, i) => {
    const catatan = per.get(s.singkat) ?? {
      nama: s.subtes,
      singkat: s.singkat,
      benar: 0,
      total: 0,
    };
    catatan.total += 1;
    if (jawaban[i] === s.kunci) catatan.benar += 1;
    per.set(s.singkat, catatan);
  });

  return [...per.values()].map((c) => ({
    ...c,
    persen: Math.round((c.benar / c.total) * 100),
  }));
}
