# SPEC 03 — Página "Acerca de" y formulario de contacto con Resend

> **Estado:** Aprobado
> **Depende de:** SPEC 01, SPEC 02
> **Fecha:** 2026-11-26
> **Objetivo:** Crear la página `/acerca` de `references/templates/home-about/about.jsx` y hacer que su formulario de contacto envíe un correo real al equipo mediante Resend.

---

## Por qué existe esta spec

La SPEC 02 dejó fuera la pantalla "Acerca de" y su enlace en la nav. Esta es la primera funcionalidad del proyecto con backend: el formulario deja de ser simulado y envía un correo, lo que introduce una dependencia (`resend`), secretos en variables de entorno y un endpoint público que puede ser abusado. Por eso se registran aquí las decisiones de seguridad y de manejo de errores.

## Alcance

**Dentro:**

- Nueva página `/acerca` con las secciones de `about.jsx`:
  1. Hero `▸ ACERCA DE` con título, misión y 3 destacados con icono pixel (HEART, BROWSER, PLANT).
  2. Divisor decorativo de barras y 24 píxeles animados.
  3. Sección `▸ CONTACTO` con texto introductorio, 3 indicadores (RESPUESTA EN 24-48H, SUGERENCIAS BIENVENIDAS, SIN SPAM, JAMÁS) y formulario (NOMBRE, CORREO ELECTRÓNICO, MENSAJE).
- Envío del formulario con una Server Action que usa Resend y manda un correo a la dirección del equipo.
- Validación en servidor: nombre, correo y mensaje obligatorios, formato de correo y longitudes máximas.
- Honeypot: campo oculto que, si llega relleno, se descarta en silencio respondiendo como éxito.
- Estados del formulario: normal, enviando (botón deshabilitado), éxito (panel terminal "VAULT-OS // TERMINAL" con el nombre en mayúsculas y botón ENVIAR OTRO MENSAJE), error de validación (animación `shake`) y error de envío (mensaje inline, se conserva lo escrito).
- Nav: nuevo enlace "Acerca de" (`/acerca`) en la barra y en el panel móvil, con estado activo en `/acerca`.
- Reutilizar `components/reveal.tsx` (SPEC 02) para la animación de aparición.
- Portar a `app/globals.css` las clases de `references/templates/home-about/styles.css` que faltan (`about-*`, `highlight*`, `hl-*`, `div-*`, `contact-*`, `tip*`, `field`, `terminal-success`, `term-*`, `shake`).
- Variables de entorno y archivo `.env.example` con `RESEND_API_KEY` y `CONTACT_TO_EMAIL`.

**Fuera de alcance (para specs futuras):**

- Correo de acuse de recibo al visitante (exige dominio verificado en Resend).
- Dominio propio verificado en Resend: el remitente es `onboarding@resend.dev` hasta que exista.
- Rate limit por IP o CAPTCHA (requiere Redis/Upstash o un servicio externo).
- Guardar los mensajes en base de datos o panel de administración.
- Plantilla HTML del correo: el cuerpo es texto plano.
- Adjuntos o campos adicionales en el formulario.
- Contenido real de "Acerca de" distinto del de la plantilla (textos copiados literalmente).
- Tests automatizados (el proyecto no tiene framework de tests).
- Rediseño del tema existente.

## Modelo de datos

Estructuras nuevas, solo para el contacto.

```ts
// app/acerca/actions.ts  ("use server")
export type ContactState =
  | { status: "idle" }
  | { status: "success"; name: string }
  | { status: "error"; message: string };

export async function sendContact(prev: ContactState, formData: FormData): Promise<ContactState>;
```

Campos del `FormData`:

| Campo     | Regla                                              |
| --------- | -------------------------------------------------- |
| `name`    | obligatorio, `trim()`, máx. 60 caracteres          |
| `email`   | obligatorio, formato de correo, máx. 120 caracteres |
| `msg`     | obligatorio, `trim()`, máx. 2000 caracteres        |
| `website` | honeypot, debe llegar vacío                        |

