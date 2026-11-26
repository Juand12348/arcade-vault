"use server";

export type ContactState =
  | { status: "idle" }
  | { status: "success"; name: string }
  | { status: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Paso 4: solo valida. El envío con Resend se añade en el paso 5.
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
    return { status: "error", message: "> REVISA LOS CAMPOS E INTÉNTALO DE NUEVO." };
  }

  return { status: "success", name };
}
