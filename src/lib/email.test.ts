import { afterEach, expect, test, vi } from "vitest";

import { emailAddress, sendEmail } from "./email";

const pesan = {
  apiKey: "re_kunci_uji",
  from: "Rekan Tes <onboarding@resend.dev>",
  to: "peserta@contoh.test",
  subject: "Subjek",
  text: "Isi",
};

afterEach(() => vi.unstubAllGlobals());

function stubFetch(response: Response) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

test("mengirim ke Resend dan tidak membocorkan key ke body", async () => {
  const fetchMock = stubFetch(new Response('{"id":"abc"}', { status: 200 }));

  await sendEmail(pesan);

  const [url, init] = fetchMock.mock.calls[0];
  expect(url).toBe("https://api.resend.com/emails");
  expect(init.headers.Authorization).toBe("Bearer re_kunci_uji");
  expect(JSON.parse(init.body)).toEqual({
    from: pesan.from,
    to: pesan.to,
    subject: "Subjek",
    text: "Isi",
  });
});

test("kegagalan Resend dilempar, tidak ditelan diam-diam", async () => {
  stubFetch(new Response('{"message":"domain not verified"}', { status: 403 }));

  await expect(sendEmail(pesan)).rejects.toThrow(/403/);
});

test("pesan error tidak memuat alamat penerima", async () => {
  stubFetch(new Response("gagal", { status: 500 }));

  const error = await sendEmail({ ...pesan, to: "rahasia@contoh.test" }).catch((e: Error) => e);

  expect(error).toBeInstanceOf(Error);
  expect((error as Error).message).toContain("500");
  expect((error as Error).message).not.toContain("rahasia@contoh.test");
});

test("alamat kontak diambil dari EMAIL_FROM", () => {
  expect(emailAddress("Rekan Tes <onboarding@resend.dev>")).toBe("onboarding@resend.dev");
  expect(emailAddress("  halo@rekantes.id  ")).toBe("halo@rekantes.id");
});
