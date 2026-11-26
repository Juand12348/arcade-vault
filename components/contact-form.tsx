"use client";

import { useActionState, useEffect, useState } from "react";
import { sendContact, type ContactState } from "@/app/acerca/actions";

const IDLE: ContactState = { status: "idle" };

// Al cambiar la key se remonta el formulario: vuelve vacío y con el estado de la acción reiniciado.
export function ContactForm() {
  const [key, setKey] = useState(0);
  return <Form key={key} onReset={() => setKey((k) => k + 1)} />;
}

function Form({ onReset }: { onReset: () => void }) {
  const [state, action, pending] = useActionState(sendContact, IDLE);
  // Controlados: React vacía los campos no controlados tras cada acción y se perdería lo escrito si hay error.
  const [fields, setFields] = useState({ name: "", email: "", msg: "" });
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (!shake) return;
    const t = setTimeout(() => setShake(false), 400);
    return () => clearTimeout(t);
  }, [shake]);

  const set = (k: keyof typeof fields) => (e: { target: { value: string } }) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      className={"contact-form" + (shake ? " shake" : "")}
      action={action}
      noValidate
      onSubmit={(e) => {
        if (!fields.name.trim() || !fields.email.trim() || !fields.msg.trim()) {
          e.preventDefault();
          setShake(true);
        }
      }}
    >
      {state.status === "success" ? (
        <div className="terminal-success">
          <div className="term-bar">
            <span className="dot r"></span><span className="dot y"></span><span className="dot g"></span>
            <span className="term-title">VAULT-OS // TERMINAL</span>
          </div>
          <div className="term-body">
            <div className="line"><span className="prompt">vault@arcade:~$</span> ./send_message --to=team</div>
            <div className="line dim">[OK] Conectando con servidor…</div>
            <div className="line dim">[OK] Validando contenido…</div>
            <div className="line dim">[OK] Transmitiendo paquete…</div>
            <div className="line success" role="status">
              &gt; MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS, {state.name.toUpperCase()}.<span className="caret">_</span>
            </div>
            <div style={{ marginTop: 18 }}>
              <button className="btn ghost" type="button" onClick={onReset}>ENVIAR OTRO MENSAJE</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="field">
            <label htmlFor="name">NOMBRE</label>
            <input id="name" name="name" maxLength={60} value={fields.name} onChange={set("name")} placeholder="px_kai" />
          </div>
          <div className="field">
            <label htmlFor="email">CORREO ELECTRÓNICO</label>
            <input id="email" name="email" type="email" maxLength={120} value={fields.email} onChange={set("email")} placeholder="jugador@vault.gg" />
          </div>
          <div className="field">
            <label htmlFor="msg">MENSAJE</label>
            <textarea id="msg" name="msg" rows={5} maxLength={2000} value={fields.msg} onChange={set("msg")} placeholder="Cuéntanos qué tienes en mente…"></textarea>
          </div>
          {/* Honeypot: fuera de pantalla y fuera del orden de tabulación; un humano no lo rellena. */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
            <label htmlFor="website">NO RELLENAR</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          {state.status === "error" && (
            <div role="alert" style={{ color: "var(--magenta)", fontFamily: "var(--mono)", fontSize: 12, marginBottom: 12 }}>
              {state.message}
            </div>
          )}
          <button className="btn xl press" type="submit" disabled={pending} style={{ width: "100%" }}>
            {pending ? "ENVIANDO…" : "▶  ENVIAR MENSAJE"}
          </button>
        </>
      )}
    </form>
  );
}
