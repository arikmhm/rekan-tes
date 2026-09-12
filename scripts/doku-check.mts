/**
 * Memeriksa kredensial DOKU dengan memanggil sandbox sungguhan: ambil access
 * token, lalu terbitkan satu QRIS percobaan.
 *
 * Dijalankan dengan `pnpm doku:check`. Skrip ini memakai `src/lib/doku.ts` yang
 * sama dengan aplikasi, supaya "lolos di sini" benar-benar berarti jalur
 * pembayaran ikut lolos, bukan hanya salinan logika tanda tangan.
 */
import { accessToken, externalId, generateQris, invoiceNumber } from "../src/lib/doku.ts";
import { parseDokuEnv } from "../src/lib/env-schema.ts";

process.loadEnvFile(".env.local");

const kredensial = parseDokuEnv(process.env);
console.log(`Basis API : ${kredensial.baseUrl}`);
console.log(`Client ID : ${kredensial.clientId}`);
console.log(`Merchant  : ${kredensial.merchantId} / terminal ${kredensial.terminalId}\n`);

let token: string;
try {
  token = await accessToken(kredensial);
} catch (error) {
  const pesan = error instanceof Error ? error.message : String(error);
  console.error(`✗ ${pesan}`);

  // Dua kegagalan ini punya penyebab yang khas; sisanya biarkan apa adanya.
  if (pesan.includes("Unauthorized. Signature")) {
    console.error(
      "\nDOKU mengenali Client ID tetapi tidak dapat memverifikasi tanda tangan.\n" +
        "Daftarkan public key `doku-public.pem` di DOKU Back Office (Sandbox),\n" +
        "pada menu kredensial SNAP, lalu jalankan ulang perintah ini.",
    );
  } else if (pesan.includes("Unknown Client")) {
    console.error("\nDOKU tidak mengenali DOKU_CLIENT_ID. Periksa nilainya di Back Office.");
  }

  process.exit(1);
}

console.log(`✓ Access token B2B diterima (${token.length} karakter).`);

const qris = await generateQris(kredensial, {
  partnerReferenceNo: invoiceNumber(),
  externalId: externalId(),
  // Nominal kecil; QRIS percobaan ini tidak perlu dibayar.
  amount: 1000,
  validMinutes: 5,
});

console.log(`✓ QRIS terbit. referenceNo ${qris.referenceNo}`);
console.log(`  berlaku sampai ${qris.expiresAt.toISOString()}`);
console.log(`  qrContent ${qris.qrContent.slice(0, 40)}… (${qris.qrContent.length} karakter)`);
