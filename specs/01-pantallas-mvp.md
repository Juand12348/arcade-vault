# SPEC 01 — Pantallas visuales del MVP de Arcade Vault

> **Estado:** Aprobado
> **Depende de:** Ninguna
> **Fecha:** 2026-11-25
> **Objetivo:** Portar a Next.js (App Router) las cinco pantallas de `references/templates/` (biblioteca, detalle, reproductor, autenticación y salón de la fama) con datos simulados y sin lógica de juego real.

---

## Por qué existe esta spec

El repositorio solo tiene el scaffold de Create Next App. El diseño ya existe como prototipo React-vía-CDN en `references/templates/` (JSX con `window.*` y navegación por hash). Esta spec lo traslada a la arquitectura real del proyecto (App Router, TypeScript, rutas reales) para tener un MVP navegable. Los juegos reales quedan para specs posteriores.

El tema visual (variables, clases `av-*`, `btn`, `card`, `crt`, `modal`, etc.) ya fue portado a `app/globals.css`, y las fuentes ya están cargadas en `app/layout.tsx`. Esta spec **no rediseña nada**: reproduce el prototipo con fidelidad.

## Alcance

**Dentro:**

- Cinco pantallas con las mismas clases CSS, textos y comportamiento visual que la plantilla:
  - Biblioteca (`/`): hero, búsqueda por nombre, chips de categoría, grilla de tarjetas con efecto tilt, estado vacío "NO HAY RESULTADOS".
  - Detalle (`/juegos/[id]`): portada, etiquetas, descripción, franja de estadísticas, botones y tabla "MEJORES PUNTUACIONES" (10 filas).
  - Reproductor (`/juegos/[id]/jugar`): HUD (jugador, puntuación, vidas, nivel), botones PAUSA/FIN/SALIR, pantalla CRT decorativa, overlay de pausa y modal "FIN DEL JUEGO" con guardado de puntuación.
  - Autenticación (`/auth`): pestañas INICIAR SESIÓN / CREAR CUENTA, campo de correo solo en registro, botón de invitado, botones sociales sin acción.
  - Salón de la Fama (`/salon`): pestañas por juego, podio top 3, tabla de 12 filas y fila "TU MEJOR MARCA" cuando hay sesión.
- Navegación superior con enlaces, contador "CRÉDITOS · 03" estático, botón de sesión y menú móvil (panel lateral con backdrop). Pie de página.
- Datos simulados tipados: los 8 juegos, las categorías, el generador `seededScores` y la lista de jugadores.
- Sesión simulada en `localStorage` (clave `av_user`).
- Guardado de puntuaciones del reproductor en `localStorage` (clave `av_scores`).
- Reemplazo del contenido scaffold de `app/page.tsx`.

**Fuera de alcance (para specs futuras):**

- Lógica real de cualquiera de los 8 juegos (el reproductor es una simulación).
- Autenticación real: validación de credenciales, base de datos, OAuth de Google/GitHub, cookies o sesiones de servidor.
- Backend, API o base de datos para puntuaciones y rankings.
- Mezclar las puntuaciones guardadas en `av_scores` con los rankings del detalle o del salón (solo se guardan).
- Sistema de créditos real (el contador es texto fijo).
- Tests automatizados (el proyecto no tiene framework de tests).
- Cambios al tema en `app/globals.css`, salvo que falte una clase usada por una pantalla.

## Modelo de datos

Estructuras nuevas en TypeScript. Los valores son los de `references/templates/data.jsx`.

```ts
// lib/games.ts
export type Category = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type Game = {
  id: string;        // "bloque-buster", "caida", "serpentina", "gloton", "invasores", "rocas", "ranaria", "duelo-pixel"
  title: string;
  short: string;
  long: string;
  cat: Category;
  cover: string;     // clase CSS, p. ej. "cover-bricks"
  color: "cyan" | "magenta" | "yellow" | "green";
  best: number;
  plays: string;     // ya formateado, p. ej. "12.4K"
};
export const GAMES: Game[];
export const CATS: ["TODOS", ...Category[]];

// lib/scores.ts
export type ScoreRow = { rank: number; name: string; score: number; date: string }; // date: "DD/MM/2026"
export function seededScores(seed: number, count?: number): ScoreRow[]; // determinista, mismo algoritmo que la plantilla
export type SavedScore = { game: string; score: number; name: string; at: number };
export function saveScore(entry: Omit<SavedScore, "at">): void; // push a localStorage "av_scores"

// lib/session.tsx
export type User = { name: string }; // mayúsculas, máx. 10 caracteres
// Contexto cliente: { user: User | null, login(u: User | null), signOut() }
```