Variables de entorno (solo servidor, nunca `NEXT_PUBLIC_`):

```
RESEND_API_KEY=       # clave de Resend
CONTACT_TO_EMAIL=     # destinatario del equipo
```

Convenciones:

- Remitente fijo: `Arcade Vault <onboarding@resend.dev>`.
- `replyTo` = correo del visitante; asunto: `[Arcade Vault] Mensaje de <nombre>`.
- Cuerpo en texto plano con nombre, correo y mensaje.
- Los textos del formulario y del panel de éxito se copian literalmente de `about.jsx`; el texto de error de envío es nuevo: `> ERROR AL ENVIAR. INTÉNTALO DE NUEVO.`

## Plan de implementación

Cada paso deja la app compilando y navegable.

1. Instalar la dependencia (`npm install resend`) y crear `.env.example` con las dos variables vacías. Confirmar que `.env*.local` está en `.gitignore`.
2. Portar el CSS: copiar a `app/globals.css` las clases de `styles.css` que faltan para About y contacto. No modificar las existentes.
3. Crear `app/acerca/page.tsx` (servidor) con hero, destacados con iconos SVG, divisor y la sección de contacto con el formulario estático (sin envío aún). Envolver las secciones con `Reveal`.
4. Crear `components/contact-form.tsx` (cliente) con `useActionState`, el estado visual de éxito (panel terminal) y el `shake` en error de validación. De momento llama a una acción que solo valida.
5. Crear `app/acerca/actions.ts` con `sendContact`: validación, honeypot y envío con Resend; devuelve `ContactState`. Si falta `RESEND_API_KEY` o `CONTACT_TO_EMAIL`, o Resend responde error, devuelve `status: "error"` sin lanzar excepción.
6. Nav: añadir "Acerca de" (`/acerca`) en `components/nav.tsx`, barra y panel móvil, con estado activo.
7. Pasada final: respetar `prefers-reduced-motion` en el divisor y el `shake`, comparar `/acerca` contra `references/templates/home-about/arcade-vault-standalone.html` y verificar el envío real con una clave de prueba.

Antes de escribir código, leer en `node_modules/next/dist/docs/` lo relativo a Server Actions, `useActionState` y `cacheComponents` (ver `CLAUDE.md`). El diseño se hace con `/frontend-design`, pero la referencia visual es la plantilla.

## Criterios de aceptación

- [ ] `npm run lint` termina sin errores.
- [ ] `npm run build` termina sin errores y genera `/acerca` junto con las rutas existentes.
- [ ] La consola del navegador no muestra errores ni avisos de hidratación en `/acerca`.
- [ ] `/acerca` muestra el título "ACERCA DE ARCADE VAULT", 3 destacados con icono, el divisor y el título "CONTÁCTANOS".
- [ ] La barra y el panel móvil muestran "Acerca de"; es el enlace activo en `/acerca` y lleva a esa ruta.
- [ ] Enviar el formulario con algún campo vacío no envía correo, aplica la animación `shake` y conserva lo escrito.
- [ ] Un correo con formato inválido o un campo por encima de su longitud máxima se rechaza en el servidor.
- [ ] Con datos válidos y claves correctas, llega un correo a `CONTACT_TO_EMAIL` con asunto `[Arcade Vault] Mensaje de <nombre>`, cuerpo con nombre, correo y mensaje, y `reply-to` igual al correo del visitante.
- [ ] Tras un envío correcto aparece el panel terminal con "MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS, <NOMBRE EN MAYÚSCULAS>.".
- [ ] ENVIAR OTRO MENSAJE vuelve al formulario vacío.
- [ ] Mientras se envía, el botón queda deshabilitado y no admite un segundo envío.
- [ ] Sin `RESEND_API_KEY` (o con una clave inválida) aparece el error `> ERROR AL ENVIAR. INTÉNTALO DE NUEVO.`, no aparece el panel de éxito y se conserva lo escrito.
- [ ] Con el campo honeypot relleno no se envía ningún correo y el usuario ve el estado de éxito.
- [ ] `RESEND_API_KEY` no aparece en el JS enviado al navegador ni en el código fuente del repositorio (`grep` de `re_` en `app/`, `components/` y `lib/` sin resultados).
- [ ] Con `prefers-reduced-motion: reduce` el divisor y el `shake` no se animan.
- [ ] A 375 px de ancho `/acerca` no tiene scroll horizontal.

