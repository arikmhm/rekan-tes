/**
 * REST API Resend tanpa SDK; kredensial lewat argumen agar teruji tanpa `server-only`.
 *
 * ponytail: plain text saja; tambah HTML bila ada email yang butuh format.
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
    // Penerima tidak dicatat: data pribadi.
    throw new Error(`Resend menolak pengiriman (${response.status}): ${await response.text()}`);
  }
}

/** `Nama <alamat@domain>` → alamat; dipakai sebagai kontak di halaman legal. */
export function emailAddress(from: string) {
  return from.match(/<([^>]+)>/)?.[1].trim() ?? from.trim();
}