Convenciones:

- Semillas: detalle usa `id.length * 17 + 3` con 10 filas; salón usa `id.length * 23 + 7` con 12 filas. Idénticas a la plantilla para que los rankings coincidan con el prototipo.
- Números con `toLocaleString("es-ES")`.
- Nombre de usuario: `(texto || "PLAYER1").toUpperCase().slice(0, 10)`.
- Invitado: `user === null`; el reproductor muestra "INVITADO".

## Plan de implementación

Cada paso deja la app compilando y navegable.

1. Crear `lib/games.ts` y `lib/scores.ts` con los datos y `seededScores` (puerto literal de `data.jsx`, tipado). Sin cambios visuales aún.
2. Crear `lib/session.tsx` (`"use client"`): `SessionProvider` y hook `useSession`. Lee `av_user` en un `useEffect` para evitar errores de hidratación. Envolver `children` en `app/layout.tsx`.
3. Crear `components/nav.tsx` (cliente): enlaces Biblioteca / Salón de la Fama con estado activo según `usePathname()` (Biblioteca también activa en `/juegos/*`), contador de créditos, botón de sesión y menú móvil. Agregar `<Nav />`, `<main className="av-main">` y el pie de página a `app/layout.tsx`.
4. Biblioteca: reemplazar `app/page.tsx` por el hero y un componente cliente `components/library.tsx` con búsqueda, chips y grilla. Crear `components/game-card.tsx` con el tilt. Cada tarjeta navega a `/juegos/[id]`.
5. Detalle: crear `app/juegos/[id]/page.tsx` (componente servidor, `await params`, `generateStaticParams` con `GAMES`, `notFound()` si el id no existe). Botón JUGAR AHORA va a `/juegos/[id]/jugar` y VOLVER AL VAULT va a `/`.
6. Autenticación: crear `app/auth/page.tsx` y `components/auth-form.tsx` (cliente). Enviar el formulario llama a `login` y redirige a `/`. JUGAR COMO INVITADO llama a `login(null)` y redirige a `/`.
7. Salón de la Fama: crear `app/salon/page.tsx` y `components/hall-of-fame.tsx` (cliente, estado de pestaña local). Incluir podio, tabla y fila "TU MEJOR MARCA" cuando hay sesión.
8. Reproductor: crear `app/juegos/[id]/jugar/page.tsx` y `components/game-player.tsx` (cliente) con HUD, pausa, FIN, modal de guardado (usa `saveScore`) y reinicio. SALIR vuelve a `/juegos/[id]`.
9. Pasada final: revisar que no queden restos del scaffold, correr `npm run lint` y `npm run build`, y comparar cada pantalla contra `references/templates/Arcade Vault.html`.

Antes de escribir código, leer en `node_modules/next/dist/docs/` lo relativo a `params` asíncronos, `generateStaticParams` y `cacheComponents` (ver `CLAUDE.md`). El diseño de la interfaz se hace con `/frontend-design`, pero la referencia visual es la plantilla.

## Criterios de aceptación

