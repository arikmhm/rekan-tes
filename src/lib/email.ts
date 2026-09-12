/**
 * Pengiriman email lewat REST API Resend. SDK `resend` tidak dipasang karena
 * satu POST JSON tidak membutuhkannya.
 *
 * Fungsi ini murni terhadap environment: kredensial diterima sebagai argumen
 * sehingga modul tidak perlu guard `server-only` dan tetap dapat diuji.
 *
 * ponytail: hanya plain text. Tambahkan versi HTML ketika ada email yang
 * memang membutuhkan format, bukan untuk tautan verifikasi dan reset.
 */
export async function sendEmail(message: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  text: string;
}) {
  const { apiKey, ...payload } = message;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // Alamat penerima tidak ikut dicatat agar log tidak menyimpan data pribadi.
    throw new Error(`Resend menolak pengiriman (${response.status}): ${await response.text()}`);
  }
}

/**
 * Alamat saja dari `EMAIL_FROM` yang berbentuk `Nama <alamat@domain>`. Halaman
 * legal memakainya sebagai kontak, sehingga kontak ikut berubah begitu domain
 * pengirim diganti dan tidak ada alamat kedua yang perlu dijaga.
 */
export function emailAddress(from: string) {
  return from.match(/<([^>]+)>/)?.[1].trim() ?? from.trim();
}