## Decisiones tomadas y descartadas

- **Sí:** Server Action. La clave de Resend queda en el servidor, no hay endpoint público que documentar y es lo idiomático en App Router.
- **No:** Route Handler `/api/contact`. Solo aporta si se llama desde fuera de la app; se puede añadir después.
- **Sí:** ruta `/acerca`. Sigue la convención en español de `/juegos` y `/salon`.
- **No:** `/about`. Rompe esa convención.
- **Sí:** el correo llega solo al equipo, con `replyTo` del visitante. Es lo mínimo que cumple el objetivo y funciona sin dominio verificado.
- **No:** acuse de recibo al visitante. Con `onboarding@resend.dev` Resend solo entrega a la cuenta propietaria, y además duplica el riesgo de abuso.
- **Sí:** validación en servidor más honeypot. Frena bots simples sin dependencias ni servicios nuevos.
- **No:** rate limit o CAPTCHA. Requieren infraestructura externa; se registran como riesgo y se abordan en otra spec si hay abuso.
- **Sí:** el honeypot responde "éxito" para no dar pistas al bot.
- **Sí:** mostrar el error de envío y conservar lo escrito. El panel de éxito del prototipo solo se muestra con envío confirmado, porque fingir éxito pierde mensajes.
- **No:** copiar el éxito simulado del prototipo (`setSent` inmediato).
- **Sí:** reutilizar `Reveal` de la SPEC 02 en lugar del `useReveal` global de la plantilla (mismo criterio que la SPEC 02).
- **Sí:** correo en texto plano. Una plantilla HTML añade trabajo sin valor para el equipo receptor.
- **Sí:** `ContactForm` es el único componente cliente nuevo; la página es de servidor.

## Riesgos

| Riesgo | Mitigación |
| ------ | ---------- |
| Un endpoint público que envía correos puede usarse para spam o agotar la cuota de Resend. | Validación y límites de longitud en servidor, honeypot y destinatario fijo desde `CONTACT_TO_EMAIL` (el visitante no controla el destino). Rate limit queda fuera de alcance. |
| Inyección de cabeceras vía nombre o correo. | El nombre se usa solo en el asunto tras eliminar saltos de línea; el correo se valida con formato estricto antes de usarlo como `replyTo`. |
| Sin dominio verificado, Resend solo entrega a la dirección de la cuenta propietaria. | `CONTACT_TO_EMAIL` debe ser el correo de la cuenta de Resend hasta verificar un dominio; se documenta en `.env.example`. |
| Faltan variables de entorno en despliegue. | `sendContact` devuelve `status: "error"` sin lanzar excepción; el usuario ve el mensaje de error. |
| `cacheComponents: true` afecta a la página o a la Server Action. | La página es estática; la acción no lee datos cacheables. Revisar la documentación local antes de codificar. |
| Las clases CSS de About chocan con las existentes de `globals.css` (`.field`, `.shake`, `.kicker`). | Revisar colisiones antes de portar; si hay choque, nombrar la nueva con prefijo `about-` y registrarlo. |

## Qué **no** está en esta spec

- Acuse de recibo al visitante.
- Dominio propio verificado en Resend.
- Rate limit o CAPTCHA.
- Almacenar mensajes o panel de administración.
- Plantilla HTML del correo y adjuntos.
- Tests automatizados.
- Rediseño del tema visual.

Cada uno de estos puntos, si se aborda, va en su propia spec.
