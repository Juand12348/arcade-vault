"use server";

import { Resend } from "resend";

export type ContactState =
  | { status: "idle" }
  | { status: "success"; name: string }
  | { status: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVALID = "> REVISA LOS CAMPOS E INTÉNTALO DE NUEVO.";
const SEND_FAILED = "> ERROR AL ENVIAR. INTÉNTALO DE NUEVO.";

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  // Honeypot: un bot lo rellena; se responde como éxito para no dar pistas.
  if (String(formData.get("website") ?? "") !== "") return { status: "success", name: "JUGADOR" };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const msg = String(formData.get("msg") ?? "").trim();

  if (
    !name || name.length > 60 ||
    !email || email.length > 120 || !EMAIL_RE.test(email) ||
    !msg || msg.length > 2000
  ) {
    return { status: "error", message: INVALID };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return { status: "error", message: SEND_FAILED };

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: "Arcade Vault <onboarding@resend.dev>",
      to,
      replyTo: email,
      // Sin saltos de línea en el asunto: evita inyección de cabeceras.
      subject: `[Arcade Vault] Mensaje de ${name.replace(/\s+/g, " ")}`,
      text: `Nombre: ${name}\nCorreo: ${email}\n\n${msg}`,
    });
    if (error) return { status: "error", message: SEND_FAILED };
  } catch {
    return { status: "error", message: SEND_FAILED };
  }

  return { status: "success", name };
}