- [ ] `npm run lint` termina sin errores.
- [ ] `npm run build` termina sin errores y genera las rutas `/`, `/auth`, `/salon`, `/juegos/[id]` y `/juegos/[id]/jugar`.
- [ ] La consola del navegador no muestra errores ni avisos de hidratación en ninguna de las cinco pantallas.
- [ ] `/` muestra 8 tarjetas; escribir "caí" deja solo CAÍDA; elegir el chip SHOOTER deja INVASORES y ROCAS.
- [ ] Una búsqueda sin coincidencias muestra "NO HAY RESULTADOS".
- [ ] Hacer clic en una tarjeta o en su botón JUGAR navega a `/juegos/[id]`.
- [ ] `/juegos/caida` muestra título, descripción, 4 etiquetas, 3 estadísticas y 10 filas de puntuaciones, con las 3 primeras destacadas.
- [ ] `/juegos/no-existe` devuelve la página 404.
- [ ] JUGAR AHORA lleva al reproductor; el HUD muestra puntuación creciente, 3 vidas y nivel 01.
- [ ] PAUSA detiene la puntuación y muestra "EN PAUSA"; REANUDAR la reactiva.
- [ ] FIN abre el modal "FIN DEL JUEGO" con la puntuación final; GUARDAR PUNTUACIÓN muestra "PUNTUACIÓN GUARDADA_" y agrega una entrada a `localStorage["av_scores"]`.
- [ ] JUGAR DE NUEVO reinicia puntuación, vidas, nivel y cierra el modal.
- [ ] En `/auth`, la pestaña CREAR CUENTA muestra el campo de correo; la pestaña INICIAR SESIÓN lo oculta.
- [ ] Enviar el formulario con usuario "kai" guarda `{"name":"KAI"}` en `localStorage["av_user"]`, redirige a `/` y la barra muestra "KAI ▾".
- [ ] Con el formulario vacío, el nombre guardado es `PLAYER1`.
- [ ] JUGAR COMO INVITADO redirige a `/` y la barra muestra "Iniciar Sesión".
- [ ] Hacer clic en "KAI ▾" cierra la sesión y borra `av_user`.
- [ ] Recargar la página con sesión iniciada mantiene el nombre en la barra.
- [ ] `/salon` muestra una pestaña por juego (8), el podio con 01 al centro y 12 filas; cambiar de pestaña cambia los datos.
- [ ] En `/salon`, la fila "TU MEJOR MARCA EN <JUEGO>" aparece solo con sesión iniciada.
- [ ] El enlace activo de la barra es el correcto en `/`, `/juegos/*` y `/salon`.
- [ ] A 375 px de ancho aparece el botón `≡`, y abre y cierra el panel móvil con backdrop.
- [ ] Los datos de ranking son idénticos entre recargas (generador determinista).

## Decisiones tomadas y descartadas

- **Sí:** rutas reales del App Router (`/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/auth`, `/salon`). URLs compartibles y recomendado por Next.
- **No:** copiar la navegación por hash JSON de la plantilla. Va contra el App Router y no permite enlaces directos.
- **Sí:** sesión simulada en `localStorage` (`av_user`), igual que la plantilla. Coherente con "solo parte visual".
- **No:** cookie o sesión de servidor. Más código sin valor visual; se decide en una spec de autenticación real.
- **Sí:** datos tipados en `lib/games.ts` y `lib/scores.ts`; `seededScores` conserva el algoritmo y las semillas de la plantilla.
- **Sí:** el reproductor guarda en `localStorage["av_scores"]`, pero el salón y el detalle no leen esos datos.
- **No:** mezclar puntuaciones guardadas con el ranking. Roza lógica funcional y requiere definir reglas de ordenación.
- **Sí:** el reproductor mantiene la simulación de la plantilla (puntos aleatorios cada 220 ms, arena decorativa). El usuario pidió explícitamente no implementar juegos.
- **Sí:** el estado de filtros (búsqueda, categoría, pestaña del salón) vive en estado local de React, como en la plantilla.
- **No:** guardar esos filtros en la URL. Se puede añadir después sin cambiar las rutas.
- **Sí:** el reproductor es accesible sin sesión (modo invitado), como en la plantilla.
- **Sí:** reutilizar `app/globals.css` y las fuentes de `app/layout.tsx` ya portadas, sin tocarlos salvo clase faltante.

## Riesgos

| Riesgo | Mitigación |
| ------ | ---------- |
| `cacheComponents: true` rompe páginas que leen datos dinámicos o `params` sin preparación. | Usar `generateStaticParams` en las rutas con `[id]`, y leer `localStorage` solo en `useEffect` de componentes cliente. Revisar la documentación local antes de codificar. |
| Errores de hidratación por leer `localStorage` en el render inicial. | El `SessionProvider` empieza con `user = null` y lo rellena en `useEffect`. |
| La plantilla usa clases que no estén en `app/globals.css`. | La comparación visual del paso 9 detecta clases faltantes; se añaden a `globals.css` sin cambiar las existentes. |
| Navegar a `/juegos/[id]/jugar` con un id inexistente. | `notFound()` también en la ruta del reproductor. |
| `localStorage` deshabilitado (modo privado). | Envolver lecturas y escrituras en `try/catch`, como la plantilla; la app funciona sin persistir. |

## Qué **no** está en esta spec

- Lógica real de los juegos.
- Autenticación real, OAuth, base de datos o API.
- Rankings que incluyan las puntuaciones guardadas por el jugador.
- Créditos funcionales.
- Tests automatizados.
- Rediseño del tema visual.

Cada uno de estos puntos, si se aborda, va en su propia spec.
