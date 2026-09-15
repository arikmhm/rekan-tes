"use client";

import { CheckIcon, FileJson, PencilLine, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";

import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/reui/stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";
import { createQuestions } from "@/lib/admin";
import {
  bacaJson,
  CONTOH_JSON,
  type HasilBaca,
  masalahSoal,
  type SoalBaru,
} from "@/lib/question-import";
import { OPTION_LABELS, OPTION_SLOTS } from "@/lib/question-input";

import { FormError } from "../../_components/shell";

type Kategori = { id: string; code: string; name: string };

/**
 * Bentuk yang disunting di layar: pilihan selalu lima slot agar kunci jawaban
 * dapat menunjuk slot yang tetap, tidak bergeser saat slot kosong dibuang.
 */
type Draf = {
  kunci: string;
  categoryId: string;
  difficulty: string;
  prompt: string;
  explanation: string;
  opsi: string[];
  benar: number;
};

const DIFFICULTY = ["easy", "medium", "hard"];

function drafKosong(categoryId: string): Draf {
  return {
    kunci: crypto.randomUUID(),
    categoryId,
    difficulty: "medium",
    prompt: "",
    explanation: "",
    opsi: Array.from({ length: OPTION_SLOTS }, () => ""),
    benar: 0,
  };
}

function dariSoal(s: SoalBaru): Draf {
  return {
    kunci: crypto.randomUUID(),
    categoryId: s.categoryId,
    difficulty: s.difficulty,
    prompt: s.prompt,
    explanation: s.explanation,
    opsi: Array.from({ length: OPTION_SLOTS }, (_, i) => s.options[i]?.content ?? ""),
    benar: Math.max(0, s.options.findIndex((o) => o.isCorrect)),
  };
}

/** Slot kosong dibuang dan posisi dirapatkan, sama seperti formulir satuan. */
function keSoal(d: Draf): SoalBaru {
  const terisi = d.opsi
    .map((content, slot) => ({ content: content.trim(), slot }))
    .filter((o) => o.content !== "");

  return {
    categoryId: d.categoryId,
    prompt: d.prompt.trim(),
    explanation: d.explanation.trim(),
    difficulty: d.difficulty as SoalBaru["difficulty"],
    options: terisi.map((o) => ({ content: o.content, isCorrect: o.slot === d.benar })),
  };
}

/**
 * Pembuatan soal dua langkah: memilih sumber dulu, lalu memeriksa dan menyimpan
 * seluruh daftar sekaligus. Impor JSON dan tulis manual bertemu di daftar yang
 * sama, sehingga pratinjau dan penyimpanannya cuma satu jalur.
 */
export function PembuatSoal({ kategori }: { kategori: Kategori[] }) {
  const [langkah, setLangkah] = useState(1);
  const [daftar, setDaftar] = useState<Draf[]>([]);
  /** Baris JSON yang ditolak; ditampilkan di kedua langkah agar tidak hilang. */
  const [tolakan, setTolakan] = useState<string[]>([]);
  const [status, setStatus] = useState("draft");
  const [galat, setGalat] = useState<string | null>(null);
  const [pending, mulai] = useTransition();

  const kodeKeId = new Map(kategori.map((k) => [k.code.toUpperCase(), k.id]));
  const masalah = daftar.map((d) => masalahSoal(keSoal(d)));
  const siap = daftar.length > 0 && masalah.every((m) => m === null);

  function tambah(baru: Draf[]) {
    setDaftar((lama) => [...lama, ...baru]);
    setLangkah(2);
  }

  function terimaJson(hasil: HasilBaca) {
    setTolakan(hasil.galat);
    if (hasil.soal.length > 0) tambah(hasil.soal.map(dariSoal));
  }

  function simpan() {
    setGalat(null);
    mulai(async () => {
      const pesan = await createQuestions(daftar.map(keSoal), status);
      if (pesan) setGalat(pesan);
    });
  }

  return (
    <Stepper
      value={langkah}
      onValueChange={setLangkah}
      className="space-y-8"
      indicators={{ completed: <CheckIcon className="size-3.5" /> }}
    >
      <div className="flex justify-center">
        <StepperNav className="max-w-md">
          <StepperItem step={1} className="relative flex-1 items-start">
            <StepperTrigger className="flex flex-col gap-2.5">
              <StepperIndicator>1</StepperIndicator>
              <StepperTitle>Sumber soal</StepperTitle>
            </StepperTrigger>
            <StepperSeparator className="group-data-[state=completed]/step:bg-primary absolute inset-x-0 top-3 left-[calc(50%+0.875rem)] m-0 group-data-[orientation=horizontal]/stepper-nav:w-[calc(100%-2rem+0.225rem)] group-data-[orientation=horizontal]/stepper-nav:flex-none" />
          </StepperItem>
          <StepperItem step={2} disabled={daftar.length === 0} className="relative flex-1 items-start">
            <StepperTrigger className="flex flex-col gap-2.5">
              <StepperIndicator>2</StepperIndicator>
              <StepperTitle>Periksa &amp; simpan</StepperTitle>
            </StepperTrigger>
          </StepperItem>
        </StepperNav>
      </div>

      {/* Kolom minmax(0,1fr): tanpa itu lebar kolom ikut isi terpanjang, dan
          satu ringkasan soal yang panjang menarik halaman melewati tepi layar
          ponsel. */}
      <StepperPanel>
        <StepperContent value={1} className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
          <SumberJson kategori={kodeKeId} tolakan={tolakan} onBaca={terimaJson} />
          <SumberManual
            kategori={kategori}
            onTulis={(categoryId) => tambah([drafKosong(categoryId)])}
          />
        </StepperContent>

        <StepperContent value={2} className="grid grid-cols-[minmax(0,1fr)] gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-medium">{daftar.length} soal dalam daftar</p>
              <p className="text-muted-foreground text-sm">
                {siap
                  ? "Semuanya lengkap dan siap disimpan."
                  : "Soal bertanda merah masih perlu dilengkapi."}
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="grid w-36 gap-2">
                <Label htmlFor="status-massal">Simpan sebagai</Label>
                <SelectNative
                  id="status-massal"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                </SelectNative>
              </div>
              <Button onClick={simpan} disabled={!siap || pending}>
                {pending ? "Menyimpan…" : `Simpan ${daftar.length} soal`}
              </Button>
            </div>
          </div>

          <FormError message={galat} />
          <DaftarTolakan tolakan={tolakan} />

          {daftar.map((d, index) => (
            <KartuDraf
              key={d.kunci}
              draf={d}
              nomor={index + 1}
              masalah={masalah[index]}
              kategori={kategori}
              onUbah={(baru) =>
                setDaftar((lama) => lama.map((x) => (x.kunci === d.kunci ? baru : x)))
              }
              onHapus={() => setDaftar((lama) => lama.filter((x) => x.kunci !== d.kunci))}
            />
          ))}

          <div>
            <Button
              variant="outline"
              onClick={() => setDaftar((lama) => [...lama, drafKosong(kategori[0].id)])}
            >
              <Plus />
              Tambah soal
            </Button>
          </div>
        </StepperContent>
      </StepperPanel>
    </Stepper>
  );
}

/** Baris JSON yang tidak jadi soal. Diam-diam menghilang jauh lebih buruk. */
function DaftarTolakan({ tolakan }: { tolakan: string[] }) {
  if (tolakan.length === 0) return null;

  return (
    <div className="border-destructive/30 bg-destructive/5 grid gap-1 rounded-lg border p-3 text-sm">
      <p className="font-medium">{tolakan.length} baris JSON tidak terbaca:</p>
      <ul className="text-destructive grid gap-1">
        {tolakan.map((g) => (
          <li key={g}>{g}</li>
        ))}
      </ul>
    </div>
  );
}

/** Tempel teks atau pilih berkas; keduanya berujung pada parser yang sama. */
function SumberJson({
  kategori,
  tolakan,
  onBaca,
}: {
  kategori: Map<string, string>;
  tolakan: string[];
  onBaca: (hasil: HasilBaca) => void;
}) {
  const [teks, setTeks] = useState("");

  function baca(isi: string) {
    onBaca(bacaJson(isi, kategori));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileJson className="size-4" />
          Dari JSON
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Tempel keluaran AI atau pilih berkas. Soal yang terbaca langsung muncul di langkah
          pratinjau, dan masih bisa disunting di sana.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Textarea
          rows={8}
          value={teks}
          onChange={(e) => setTeks(e.target.value)}
          placeholder={CONTOH_JSON}
          className="font-mono text-xs"
        />
        <DaftarTolakan tolakan={tolakan} />
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => baca(teks)} disabled={teks.trim() === ""}>
            Baca JSON
          </Button>
          <Input
            type="file"
            accept=".json,application/json"
            className="w-auto"
            onChange={async (e) => {
              const berkas = e.target.files?.[0];
              if (!berkas) return;
              const isi = await berkas.text();
              setTeks(isi);
              baca(isi);
            }}
          />
        </div>
        <details className="text-muted-foreground text-sm">
          <summary className="cursor-pointer">Format yang diminta</summary>
          <p className="mt-2">
            <code className="font-mono">kategori</code> memakai kode kategori yang sudah ada,{" "}
            <code className="font-mono">benar</code> boleh huruf (&quot;C&quot;) maupun nomor urut (3).
          </p>
          <pre className="bg-muted mt-2 overflow-x-auto rounded-lg p-3 font-mono text-xs">
            {CONTOH_JSON}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}

function SumberManual({
  kategori,
  onTulis,
}: {
  kategori: Kategori[];
  onTulis: (categoryId: string) => void;
}) {
  const [categoryId, setCategoryId] = useState(kategori[0].id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PencilLine className="size-4" />
          Tulis manual
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Mulai dari satu soal kosong, lalu tambah sebanyak yang dibutuhkan di langkah berikutnya.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-2">
          <Label htmlFor="kategori-awal">Kategori awal</Label>
          <SelectNative
            id="kategori-awal"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            {kategori.map((k) => (
              <option key={k.id} value={k.id}>
                {k.code} — {k.name}
              </option>
            ))}
          </SelectNative>
        </div>
        <div>
          <Button variant="outline" onClick={() => onTulis(categoryId)}>
            Mulai menulis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Satu soal dalam daftar. Terbuka sendiri saat masih bermasalah supaya yang
 * perlu dikerjakan tidak bersembunyi di balik ringkasan.
 *
 * ponytail: seluruh daftar dirender ulang setiap ketikan. Bungkus dengan memo
 * bila mengetik pada daftar panjang mulai terasa tersendat.
 */
function KartuDraf({
  draf,
  nomor,
  masalah,
  kategori,
  onUbah,
  onHapus,
}: {
  draf: Draf;
  nomor: number;
  masalah: string | null;
  kategori: Kategori[];
  onUbah: (draf: Draf) => void;
  onHapus: () => void;
}) {
  return (
    <details open={masalah !== null} className="bg-card rounded-xl border">
      <summary className="hover:bg-muted/40 flex cursor-pointer list-none items-center gap-3 p-4">
        <span className="bg-muted grid size-7 shrink-0 place-items-center rounded-md font-mono text-xs font-semibold">
          {nomor}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm">
          {draf.prompt.trim() === "" ? "Soal baru" : draf.prompt}
        </span>
        <Badge variant={masalah ? "destructive" : "default"}>{masalah ?? "lengkap"}</Badge>
      </summary>

      <div className="grid gap-5 border-t p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor={`kat-${draf.kunci}`}>Kategori</Label>
            <SelectNative
              id={`kat-${draf.kunci}`}
              value={draf.categoryId}
              onChange={(e) => onUbah({ ...draf, categoryId: e.target.value })}
            >
              {kategori.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.code} — {k.name}
                </option>
              ))}
            </SelectNative>
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`sulit-${draf.kunci}`}>Tingkat kesulitan</Label>
            <SelectNative
              id={`sulit-${draf.kunci}`}
              value={draf.difficulty}
              onChange={(e) => onUbah({ ...draf, difficulty: e.target.value })}
            >
              {DIFFICULTY.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </SelectNative>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`tanya-${draf.kunci}`}>Isi pertanyaan</Label>
          <Textarea
            id={`tanya-${draf.kunci}`}
            rows={3}
            value={draf.prompt}
            onChange={(e) => onUbah({ ...draf, prompt: e.target.value })}
          />
        </div>

        <div className="grid gap-2">
          <span className="text-sm font-medium">Pilihan jawaban</span>
          <p className="text-muted-foreground text-sm">
            Slot kosong diabaikan. Tandai satu pilihan sebagai kunci jawaban.
          </p>
          {draf.opsi.map((isi, slot) => (
            <div key={slot} className="flex items-center gap-3">
              <label className="flex shrink-0 items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`benar-${draf.kunci}`}
                  checked={draf.benar === slot}
                  onChange={() => onUbah({ ...draf, benar: slot })}
                  className="accent-primary size-4"
                />
                <span className="font-mono">{OPTION_LABELS[slot]}</span>
              </label>
              <Input
                value={isi}
                placeholder={slot < 2 ? "Wajib" : "Opsional"}
                onChange={(e) =>
                  onUbah({
                    ...draf,
                    opsi: draf.opsi.map((x, i) => (i === slot ? e.target.value : x)),
                  })
                }
              />
            </div>
          ))}
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`bahas-${draf.kunci}`}>Pembahasan</Label>
          <Textarea
            id={`bahas-${draf.kunci}`}
            rows={3}
            value={draf.explanation}
            onChange={(e) => onUbah({ ...draf, explanation: e.target.value })}
          />
        </div>

        <div>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={onHapus}>
            <Trash2 />
            Keluarkan dari daftar
          </Button>
        </div>
      </div>
    </details>
  );
}
