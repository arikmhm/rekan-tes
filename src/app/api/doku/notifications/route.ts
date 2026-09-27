import { NextResponse } from "next/server";

import { NOTIFICATION_PATH, parseQrisNotification, verifyNotificationSignature } from "@/lib/doku";
import { parseDokuEnv } from "@/lib/env-schema";
import { activatePayment } from "@/lib/webhook";

/** Path harus sama persis dengan `NOTIFICATION_PATH` (ikut ditandatangani). */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const { secretKey } = parseDokuEnv(process.env);

  const valid = verifyNotificationSignature(
    secretKey,
    {
      clientId: request.headers.get("Client-Id") ?? "",
      requestId: request.headers.get("Request-Id") ?? "",
      timestamp: request.headers.get("Request-Timestamp") ?? "",
      target: NOTIFICATION_PATH,
      rawBody,
    },
    request.headers.get("Signature"),
  );

  if (!valid) {
    console.error("Notifikasi DOKU ditolak: signature tidak valid.");
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const notifikasi = parseQrisNotification(payload);
  if (!notifikasi) {
    // Body tidak dicatat: dapat memuat data pelanggan pihak DOKU.
    console.error("Notifikasi DOKU ditolak: payload tidak lengkap.");
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  // Best practice DOKU: status non-sukses diakui tanpa mengubah apa pun.
  if (notifikasi.status !== "SUCCESS") {
    return NextResponse.json({ received: true });
  }

  const hasil = await activatePayment(notifikasi);

  if (hasil.result === "not_found" || hasil.result === "amount_mismatch") {
    // Invoice asing atau nominal janggal: penipuan atau salah konfigurasi.
    console.error("Notifikasi DOKU ditolak:", hasil.result, notifikasi.invoiceNumber, notifikasi.amount);
    return NextResponse.json({ error: hasil.result }, { status: 400 });
  }

  // Membedakan "webhook tak pernah tiba" dari "tiba dan berhasil" di log.
  console.log("Notifikasi DOKU diproses:", hasil.result, notifikasi.invoiceNumber);

  return NextResponse.json({ received: true });
}
